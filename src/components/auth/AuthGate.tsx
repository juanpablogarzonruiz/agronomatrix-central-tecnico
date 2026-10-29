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
    remainingSeconds
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
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Soft light ambient highlights */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split 3D Card Container */}
      <div className="relative z-10 w-full max-w-[940px] rounded-[28px] card-3d-outer overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        
        {/* Left Brand Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#077a58] via-[#055a40] to-[#033828] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-slate-800/30 shadow-[inset_-6px_0_16px_rgba(0,0,0,0.18)]">
          {/* Subtle top-left 3D specular highlight */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30 pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-emerald-100/95 leading-relaxed drop-shadow-xs">
              INGENIERÍA DE PRECISIÓN DEL SABOR
              <br />
              DEL CACAO
            </p>

            <h1 className="mt-4 font-serif-cacao font-bold text-3xl sm:text-[38px] text-white tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              Cacao Analítica
            </h1>

            <div className="mt-3 space-y-0.5 text-xs font-extrabold tracking-[0.15em] uppercase">
              <p className="text-[#6ee7b7] drop-shadow-xs">ECOSISTEMA</p>
              <p className="text-white">CENTRAL DE BENEFICIO</p>
            </div>

            <p className="mt-6 text-[13px] sm:text-sm text-emerald-50/90 leading-relaxed font-normal">
              Ecosistema con Inteligencia Artificial para trazabilidad total y predecir la calidad desde el campo hasta la exportación.
            </p>
          </div>

          <div className="relative z-10 pt-5 mt-8 border-t border-white/20 flex items-center gap-2.5 text-xs font-semibold text-emerald-50">
            <ShieldCheck className="w-4 h-4 text-[#6ee7b7] shrink-0" />
            <span>Google Authenticator</span>
          </div>
        </div>

        {/* Right Form Panel (Light 3D Surface) */}
        <div className="md:col-span-7 bg-gradient-to-b from-white to-[#f8fafc] flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[430px] rounded-2xl p-6 sm:p-8 card-3d-inner">
            
            {/* ============================================================== */}
            {/* PASO 1: CORREO Y CONTRASEÑA EN FIREBASE AUTHENTICATION          */}
            {/* ============================================================== */}
            {step === 'credentials' && (
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#059669]">
                  ACCESO SEGURO
                </p>
                <h2 className="mt-1 font-serif-cacao text-2xl sm:text-[28px] font-bold text-slate-900">
                  Iniciar Sesión
                </h2>
                <p className="mt-1 text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                  Ingresa tus credenciales corporativas para acceder al sistema.
                </p>

                <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="correo@empresa.com"
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 input-3d-emerald"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 input-3d"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {loginError && (
                    <div className="bg-rose-50 border-2 border-rose-300 shadow-[2px_2px_0px_#e11d48] rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Submit Button Step 1 */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isVerifyingCredentials}
                      className="w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-3d-emerald"
                    >
                      {isVerifyingCredentials ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Validando...</span>
                        </>
                      ) : (
                        <>
                          <span>Continuar</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* PASO 2: CÓDIGO DINÁMICO DE GOOGLE AUTHENTICATOR (TOTP)        */}
            {/* ============================================================== */}
            {step === 'totp' && pendingUser && (
              <div className="animate-fadeIn">
                <p className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#059669]">
                  VERIFICACIÓN 2FA
                </p>
                <h2 className="mt-1 font-serif-cacao text-2xl sm:text-[26px] font-bold text-slate-900">
                  Google Authenticator
                </h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Ingresa el código dinámico de 6 dígitos generado en tu aplicación.
                </p>

                <form onSubmit={handleTotpSubmit} className="mt-5 space-y-5">
                  {/* Authenticated Account Pill */}
                  <div className="bg-slate-50 border-2 border-slate-300 shadow-[2px_2px_0px_#64748b] rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#047857] border border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {pendingUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 truncate">{pendingUser.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{pendingUser.email}</p>
                      </div>
                    </div>

                    {/* 30s Countdown timer */}
                    <div 
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-400 shadow-[1.5px_1.5px_0px_#059669] text-[11px] font-mono-num font-bold text-emerald-800 shrink-0"
                      title="Tiempo de validez restante del código actual"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>{remainingSeconds}s</span>
                    </div>
                  </div>

                  {/* TOTP 6-Digit Inputs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#059669]" />
                        Código de 6 dígitos
                      </span>
                    </label>

                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-1">
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
                          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono-num font-bold rounded-xl transition focus:outline-none ${
                            digit 
                              ? 'bg-emerald-50 border-2 border-[#059669] shadow-[2px_3px_0px_#047857] text-emerald-950' 
                              : 'input-3d text-slate-900'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Error Alert */}
                  {loginError && (
                    <div className="bg-rose-50 border-2 border-rose-300 shadow-[2px_2px_0px_#e11d48] rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={isVerifyingTotp}
                      className="w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-3d-emerald"
                    >
                      {isVerifyingTotp ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <span>Verificar y Continuar</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={cancelTwoFactor}
                      className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer btn-3d-light"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a credenciales</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Bottom Footer Text */}
      <div className="mt-6 text-center">
        <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-wide">
          Agronomatrix - Cacao Analítica
        </p>
      </div>
    </div>
  );
};
