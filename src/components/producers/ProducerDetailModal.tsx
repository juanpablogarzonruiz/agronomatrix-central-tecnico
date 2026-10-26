import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Trees, 
  Calendar, 
  Navigation,
  FileText,
  Scale
} from 'lucide-react';
import { Producer, Farm } from '../../types';

interface ProducerDetailModalProps {
  producer: Producer | null;
  farms: Farm[];
  onClose: () => void;
  onGoToFarm: (farmId: string) => void;
  onStartReception: (producer: Producer) => void;
}

export const ProducerDetailModal: React.FC<ProducerDetailModalProps> = ({
  producer,
  farms,
  onClose,
  onGoToFarm,
  onStartReception
}) => {
  if (!producer) return null;

  const producerFarms = farms.filter((f) => f.producerId === producer.id || f.producerDocument === producer.documentId);
  const totalProducerCacaoHa = producerFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
  const cleanPhone = producer.phone?.replace(/[^0-9]/g, '') || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {producer.producerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{producer.producerName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  C.C. {producer.documentId}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{producer.associationName || 'Asociación Vinculada'}</span>
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
          
          {/* Quick Contact & Location Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Ubicación & Contacto
              </span>
              <div className="flex items-center gap-2 text-slate-200">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{producer.veredaOrLocation || 'Ubicación General'}</span>
              </div>
              {producer.phone && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${producer.phone}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-medium flex items-center gap-1.5 hover:bg-emerald-500/20 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{producer.phone}</span>
                  </a>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-300 font-medium flex items-center gap-1.5 hover:bg-green-500/20 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Resumen Agrícola
              </span>
              <div className="flex items-center justify-between text-slate-300">
                <span>Predios Registrados:</span>
                <span className="font-bold text-white font-mono-num">{producerFarms.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Área en Cacao:</span>
                <span className="font-bold text-emerald-400 font-mono-num">{totalProducerCacaoHa.toFixed(1)} Ha</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Habeas Data & Autorización de Datos Válida</span>
              </div>
            </div>
          </div>

          {/* Dynamic Values / Custom Attributes */}
          {producer.dynamicValues && Object.keys(producer.dynamicValues).length > 0 && (
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Datos Técnicos Adicionales
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                {Object.entries(producer.dynamicValues).map(([key, val]) => (
                  <div key={key} className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium text-white">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farms linked to this producer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-amber-400" />
                <span>Predios de este Productor ({producerFarms.length})</span>
              </span>
            </div>

            {producerFarms.length === 0 ? (
              <p className="text-slate-500 italic py-2">No se encontraron predios vinculados directamente a este productor.</p>
            ) : (
              <div className="space-y-2">
                {producerFarms.map((farm) => (
                  <div 
                    key={farm.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-white/5 hover:border-emerald-500/30 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{farm.farmName}</span>
                        <span className="text-[10px] font-mono-num text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {farm.cacaoAreaHa} Ha Cacao
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {farm.vereda}, {farm.municipality} · {farm.altitudeMeters ? `${farm.altitudeMeters} m.s.n.m.` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onGoToFarm(farm.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </div>
                ))}
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
              onStartReception(producer);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Registrar Recepción de Cacao</span>
          </button>
        </div>
      </div>
    </div>
  );
};
