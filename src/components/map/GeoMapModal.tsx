import React, { useState } from 'react';
import { 
  X, 
  Map, 
  MapPin, 
  Factory, 
  Trees, 
  ExternalLink, 
  Compass, 
  Building2,
  Navigation,
  Layers
} from 'lucide-react';
import { Farm, CentralBeneficio, Association } from '../../types';

interface GeoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  association?: Association;
  farms: Farm[];
  centrales: CentralBeneficio[];
}

export const GeoMapModal: React.FC<GeoMapModalProps> = ({
  isOpen,
  onClose,
  association,
  farms,
  centrales
}) => {
  const [filterType, setFilterType] = useState<'all' | 'centrales' | 'fincas'>('all');

  if (!isOpen) return null;

  const validCentrales = centrales.filter((c) => c.latitude && c.longitude);
  const validFarms = farms.filter((f) => f.latitude && f.longitude);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Mapa Geográfico & Georreferenciación
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {association?.name || 'Todas las Asociaciones'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Puntos GPS de centrales de acopio y fincas cacaoteras
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {/* Visual Hub Diagram Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-5 border border-emerald-500/20 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Red Radial de Acopio
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Topología de Beneficio Comunitario
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mt-1 leading-relaxed">
                  Las centrales de beneficio procesan los lotes en baba entregados por fincas en radios menores a 25 km, garantizando fermentación en las primeras 6 horas post-cosecha.
                </p>
              </div>

              {/* Counts badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-900/90 border border-teal-500/30 px-3 py-2 rounded-xl text-center">
                  <span className="text-base font-bold font-mono-num text-teal-300 block">{validCentrales.length}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Centrales</span>
                </div>
                <div className="bg-slate-900/90 border border-amber-500/30 px-3 py-2 rounded-xl text-center">
                  <span className="text-base font-bold font-mono-num text-amber-300 block">{validFarms.length}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Fincas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'all' 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Todos los Puntos ({validCentrales.length + validFarms.length})
            </button>
            <button
              onClick={() => setFilterType('centrales')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'centrales' 
                  ? 'bg-teal-500 text-slate-950 font-bold' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Solo Centrales ({validCentrales.length})
            </button>
            <button
              onClick={() => setFilterType('fincas')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'fincas' 
                  ? 'bg-amber-500 text-slate-950 font-bold' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Solo Fincas ({validFarms.length})
            </button>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Centrales */}
            {(filterType === 'all' || filterType === 'centrales') && validCentrales.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-teal-500/30 hover:border-teal-500/60 transition flex items-start justify-between gap-3 shadow-md"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-400 block font-mono-num">
                      CENTRAL · {c.code}
                    </span>
                    <h4 className="font-bold text-white text-xs">{c.centralName || c.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {c.municipality}, {c.department}
                    </p>
                    <span className="font-mono-num text-[11px] text-slate-500 block mt-1">
                      Lat: {c.latitude}, Lon: {c.longitude}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
                >
                  <span>Mapa</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}

            {/* Farms */}
            {(filterType === 'all' || filterType === 'fincas') && validFarms.map((f) => (
              <div
                key={f.id}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/20 hover:border-amber-500/50 transition flex items-start justify-between gap-3 shadow-md"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Trees className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400 block font-mono-num">
                      FINCA · {f.cacaoAreaHa || 0} Ha Cacao
                    </span>
                    <h4 className="font-bold text-white text-xs">{f.farmName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {f.producerName} · {f.vereda}, {f.municipality}
                    </p>
                    <span className="font-mono-num text-[11px] text-slate-500 block mt-1">
                      Lat: {f.latitude?.toFixed(4)}, Lon: {f.longitude?.toFixed(4)}
                      {f.altitudeMeters ? ` (${f.altitudeMeters} m.s.n.m.)` : ''}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${f.latitude},${f.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
                >
                  <span>Mapa</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Cerrar Visualizador
          </button>
        </div>
      </div>
    </div>
  );
};
