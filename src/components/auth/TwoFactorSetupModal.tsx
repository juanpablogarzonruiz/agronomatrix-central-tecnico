import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  KeyRound, 
  RefreshCw, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AuthUser } from '../../types';
import { buildOtpAuthUri, generateQRCodeDataUrl, generateTOTP, getRemainingTOTPSeconds } from '../../lib/totp';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [currentCode, setCurrentCode] = useState<string>('------');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(getRemainingTOTPSeconds());

  const secret = user.totpSecret || 'CACAOSECRETOPREMIUM234567CACAO23';
  const otpAuthUri = buildOtpAuthUri(user.email, secret, 'Agronomatrix');

  useEffect(() => {
    if (!isOpen) return;

    // Generate QR Code
    generateQRCodeDataUrl(otpAuthUri).then((url) => setQrDataUrl(url));

    // Update TOTP code and countdown
    const updateCode = async () => {
      const code = await generateTOTP(secret);
      setCurrentCode(code);
      setRemainingSeconds(getRemainingTOTPSeconds());
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [isOpen, otpAuthUri, secret]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Format secret in readable 4-char groups
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg glass-panel bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl shadow-emerald-950/50 text-white overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-emerald-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Google Authenticator (2FA)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Activo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rol: <span className="text-emerald-400 font-medium">Central de Beneficio</span> ({user.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          
          {/* Instructions Step Card */}
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              ¿Cómo vincular con tu teléfono celular?
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Abre la aplicación <strong>Google Authenticator</strong> en tu celular (iOS o Android).</li>
              <li>Toca el botón <strong>+</strong> en la esquina inferior y selecciona <strong>Escanear código QR</strong>.</li>
              <li>Apunta la cámara de tu teléfono al código QR que ves abajo.</li>
              <li>¡Listo! Tu app mostrará <strong>Agronomatrix ({user.name})</strong> con un código de 6 dígitos.</li>
            </ol>
          </div>

          {/* QR Code Presentation */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 border border-white/10 rounded-2xl p-4">
            <div className="shrink-0 p-2.5 bg-white rounded-2xl shadow-xl ring-4 ring-emerald-500/20 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Google Authenticator QR Code"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-slate-500 text-xs">
                  Generando QR...
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Clave Secreta Manual (Base32):
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 font-mono-num text-xs font-bold text-emerald-300">
                  <span className="tracking-wider">{formattedSecret}</span>
                  <button
                    onClick={handleCopySecret}
                    className="p-1 rounded-lg hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition cursor-pointer"
                    title="Copiar Clave Secreta"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Live Preview Code for Quick Testing */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Código Dinámico Actual:
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono-num text-amber-300">
                    <Clock className="w-3 h-3" />
                    {remainingSeconds}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-mono-num font-black tracking-widest text-emerald-400">
                    {currentCode.slice(0, 3)} {currentCode.slice(3)}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User & Role Details */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5">
              <span className="text-slate-400 block text-[10px]">Operador Central:</span>
              <span className="font-semibold text-white">{user.name}</span>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5">
              <span className="text-slate-400 block text-[10px]">Rol en el Sistema:</span>
              <span className="font-semibold text-emerald-400">{user.role}</span>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 col-span-2">
              <span className="text-slate-400 block text-[10px]">Central Asignada:</span>
              <span className="font-medium text-slate-200">Central de Beneficio Comunitario · Agronomatrix</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-700/30 transition cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
