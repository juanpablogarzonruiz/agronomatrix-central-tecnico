import React from 'react';
import { 
  X, 
  Factory, 
  Building2, 
  MapPin, 
  Scale, 
  Layers, 
  Sun, 
  Thermometer, 
  Activity, 
  CheckCircle2, 
  ExternalLink,
  Compass,
  Boxes
} from 'lucide-react';
import { CentralBeneficio } from '../../types';

interface CentralDetailModalProps {
  central: CentralBeneficio | null;
  onClose: () => void;
  onStartReception: (central: CentralBeneficio) => void;
}

export const CentralDetailModal: React.FC<CentralDetailModalProps> = ({
  central,
  onClose,
  onStartReception
}) => {
  if (!central) return null;

  const mapsUrl = (central.latitude && central.longitude)
    ? `https://www.google.com/maps?q=${central.latitude},${central.longitude}`
    : null;

  const dryEstimate = Math.round((central.capacityKgPerMonth || 0) * 0.36);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-teal-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-md">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{central.centralName || central.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {central.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{central.associationName || 'Asociación Vinculada'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Capacidad Mensual</span>
              <span className="text-lg font-bold font-mono-num text-white">
                {(central.capacityKgPerMonth / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-400">kg baba</span>
              </span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Rendimiento Seco</span>
              <span className="text-lg font-bold font-mono-num text-emerald-400">
                {(dryEstimate / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg/mes</span>
              </span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Batería de Cajones</span>
              <span className="text-lg font-bold font-mono-num text-amber-300">
                {central.fermentationBoxesCount} <span className="text-xs font-normal text-slate-400">cajones</span>
              </span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Área Secado Solar</span>
              <span className="text-lg font-bold font-mono-num text-white">
                {central.dryingAreaSqMeters} <span className="text-xs font-normal text-slate-400">m²</span>
              </span>
            </div>
          </div>

          {/* Description */}
          {central.description && (
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Descripción de la Infraestructura
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {central.description}
              </p>
            </div>
          )}

          {/* Technical Infrastructure: Fermentación & Secado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fermentación */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Boxes className="w-4 h-4" />
                <span>Módulo de Fermentación</span>
              </div>
              <p className="text-slate-300 text-xs">
                {central.fermentationType || 'Cajones de Madera Fina Escalonados en Cascada'}
              </p>
              <div className="pt-2 border-t border-white/5 flex justify-between text-[11px] text-slate-400">
                <span>Capacidad simultánea:</span>
                <span className="font-mono-num font-semibold text-white">
                  {central.fermentationBoxesCount} lotes ({central.fermentationBoxesCount * 450} kg max)
                </span>
              </div>
            </div>

            {/* Secado */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Sun className="w-4 h-4" />
                <span>Módulo de Secado Solar</span>
              </div>
              <p className="text-slate-300 text-xs">
                {central.dryingType || 'Marquesina Solar Tipo Túnel con Camas Rodantes'}
              </p>
              <div className="pt-2 border-t border-white/5 flex justify-between text-[11px] text-slate-400">
                <span>Superficie de oreo:</span>
                <span className="font-mono-num font-semibold text-white">{central.dryingAreaSqMeters} m² útiles</span>
              </div>
            </div>
          </div>

          {/* Location & GPS */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ubicación Geográfica de la Central
            </span>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {central.veredaOrAddress ? `${central.veredaOrAddress}, ` : ''}
                {central.municipality}, {central.department}
              </span>
            </div>

            {central.latitude && central.longitude && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5">
                <span className="font-mono-num text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  Lat: {central.latitude}, Lon: {central.longitude}
                </span>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onStartReception(central);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Registrar Recepción en esta Central</span>
          </button>
        </div>
      </div>
    </div>
  );
};
