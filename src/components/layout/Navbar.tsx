import React, { useState } from 'react';
import { 
  Building2, 
  Factory, 
  Users, 
  Trees, 
  Search, 
  Scale, 
  Map, 
  PlusCircle, 
  Wifi, 
  WifiOff, 
  ChevronDown,
  Menu,
  X,
  Sprout,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { Association, MainTab } from '../../types';
import { UserMenu } from '../auth/UserMenu';

interface NavbarProps {
  associations: Association[];
  selectedAssociationId: string;
  onSelectAssociation: (id: string) => void;
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOnline: boolean;
  onOpenNewReception: () => void;
  onOpenMap: () => void;
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
  onOpenNewReception,
  onOpenMap,
  onOpenAddProducer,
  onOpenAddFarm,
  producersCount,
  farmsCount,
  clonesCount,
  centralesCount,
  receptionsCount
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const currentAssoc = associations.find((a) => a.id === selectedAssociationId);

  const handleNavigate = (tab: MainTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-800 shadow-[0_4px_0px_#1e293b]">
        {/* Top Banner & Quick Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            
            {/* Left: Hamburger Menu Button + Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer btn-3d-emerald"
                title="Abrir menú principal de navegación"
              >
                <Menu className="w-5 h-5 text-white" />
                <span className="text-xs font-extrabold tracking-wide uppercase hidden sm:inline">Menú</span>
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06694b] to-[#044c36] border-2 border-slate-900 shadow-[2.5px_3px_0px_#0f172a] flex items-center justify-center shrink-0">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-cacao font-bold text-xl tracking-tight text-slate-900">
                    Cacaoanalytica
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400">
                    CENTRAL DE BENEFICIO
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <span>Ecosistema Agronomatrix · Gestión & Trazabilidad</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span className="text-[#059669] font-bold">Postcosecha</span>
                </p>
              </div>
            </div>

            {/* Right: Association Selector & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-emerald-50/80 border-2 border-emerald-600 shadow-[2px_2px_0px_#047857] rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-[#047857]" />
                <label htmlFor="assoc-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Asociación:
                </label>
                <div className="relative">
                  <select
                    id="assoc-select"
                    value={selectedAssociationId}
                    onChange={(e) => onSelectAssociation(e.target.value)}
                    className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-6 appearance-none hover:text-[#047857] transition"
                  >
                    {associations.map((assoc) => (
                      <option key={assoc.id} value={assoc.id} className="bg-white text-slate-900">
                        {assoc.name} ({assoc.department})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Quick Action: New Reception */}
              <button
                onClick={onOpenNewReception}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-emerald"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Recepción Cacao</span>
              </button>

              {/* Quick Action: Geo Map */}
              <button
                onClick={onOpenMap}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-light"
                title="Ver mapa geográfico de fincas y centrales"
              >
                <Map className="w-3.5 h-3.5 text-[#059669]" />
                <span className="hidden sm:inline">Mapa Satelital</span>
              </button>

              {/* Connection Status Indicator */}
              <div 
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono-num font-bold flex items-center gap-1.5 border-2 ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-[2px_2px_0px_#059669]' 
                    : 'bg-amber-50 text-amber-800 border-amber-400 shadow-[2px_2px_0px_#d97706]'
                }`}
                title={isOnline ? 'Conectado en tiempo real a Google Cloud Firestore' : 'Modo fuera de línea - Caché local activa'}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
                    <span className="hidden sm:inline">Cloud Firestore</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span className="hidden sm:inline">Caché Local</span>
                  </>
                )}
              </div>

              {/* Authenticated User Menu & 2FA Status */}
              <UserMenu />
            </div>
          </div>

          {/* Search Bar & Main Quick Tabs */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Navigation Tabs */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => onSelectTab('productores')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'productores' ? 'btn-3d-emerald' : 'btn-3d-light'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Productores</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                  activeTab === 'productores' ? 'bg-white/25 text-white font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {producersCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('fincas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'fincas' ? 'btn-3d-emerald' : 'btn-3d-light'
                }`}
              >
                <Trees className="w-3.5 h-3.5" />
                <span>Fincas</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                  activeTab === 'fincas' ? 'bg-white/25 text-white font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {farmsCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('clones')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'clones' ? 'btn-3d-emerald' : 'btn-3d-light'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Clones</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                  activeTab === 'clones' ? 'bg-white/25 text-white font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {clonesCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('centrales')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'centrales' ? 'btn-3d-emerald' : 'btn-3d-light'
                }`}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>Centrales de Beneficio</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                  activeTab === 'centrales' ? 'bg-white/25 text-white font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {centralesCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('recepciones')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'recepciones' ? 'btn-3d-emerald' : 'btn-3d-light'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Lotes & Recepción</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                  activeTab === 'recepciones' ? 'bg-white/25 text-white font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {receptionsCount}
                </span>
              </button>
            </nav>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar productor, finca, clon o central..."
                className="w-full rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 input-3d"
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
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6ee7b7]">
                    ECOSISTEMA CENTRAL DE BENEFICIO
                  </p>
                  <h2 className="font-serif-cacao text-2xl font-bold text-white mt-0.5">
                    Cacaoanalytica
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

              <div className="p-5 space-y-6">
                {/* 1. Selector de Asociación */}
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

                {/* 2. Dependiendo de la Asociación Seleccionada: Productores y Fincas */}
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

                {/* 3. Independiente de la Asociación Seleccionada: Clones y Centrales de Beneficio */}
                <div className="p-4 rounded-2xl card-3d-inner bg-slate-50 space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                      INDEPENDIENTE DE LA ASOCIACIÓN
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Opciones generales del ecosistema Cacaoanalytica:
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
                Agronomatrix - CACAOANALYTICA
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
