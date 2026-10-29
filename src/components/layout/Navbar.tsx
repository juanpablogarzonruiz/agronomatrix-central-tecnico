import React, { useState } from 'react';
import { 
  Building2, 
  Factory, 
  Users, 
  Trees, 
  Search, 
  Scale, 
  Wifi, 
  WifiOff, 
  ChevronDown,
  Menu,
  X,
  Sprout,
  UserPlus,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Lock,
  LogOut,
  QrCode
} from 'lucide-react';
import { Association, MainTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TwoFactorSetupModal } from '../auth/TwoFactorSetupModal';

interface NavbarProps {
  associations: Association[];
  selectedAssociationId: string;
  onSelectAssociation: (id: string) => void;
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOnline: boolean;
  onOpenNewReception?: () => void;
  onOpenMap?: () => void;
  onOpenAddProducer: () => void;
  onOpenAddFarm: () => void;
  producersCount: number;
  farmsCount: number;
  clonesCount: number;
  centralesCount: number;
  receptionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  associations,
  selectedAssociationId,
  onSelectAssociation,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  isOnline,
  onOpenAddProducer,
  onOpenAddFarm,
  producersCount,
  farmsCount,
  clonesCount,
  centralesCount,
  receptionsCount
}) => {
  const { user, logout, lockSession } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const currentAssoc = associations.find((a) => a.id === selectedAssociationId);

  const handleNavigate = (tab: MainTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-800 shadow-[0_4px_0px_#1e293b]">
        {/* Top Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Left: Hamburger Menu Button (Always Visible) + Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer btn-3d-emerald shrink-0"
                title="Abrir menú principal de navegación"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5 text-white" />
                <span className="text-xs font-extrabold tracking-wide uppercase">Menú</span>
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06694b] to-[#044c36] border-2 border-slate-900 shadow-[2.5px_3px_0px_#0f172a] flex items-center justify-center shrink-0">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-serif-cacao font-bold text-2xl tracking-tight text-slate-900 leading-none">
                  Cacao Analítica
                </h1>
              </div>
            </div>

            {/* Right: Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar productor, finca, clon o central..."
                className="w-full rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 input-3d"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* HAMBURGER SIDE DRAWER MENU (3D LIGHT DESIGN)                         */}
      {/* ==================================================================== */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-start animate-fadeIn"
          onClick={() => setIsMenuOpen(false)}
        >
          <aside 
            className="w-full max-w-sm bg-white h-full border-r-3 border-slate-900 shadow-[8px_0_30px_rgba(15,23,42,0.25)] flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="p-5 bg-gradient-to-br from-[#06694b] via-[#044c36] to-[#022c20] text-white border-b-2 border-slate-900 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-cacao text-2xl font-bold text-white">
                    Cacao Analítica
                  </h2>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 transition cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                
                {/* 1. Account User Profile & Associated Image (Moved into Hamburger Menu) */}
                {user && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-[3px_3px_0px_#047857] space-y-3">
                    <div className="flex items-center gap-3">
                      {/* User Account Avatar with Image */}
                      <div className="relative shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = document.getElementById(`avatar-fallback-${user.id}`);
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id={`avatar-fallback-${user.id}`}
                          style={{ display: user.avatarUrl ? 'none' : 'flex' }}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06694b] to-[#044c36] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] items-center justify-center text-white text-base font-extrabold"
                        >
                          {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div 
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" 
                          title="Sesión activa" 
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">
                            {user.name}
                          </h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-[#047857] border border-emerald-400">
                            {user.role}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                            2FA Activo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Account User Actions */}
                    <div className="border-t border-emerald-200 pt-2.5 space-y-1.5">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowQRModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer text-left shadow-xs"
                      >
                        <QrCode className="w-4 h-4 text-[#047857]" />
                        <span>Ver QR Google Authenticator</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          lockSession();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer text-left shadow-xs"
                      >
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>Bloquear Sesión (Pedir TOTP)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-extrabold transition cursor-pointer text-left shadow-xs"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Cerrar Sesión Segura</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Selector de Asociación */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Seleccionar Asociación Activa</span>
                  </label>
                  <select
                    value={selectedAssociationId}
                    onChange={(e) => onSelectAssociation(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 input-3d-emerald cursor-pointer"
                  >
                    {associations.map((assoc) => (
                      <option key={assoc.id} value={assoc.id}>
                        {assoc.name} ({assoc.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Dependiendo de la Asociación Seleccionada: Productores y Fincas */}
                <div className="p-4 rounded-2xl card-3d-inner bg-emerald-50/40 space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] block">
                      DEPENDIENDO DE LA ASOCIACIÓN:
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                      {currentAssoc ? currentAssoc.name : 'Asociación Seleccionada'}
                    </h3>
                  </div>

                  {/* Opción Productores y Fincas */}
                  <div className="p-3 rounded-xl bg-white border-2 border-emerald-500 shadow-[3px_3px_0px_#047857] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#059669]" />
                        <span>Productores y Fincas</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                        {currentAssoc?.code || 'ASOC'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      Registros asociados exclusivamente a <strong>{currentAssoc?.name}</strong>:
                    </p>

                    {/* Botón Productores de la Asociación */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleNavigate('productores')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                          activeTab === 'productores' ? 'btn-3d-emerald' : 'btn-3d-light'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>Productores</span>
                        </span>
                        <span className="font-mono-num text-[11px] font-extrabold">
                          ({producersCount})
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSelectTab('productores');
                          onOpenAddProducer();
                        }}
                        className="p-2 rounded-xl text-xs font-bold cursor-pointer btn-3d-emerald"
                        title="Adicionar Productor a esta Asociación"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botón Fincas de la Asociación */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleNavigate('fincas')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                          activeTab === 'fincas' ? 'btn-3d-emerald' : 'btn-3d-light'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Trees className="w-3.5 h-3.5" />
                          <span>Fincas</span>
                        </span>
                        <span className="font-mono-num text-[11px] font-extrabold">
                          ({farmsCount})
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSelectTab('fincas');
                          onOpenAddFarm();
                        }}
                        className="p-2 rounded-xl text-xs font-bold cursor-pointer btn-3d-emerald"
                        title="Adicionar Finca a esta Asociación"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Independiente de la Asociación Seleccionada: Clones y Centrales de Beneficio */}
                <div className="p-4 rounded-2xl card-3d-inner bg-slate-50 space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                      INDEPENDIENTE DE LA ASOCIACIÓN
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Opciones generales del ecosistema Cacao Analítica:
                    </p>
                  </div>

                  <div className="space-y-2">
                    {/* Opción Clones */}
                    <button
                      onClick={() => handleNavigate('clones')}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                        activeTab === 'clones' ? 'btn-3d-emerald' : 'btn-3d-light'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sprout className="w-4 h-4" />
                        <span>Clones</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono-num text-[11px]">
                        <span>{clonesCount}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {/* Opción Centrales de Beneficio */}
                    <button
                      onClick={() => handleNavigate('centrales')}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                        activeTab === 'centrales' ? 'btn-3d-emerald' : 'btn-3d-light'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Factory className="w-4 h-4" />
                        <span>Centrales de Beneficio</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono-num text-[11px]">
                        <span>{centralesCount}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {/* Opción Lotes & Recepción */}
                    <button
                      onClick={() => handleNavigate('recepciones')}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                        activeTab === 'recepciones' ? 'btn-3d-emerald' : 'btn-3d-light'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        <span>Lotes & Recepción</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono-num text-[11px]">
                        <span>{receptionsCount}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t-2 border-slate-200 bg-slate-50 text-center">
              <p className="text-[11px] font-bold text-slate-600">
                Agronomatrix - CACAO ANALÍTICA
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Two Factor Setup Modal Triggered from Hamburger Drawer */}
      {user && (
        <TwoFactorSetupModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          user={user}
        />
      )}
    </>
  );
};
