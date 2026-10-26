import React from 'react';
import { 
  X, 
  Trees, 
  User, 
  MapPin, 
  Mountain, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Scale, 
  ExternalLink,
  Building2,
  FileText,
  Compass
} from 'lucide-react';
import { Farm } from '../../types';

interface FarmDetailModalProps {
  farm: Farm | null;
  onClose: () => void;
  onStartReception: (farm: Farm) => void;
}

export const FarmDetailModal: React.FC<FarmDetailModalProps> = ({
  farm,
  onClose,
  onStartReception
}) => {
  if (!farm) return null;

  const cacaoPercent = farm.totalAreaHa && farm.totalAreaHa > 0
    ? Math.min(100, Math.round(((farm.cacaoAreaHa || 0) / farm.totalAreaHa) * 100))
    : 0;

  const mapsUrl = (farm.latitude && farm.longitude)
    ? `https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-emerald-700 flex items-center justify-center text-white shadow-md">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{farm.farmName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {farm.cadastralCode || 'RUV-01'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Productor: <strong className="text-slate-200">{farm.producerName}</strong></span>
                {farm.producerDocument && (
                  <span className="text-slate-500 font-mono-num">(C.C. {farm.producerDocument})</span>
                )}
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
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Área Total</span>
              <span className="text-lg font-bold font-mono-num text-white">{farm.totalAreaHa || 0} Ha</span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Área Cacao</span>
              <span className="text-lg font-bold font-mono-num text-emerald-400">{farm.cacaoAreaHa || 0} Ha</span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Altitud</span>
              <span className="text-lg font-bold font-mono-num text-amber-300">
                {farm.altitudeMeters ? `${farm.altitudeMeters} m` : 'N/D'}
              </span>
            </div>
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Ocupación Cacao</span>
              <span className="text-lg font-bold font-mono-num text-white">{cacaoPercent}%</span>
            </div>
          </div>

          {/* Area Progress Bar */}
          <div className="space-y-1.5 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Proporción de Área en Cacao respecto al Predio</span>
              <span className="font-mono-num text-emerald-400 font-semibold">{cacaoPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                style={{ width: `${cacaoPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Location & GPS Details */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ubicación Geográfica & Georreferenciación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{farm.vereda}, {farm.municipality}, {farm.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{farm.associationName || 'Asociación Vinculada'}</span>
              </div>
            </div>

            {farm.latitude && farm.longitude && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5">
                <span className="font-mono-num text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  Lat: {farm.latitude.toFixed(4)}, Lon: {farm.longitude.toFixed(4)}
                  {farm.gpsAccuracy ? ` (±${farm.gpsAccuracy}m)` : ''}
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

          {/* Clone Distribution */}
          <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-xl border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Distribución Clonal en el Predio</span>
            </span>

            {farm.cloneDistributions && farm.cloneDistributions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {farm.cloneDistributions.map((cd) => (
                  <div 
                    key={cd.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between"
                  >
                    <span className="font-bold text-white">{cd.cloneName}</span>
                    <span className="font-mono-num text-emerald-400 font-semibold">
                      {cd.plantCount.toLocaleString()} árboles
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic py-1">Sin desglose de clones registrado.</p>
            )}
          </div>

          {/* EUDR & Deforestation Status */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Cumplimiento Antideforestación (EUDR)</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {farm.deforestationStatus || 'compliant'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                {farm.deforestationDetails || 'Predio evaluado satelitalmente con polígono perimetral. Conforme a las directrices de trazabilidad de la Unión Europea.'}
              </p>
              {farm.kmlFileName && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono-num bg-slate-800 text-slate-300">
                  Archivo perimetral: {farm.kmlFileName}
                </span>
              )}
            </div>
          </div>

          {/* Last Visit & Technical Recommendations */}
          {farm.recommendations && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-amber-400">
                <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Recomendación Técnica Agronómica</span>
                </span>
                {farm.visitDate && (
                  <span className="font-mono-num text-[11px] text-slate-400">
                    Visita: {farm.visitDate}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs italic leading-relaxed">
                "{farm.recommendations}"
              </p>
            </div>
          )}
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
              onStartReception(farm);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Recepción de Cacao de este Predio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
