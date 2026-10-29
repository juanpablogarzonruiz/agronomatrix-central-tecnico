import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Factory, 
  BadgeCheck,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthGate: React.FC = () => {
  const { 
    step, 
    pendingUser, 
    verifyCredentials, 
    verifyGoogleAuthenticator, 
    cancelTwoFactor, 
    loginError, 
    setLoginError,
    remainingSeconds,
    signInGoogle
  } = useAuth();

  // Step 1 Form State
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState<boolean>(false);

  // Step 2 TOTP Form State
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus management
  useEffect(() => {
    if (step === 'totp') {
      setTotpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    }
  }, [step]);


  // Handle Step 1 submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingCredentials(true);
    setLoginError(null);

    const res = await verifyCredentials(emailInput, passwordInput);
    setIsVerifyingCredentials(false);

    if (!res.success) {
      // Error is set in AuthContext
    }
  };

  // Handle digit typing & auto advance in Step 2
  const handleDigitChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '');
    const newDigits = [...totpDigits];

    if (sanitized.length > 1) {
      const pasted = sanitized.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setTotpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = sanitized;
    setTotpDigits(newDigits);

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleTotpSubmit();
    }
  };


  // Handle Step 2 submission
  const handleTotpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = totpDigits.join('');

    if (code.length !== 6) {
      setLoginError('Por favor ingresa los 6 dígitos generados por Google Authenticator.');
      return;
    }

    setIsVerifyingTotp(true);
    setLoginError(null);

    const res = await verifyGoogleAuthenticator(code);
    setIsVerifyingTotp(false);

    if (!res.success) {
      inputRefs.current[0]?.focus();
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-amber-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/40">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-serif-cacao font-black text-2xl tracking-wide text-white">
                  AGRONOMATRIX
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Firebase + 2FA
                </span>
              </div>
              <p className="text-xs text-slate-400">Portal Técnico de Central de Beneficio</p>
            </div>
          </div>
        </div>

        {/* Security Access Card */}
        <div className="glass-panel bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          
          {/* Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Acceso Autorizado Obligatorio
                </h2>
                <p className="text-[11px] text-slate-400">
                  {step === 'credentials' 
                    ? 'Paso 1: Validación de cuenta en Firebase Authentication' 
                    : 'Paso 2: Validación de código con Google Authenticator'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Rol: Central de Beneficio</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PASO 1: CORREO Y CONTRASEÑA EN FIREBASE AUTHENTICATION          */}
          {/* ============================================================== */}
          {step === 'credentials' && (
            <>
            <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Correo Electrónico o Usuario Registrado:</span>
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ejemplo@agronomatrix.com o usuario"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition font-mono-num"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Contraseña de la Cuenta:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-num">Almacenada en Firebase</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition font-mono-num pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-200 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit Button Step 1 */}
              <button
                type="submit"
                disabled={isVerifyingCredentials}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isVerifyingCredentials ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-5 h-5 text-slate-950" />
                    <span>Aceptar</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 border-t border-white/10 pt-4">
              <button type="button" onClick={() => void signInGoogle()} className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition cursor-pointer">
                <span className="text-base font-black text-blue-600">G</span><span>Continuar con Google</span>
              </button>
              <p className="mt-2 text-center text-[10px] text-amber-300">El acceso operativo está sujeto a verificación de seguridad.</p>
            </div>
            </>
          )}

          {/* ============================================================== */}
          {/* PASO 2: CÓDIGO DINÁMICO DE GOOGLE AUTHENTICATOR (TOTP)        */}
          {/* ============================================================== */}
          {step === 'totp' && pendingUser && (
            <form onSubmit={handleTotpSubmit} className="mt-6 space-y-5 animate-fadeIn">
              
              {/* Authenticated Account Pill */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-emerald-400/30">
                    {pendingUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{pendingUser.name}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Firebase OK ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{pendingUser.email}</p>
                    <p className="text-[10px] text-amber-400 font-semibold">{pendingUser.role}</p>
                  </div>
                </div>

                {/* 30s Countdown timer */}
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono-num text-amber-300 shadow-inner"
                  title="Tiempo de validez restante del código actual"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{remainingSeconds}s</span>
                </div>
              </div>

              {/* TOTP 6-Digit Inputs */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Código Dinámico de Google Authenticator:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono-num font-bold">6 dígitos</span>
                </label>

                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                  {totpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono-num font-black rounded-2xl border transition focus:outline-none ${
                        digit 
                          ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-900/90 border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Información de acceso con 2FA */}
              <div className="pt-3 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ingresa el código dinámico de 6 dígitos generado en la aplicación <strong className="text-emerald-300 font-semibold">Google Authenticator</strong> vinculada a tu cuenta.
                </p>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-200 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isVerifyingTotp}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isVerifyingTotp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verificando con Google Authenticator...</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-5 h-5 text-slate-950" />
                      <span>Verificar Código y Entrar a la Central</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={cancelTwoFactor}
                  className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver / Cambiar Cuenta de Correo</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer security tag */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Ecosistema Seguro Agronomatrix · Conexión Cifrada & Trazabilidad Central</span>
          </div>
        </div>
      </div>
    </div>
  );
};
