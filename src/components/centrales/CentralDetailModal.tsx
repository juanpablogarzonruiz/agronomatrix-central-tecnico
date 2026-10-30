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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl card-3d-outer overflow-hidden flex flex-col max-h-[92vh] bg-white text-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-emerald-50 to-white border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-800 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white shrink-0">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{central.centralName || central.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold bg-teal-100 text-teal-800 border border-teal-400">
                  {central.code}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>{central.associationName || 'Asociación General del Ecosistema'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Capacidad Mensual</span>
              <span className="text-lg font-bold font-mono-num text-slate-900">
                {(central.capacityKgPerMonth / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">kg baba</span>
              </span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-[#047857] block">Rendimiento Seco</span>
              <span className="text-lg font-bold font-mono-num text-[#047857]">
                {(dryEstimate / 1000).toFixed(1)}k <span className="text-xs font-normal text-emerald-700">kg/mes</span>
              </span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Batería Cajones</span>
              <span className="text-lg font-bold font-mono-num text-amber-900">
                {central.fermentationBoxesCount} <span className="text-xs font-normal text-amber-700">cajones</span>
              </span>
            </div>
            <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Secado Solar</span>
              <span className="text-lg font-bold font-mono-num text-teal-900">
                {central.dryingAreaSqMeters} <span className="text-xs font-normal text-teal-700">m²</span>
              </span>
            </div>
          </div>

          {/* Description */}
          {central.description && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                Descripción de la Infraestructura
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {central.description}
              </p>
            </div>
          )}

          {/* Technical Infrastructure: Fermentación & Secado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fermentación */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-[#047857] font-bold text-xs">
                <Boxes className="w-4 h-4" />
                <span>Módulo de Fermentación</span>
              </div>
              <p className="text-slate-800 text-xs font-medium">
                {central.fermentationType || 'Cajones de Madera Fina Escalonados en Cascada'}
              </p>
              <div className="pt-2 border-t border-emerald-200 flex justify-between text-[11px] text-slate-600">
                <span>Capacidad simultánea:</span>
                <span className="font-mono-num font-bold text-slate-900">
                  {central.fermentationBoxesCount} lotes ({central.fermentationBoxesCount * 450} kg max)
                </span>
              </div>
            </div>

            {/* Secado */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <Sun className="w-4 h-4" />
                <span>Módulo de Secado Solar</span>
              </div>
              <p className="text-slate-800 text-xs font-medium">
                {central.dryingType || 'Marquesina Solar Tipo Túnel con Camas Rodantes'}
              </p>
              <div className="pt-2 border-t border-amber-200 flex justify-between text-[11px] text-slate-600">
                <span>Superficie de oreo:</span>
                <span className="font-mono-num font-bold text-slate-900">{central.dryingAreaSqMeters} m² útiles</span>
              </div>
            </div>
          </div>

          {/* Location & GPS */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
              Ubicación Geográfica de la Central
            </span>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {central.veredaOrAddress ? `${central.veredaOrAddress}, ` : ''}
                {central.municipality}, {central.department}
              </span>
            </div>

            {central.latitude && central.longitude && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <span className="font-mono-num text-slate-600 text-[11px] flex items-center gap-1.5 font-bold">
                  <Compass className="w-3.5 h-3.5 text-[#047857]" />
                  Lat: {central.latitude}, Lon: {central.longitude}
                </span>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-[11px] font-bold flex items-center gap-1 transition border border-emerald-300"
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
        <div className="p-4 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer btn-3d-light"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onStartReception(central);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer btn-3d-emerald"
          >
            <Scale className="w-4 h-4" />
            <span>Registrar Recepción en esta Central</span>
          </button>
        </div>
      </div>
    </div>
  );
};
