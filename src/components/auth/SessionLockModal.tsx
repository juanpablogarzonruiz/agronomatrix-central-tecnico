import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  LogOut, 
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SessionLockModal: React.FC = () => {
  const { user, isLocked, unlockSession, logout, remainingSeconds, getLiveCode } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [liveCode, setLiveCode] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isLocked) return;
    setDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    getLiveCode().then(setLiveCode);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 200);
  }, [isLocked, getLiveCode]);

  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      getLiveCode().then(setLiveCode);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, getLiveCode]);

  if (!isLocked || !user) return null;

  const handleDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    const newDigits = [...digits];

    if (sanitized.length > 1) {
      const pasted = sanitized.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = sanitized;
    setDigits(newDigits);

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  const handleQuickFill = () => {
    if (liveCode.length === 6) {
      setDigits(liveCode.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMessage('Ingresa los 6 dígitos de Google Authenticator.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await unlockSession(code);
    if (!result.success) {
      setErrorMessage(result.error || 'Código incorrecto.');
      setIsSubmitting(false);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-white text-center">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/20 blur-2xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/20 mb-4">
          <Lock className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-lg font-bold text-white">Sesión Bloqueada</h2>
        <p className="text-xs text-slate-400 mt-1">
          Ingresa el código dinámico de Google Authenticator para continuar como{' '}
          <strong className="text-emerald-300 font-semibold">{user.name}</strong>
        </p>

        {/* User Card */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-left text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              Rol: Central de Beneficio
            </span>
            <span className="font-semibold text-white">{user.role || 'Supervisor Central de Beneficio'}</span>
          </div>
          <div className="flex items-center gap-1 font-mono-num text-[11px] text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{remainingSeconds}s</span>
          </div>
        </div>

        {/* 6 Digit Inputs */}
        <div className="my-6">
          <div className="flex items-center justify-center gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-10 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono-num font-black rounded-xl border transition focus:outline-none ${
                  digit 
                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300' 
                    : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                }`}
              />
            ))}
          </div>

          {/* Quick Fill Button */}
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={handleQuickFill}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Pegar Código Actual ({liveCode})</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 bg-rose-950/60 border border-rose-500/40 rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleUnlock}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Verificando...' : 'Desbloquear Acceso'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
