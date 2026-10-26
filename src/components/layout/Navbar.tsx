import React from 'react';
import { 
  Building2, 
  Factory, 
  Users, 
  Trees, 
  Search, 
  MapPin, 
  Scale, 
  Map, 
  PlusCircle, 
  Wifi, 
  WifiOff, 
  Filter,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Layers
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
  producersCount: number;
  farmsCount: number;
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
  producersCount,
  farmsCount,
  centralesCount,
  receptionsCount
}) => {
  const currentAssoc = associations.find((a) => a.id === selectedAssociationId);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-500/20 shadow-2xl shadow-black/40">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & App Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-cacao font-black text-lg tracking-wide text-white">
                  AGRONOMATRIX
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Técnico de Central
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Gestión de Beneficio & Trazabilidad por Asociación</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-amber-400 font-medium">Postcosecha</span>
              </p>
            </div>
          </div>

          {/* Association Selector - Core Feature */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-inner">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <label htmlFor="assoc-select" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Asociación:
              </label>
              <div className="relative">
                <select
                  id="assoc-select"
                  value={selectedAssociationId}
                  onChange={(e) => onSelectAssociation(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-6 appearance-none hover:text-emerald-300 transition"
                >
                  <option value="all" className="bg-slate-900 text-white">
                    -- Todas las Asociaciones ({associations.length}) --
                  </option>
                  {associations.map((assoc) => (
                    <option key={assoc.id} value={assoc.id} className="bg-slate-900 text-white">
                      {assoc.name} ({assoc.department})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Action: New Reception */}
            <button
              onClick={onOpenNewReception}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Recepción Cacao</span>
            </button>

            {/* Quick Action: Geo Map */}
            <button
              onClick={onOpenMap}
              className="px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-white/10"
              title="Ver mapa geográfico de fincas y centrales"
            >
              <Map className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mapa Satelital</span>
            </button>

            {/* Connection Status Indicator */}
            <div 
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono-num flex items-center gap-1.5 border ${
                isOnline 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
              }`}
              title={isOnline ? 'Conectado en tiempo real a Google Cloud Firestore' : 'Modo fuera de línea - Caché local activa'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Cloud Firestore</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Caché Local</span>
                </>
              )}
            </div>

            {/* Authenticated User Menu & 2FA Status */}
            <UserMenu />
          </div>
        </div>

        {/* Search Bar & Main Tabs */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => onSelectTab('productores')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'productores'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Listado de Productores</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                activeTab === 'productores' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {producersCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('fincas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'fincas'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Listado de Fincas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                activeTab === 'fincas' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {farmsCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('centrales')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'centrales'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Centrales de Beneficio</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                activeTab === 'centrales' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {centralesCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('recepciones')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'recepciones'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Lotes & Recepción</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                activeTab === 'recepciones' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {receptionsCount}
              </span>
            </button>
          </nav>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productor, finca o central..."
              className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
