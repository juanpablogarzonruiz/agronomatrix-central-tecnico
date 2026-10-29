import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EcosystemUserAccount, AuthSession } from '../types';
import { 
  subscribeToEcosystemUsers, 
  authenticateWithFirebaseAuth, 
  signOutFirebaseAuth,
  PRIMARY_ADMIN_EMAIL,
  INITIAL_ECOSYSTEM_USERS,
  auth,
  resolveAuthorizedCentralProfile,
  signInWithGooglePopup,
  linkGoogleToCurrentUser
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
  signInGoogle: () => Promise<{ success: boolean; error?: string }>;
  linkGoogleAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
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
  const [pendingGoogleUid, setPendingGoogleUid] = useState<string | null>(null);
  const [pendingGoogleLogin, setPendingGoogleLogin] = useState(false);
  const googleOperationalAccessEnabled = false;

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
      // Firebase passwords are exact strings; do not trim or compare against Firestore.
      const cleanPass = passwordInput || '';

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

      // Firebase Authentication is the sole authority for email and password.
      try {
        const firebaseResult = await authenticateWithFirebaseAuth(cleanEmail, cleanPass);
        if (!firebaseResult.success || !firebaseResult.user) {
          const err = firebaseResult.error || 'No se pudo validar la cuenta en Firebase Authentication.';
          setLoginError(err);
          return { success: false, error: err };
        }

        const firebaseUser = firebaseResult.user;
        const profile = await resolveAuthorizedCentralProfile(firebaseUser.uid, firebaseUser.email || cleanEmail);
        if (!profile) {
          await signOutFirebaseAuth();
          const err = 'Firebase validó tus credenciales, pero no se encontró un perfil activo autorizado para Central Técnica en Firestore.';
          setLoginError(err);
          return { success: false, error: err };
        }

        setPendingUser(profile);
        setStep('totp');
        setLoginError(null);
        return { success: true };
      } catch (fbErr: any) {
        await signOutFirebaseAuth();
        const err = fbErr?.message || 'No fue posible completar la autenticación con Firebase.';
        setLoginError(err);
        return { success: false, error: err };
      }
    },
    []
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
      if (pendingGoogleLogin && !googleOperationalAccessEnabled) {
        await signOutFirebaseAuth();
        setPendingUser(null);
        setPendingGoogleUid(null);
        setPendingGoogleLogin(false);
        setStep('credentials');
        const err = 'Google fue autenticado y el perfil pasó las comprobaciones locales, pero el acceso operativo permanece bloqueado hasta verificar las reglas Firestore desplegadas.';
        setLoginError(err);
        return { success: false, error: err };
      }
      const now = new Date();
      const expires = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

      const newSession: AuthSession = {
        user: pendingUser,
        firebaseUid: pendingGoogleUid || pendingUser.firebaseUid,
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
      setPendingGoogleUid(null);
      setPendingGoogleLogin(false);
      setStep('credentials');
      setIsLocked(false);
      setLoginError(null);

      return { success: true };
    },
    [pendingUser, pendingGoogleLogin, pendingGoogleUid]
  );

  const signInGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setLoginError(null);
    try {
      const result = await signInWithGooglePopup();
      if (result.isNewUser) {
        await signOutFirebaseAuth();
        return { success: false, error: 'Esta identidad Google no estaba vinculada a una cuenta existente de Agronomatrix.' };
      }
      const profile = await resolveAuthorizedCentralProfile(result.user.uid);
      const localProfile = profile && ecosystemUsers.find((item) => item.id === profile.id
        && item.firebaseUid === result.user.uid && item.status === 'active'
        && item.assignedApps?.includes('central'));
      if (!profile || !localProfile) {
        await signOutFirebaseAuth();
        return { success: false, error: 'No existe un perfil activo con este UID y autorización para Central.' };
      }
      setPendingUser({ ...profile, totpSecret: localProfile.totpSecret });
      setPendingGoogleUid(result.user.uid);
      setPendingGoogleLogin(true);
      setStep('totp');
      return { success: true };
    } catch (error: any) {
      await signOutFirebaseAuth();
      const code = error?.code;
      const message = code === 'auth/popup-closed-by-user' ? 'Se canceló el inicio con Google.'
        : code === 'auth/popup-blocked' ? 'El navegador bloqueó la ventana de Google.'
        : code === 'auth/provider-already-linked' ? 'Google ya está vinculado a esta cuenta.'
        : code === 'auth/credential-already-in-use' || code === 'auth/account-exists-with-different-credential'
          ? 'Esta cuenta Google está asociada a otra identidad Firebase. Contacta al administrador.'
          : error?.message || 'No se pudo iniciar sesión con Google.';
      setLoginError(message);
      return { success: false, error: message };
    }
  }, []);

  const linkGoogleAccount = useCallback(async (password: string) => {
    try {
      if (!user?.firebaseUid || auth.currentUser?.uid !== user.firebaseUid) {
        throw new Error('La sesión Firebase no coincide con el UID guardado en el perfil.');
      }
      const uid = await linkGoogleToCurrentUser(password);
      if (uid !== user.firebaseUid) throw new Error('El UID cambió durante la vinculación.');
      return { success: true, error: `Google quedó vinculado a la identidad Firebase ${uid}.` };
    } catch (error: any) {
      const code = error?.code;
      const message = code === 'auth/provider-already-linked' ? 'Google ya está vinculado a esta cuenta.'
        : code === 'auth/credential-already-in-use' ? 'Esta cuenta Google ya pertenece a otra identidad Firebase.'
        : code === 'auth/popup-closed-by-user' ? 'Se canceló la vinculación de Google.'
        : error?.message || 'No se pudo vincular Google.';
      return { success: false, error: message };
    }
  }, [user]);

  const cancelTwoFactor = useCallback(() => {
    signOutFirebaseAuth().catch(() => {});
    setPendingUser(null);
    setPendingGoogleUid(null);
    setPendingGoogleLogin(false);
    setStep('credentials');
    setLoginError(null);
  }, [pendingGoogleLogin]);

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
    signInGoogle,
    linkGoogleAccount,
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
