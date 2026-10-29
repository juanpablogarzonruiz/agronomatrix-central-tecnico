import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Lock, 
  QrCode, 
  ChevronDown, 
  User, 
  Factory, 
  CheckCircle2, 
  Building2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';

export const UserMenu: React.FC = () => {
  const { user, logout, lockSession } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-emerald-50 border-2 border-slate-700 shadow-[2.5px_3px_0px_#334155] text-slate-900 transition cursor-pointer group"
      >
        {/* Avatar / Role Icon */}
        <div className="relative">
          <div className="w-7 h-7 rounded-lg bg-[#047857] border border-slate-900 flex items-center justify-center text-white text-xs font-bold">
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
        </div>

        {/* User & Role Label */}
        <div className="hidden md:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#047857] transition line-clamp-1">
              {user.name}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
          </div>
          <span className="text-[10px] text-[#059669] font-bold tracking-wide">
            CENTRAL DE BENEFICIO
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-panel bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-2.5 shadow-2xl shadow-black/80 z-50 text-xs animate-fadeIn space-y-2">
          
          {/* Header with detailed role */}
          <div className="p-2.5 bg-slate-950/70 border border-emerald-500/20 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Operador Autorizado
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                2FA Activo
              </span>
            </div>
            <p className="font-bold text-white text-xs">{user.name}</p>
            <p className="text-[11px] text-slate-400">{user.email}</p>
            <div className="pt-1.5 mt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Rol Sistema:</span>
              <span className="font-semibold text-emerald-400">{user.role}</span>
            </div>
          </div>

          {/* Assigned Central details */}
          <div className="px-2 py-1 space-y-1 text-[11px]">
            <div className="flex items-start gap-1.5 text-slate-300">
              <Factory className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium">Central de Beneficio Cacaotera</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">Ecosistema Agronomatrix Colombia</span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-1 space-y-0.5">
            {/* View 2FA QR Code */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowQRModal(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver QR Google Authenticator</span>
            </button>

            {/* Lock Screen */}
            <button
              onClick={() => {
                setIsOpen(false);
                lockSession();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Bloquear Sesión (Pedir TOTP)</span>
            </button>

            {/* Log Out */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/20 transition cursor-pointer text-left font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Cerrar Sesión Segura</span>
            </button>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        user={user}
      />
    </div>
  );
};
