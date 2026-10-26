import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EcosystemUserAccount, AuthSession } from '../types';
import { 
  subscribeToEcosystemUsers, 
  authenticateWithFirebaseAuth, 
  signOutFirebaseAuth,
  PRIMARY_ADMIN_EMAIL,
  INITIAL_ECOSYSTEM_USERS
} from '../lib/firebase';
import { verifyTotpToken, getCurrentTotp, getRemainingTOTPSeconds, DEFAULT_TOTP_SECRET } from '../lib/totp';

const SESSION_STORAGE_KEY = 'agronomatrix_auth_session';
const SESSION_DURATION_HOURS = 12;

interface AuthContextType {
  user: EcosystemUserAccount | null;
  pendingUser: EcosystemUserAccount | null;
  step: 'credentials' | 'totp';
  isAuthenticated: boolean;
  isLocked: boolean;
  session: AuthSession | null;
  ecosystemUsers: EcosystemUserAccount[];
  remainingSeconds: number;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  verifyCredentials: (emailOrUser: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyGoogleAuthenticator: (totpCode: string) => Promise<{ success: boolean; error?: string }>;
  cancelTwoFactor: () => void;
  logout: () => void;
  lockSession: () => void;
  unlockSession: (totpCode: string) => Promise<{ success: boolean; error?: string }>;
  getLiveCode: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ecosystemUsers, setEcosystemUsers] = useState<EcosystemUserAccount[]>(() => {
    try {
      const cached = localStorage.getItem('cacao_ecosystem_users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ECOSYSTEM_USERS;
  });
  const [user, setUser] = useState<EcosystemUserAccount | null>(null);
  const [pendingUser, setPendingUser] = useState<EcosystemUserAccount | null>(null);
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(getRemainingTOTPSeconds());

  // Subscribe to real-time users from Firestore (collection `records`, category `ecosystem_users`)
  useEffect(() => {
    const unsubscribe = subscribeToEcosystemUsers((users) => {
      if (users && users.length > 0) {
        setEcosystemUsers(users);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync remaining seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(getRemainingTOTPSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Restore authenticated session from localStorage on startup
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (rawSession) {
        const parsed: AuthSession = JSON.parse(rawSession);
        const expiresAt = new Date(parsed.expiresAt).getTime();
        const now = Date.now();

        if (expiresAt > now && parsed.user) {
          setUser(parsed.user);
          setSession(parsed);
          setIsLocked(false);
          setStep('credentials');
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setUser(null);
          setSession(null);
        }
      }
    } catch (err) {
      console.error('Error al restaurar sesión previa:', err);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  /**
   * PASO 1: Validación estricta con coincidencia EXACTA de correo y contraseña guardados en el ecosistema
   */
  const verifyCredentials = useCallback(
    async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
      setLoginError(null);
      const cleanEmail = (emailInput || '').trim().toLowerCase();
      const cleanPass = (passwordInput || '').trim();

      if (!cleanEmail) {
        const err = 'Por favor ingresa tu correo electrónico corporativo registrado.';
        setLoginError(err);
        return { success: false, error: err };
      }

      if (!cleanPass) {
        const err = 'Por favor ingresa tu contraseña de acceso.';
        setLoginError(err);
        return { success: false, error: err };
      }

      // 1. Buscar coincidencia EXACTA del correo en las cuentas del ecosistema
      const matchedUser = ecosystemUsers.find(
        (u) => (u.email || '').trim().toLowerCase() === cleanEmail
      );

      if (!matchedUser) {
        const err = 'El correo electrónico no coincide con ninguna cuenta registrada en el ecosistema.';
        setLoginError(err);
        return { success: false, error: err };
      }

      // 2. Verificar coincidencia EXACTA de la contraseña con la guardada en la base de datos
      const expectedPassword = (matchedUser.password || '').trim();
      if (!expectedPassword || cleanPass !== expectedPassword) {
        const err = 'La contraseña ingresada no coincide con la registrada para esta cuenta.';
        setLoginError(err);
        return { success: false, error: err };
      }

      // 3. Validar estado de la cuenta
      if (matchedUser.status === 'suspended') {
        const err = 'Esta cuenta se encuentra temporalmente suspendida en el sistema.';
        setLoginError(err);
        return { success: false, error: err };
      }

      // 4. Validar que la cuenta tenga permisos para la Central de Beneficio
      const hasCentralAccess =
        matchedUser.isPrimary ||
        (matchedUser.assignedApps && matchedUser.assignedApps.includes('central')) ||
        (matchedUser.assignedApps && matchedUser.assignedApps.includes('admin')) ||
        matchedUser.role.toLowerCase().includes('central') ||
        matchedUser.role.toLowerCase().includes('admin') ||
        matchedUser.role.toLowerCase().includes('director');

      if (!hasCentralAccess) {
        const err = 'Acceso denegado: Esta cuenta no tiene permisos para acceder a la Central de Beneficio.';
        setLoginError(err);
        return { success: false, error: err };
      }

      // 5. Sincronizar / validar con el servicio de Firebase Authentication
      try {
        await authenticateWithFirebaseAuth(cleanEmail, cleanPass);
      } catch (fbErr) {
        console.warn('Firebase Auth sincronización:', fbErr);
      }

      // Solo si el correo Y la contraseña coinciden EXACTAMENTE, pasar a preguntar el código de Google Authenticator
      setPendingUser(matchedUser);
      setStep('totp');
      setLoginError(null);

      return { success: true };
    },
    [ecosystemUsers]
  );

  /**
   * PASO 2: Verificación del código de 6 dígitos de Google Authenticator
   */
  const verifyGoogleAuthenticator = useCallback(
    async (totpCode: string): Promise<{ success: boolean; error?: string }> => {
      setLoginError(null);

      if (!pendingUser) {
        const err = 'No hay usuario en proceso de verificación. Inicia sesión nuevamente.';
        setLoginError(err);
        return { success: false, error: err };
      }

      const secretToVerify = pendingUser.totpSecret || DEFAULT_TOTP_SECRET;
      const isValid = await verifyTotpToken(secretToVerify, totpCode);

      if (!isValid) {
        const err = 'Código de Google Authenticator incorrecto. Verifica el código dinámico de 6 dígitos en tu aplicación móvil.';
        setLoginError(err);
        return { success: false, error: err };
      }

      // Código verificado exitosamente: Dejar ingresar a la aplicación
      const now = new Date();
      const expires = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

      const newSession: AuthSession = {
        user: pendingUser,
        token: `agronomatrix_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        authenticatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      };

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      } catch (e) {
        console.warn('Error al guardar sesión en localStorage:', e);
      }

      setUser(pendingUser);
      setSession(newSession);
      setPendingUser(null);
      setStep('credentials');
      setIsLocked(false);
      setLoginError(null);

      return { success: true };
    },
    [pendingUser]
  );

  const cancelTwoFactor = useCallback(() => {
    setPendingUser(null);
    setStep('credentials');
    setLoginError(null);
  }, []);

  const logout = useCallback(() => {
    signOutFirebaseAuth();
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setSession(null);
    setPendingUser(null);
    setStep('credentials');
    setIsLocked(false);
    setLoginError(null);
  }, []);

  const lockSession = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockSession = useCallback(
    async (totpCode: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No hay sesión activa para desbloquear.' };
      }
      const secret = user.totpSecret || DEFAULT_TOTP_SECRET;
      const isValid = await verifyTotpToken(secret, totpCode);
      if (!isValid) {
        return { success: false, error: 'Código de Google Authenticator incorrecto.' };
      }
      setIsLocked(false);
      return { success: true };
    },
    [user]
  );

  const getLiveCode = useCallback(async (): Promise<string> => {
    const targetSecret = pendingUser?.totpSecret || user?.totpSecret || DEFAULT_TOTP_SECRET;
    const { token } = await getCurrentTotp(targetSecret);
    return token;
  }, [pendingUser, user]);

  const value: AuthContextType = {
    user,
    pendingUser,
    step,
    isAuthenticated: !!user && !!session && !isLocked,
    isLocked,
    session,
    ecosystemUsers,
    remainingSeconds,
    loginError,
    setLoginError,
    verifyCredentials,
    verifyGoogleAuthenticator,
    cancelTwoFactor,
    logout,
    lockSession,
    unlockSession,
    getLiveCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
