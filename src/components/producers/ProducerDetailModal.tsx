import React, { useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Trees, 
  Scale,
  FileSpreadsheet
} from 'lucide-react';
import { Producer, Farm, ProducerTemplate } from '../../types';

interface ProducerDetailModalProps {
  producer: Producer | null;
  farms: Farm[];
  producerTemplates?: ProducerTemplate[];
  onClose: () => void;
  onGoToFarm: (farmId: string) => void;
  onStartReception: (producer: Producer) => void;
}

export const ProducerDetailModal: React.FC<ProducerDetailModalProps> = ({
  producer,
  farms,
  producerTemplates = [],
  onClose,
  onGoToFarm,
  onStartReception
}) => {
  if (!producer) return null;

  const producerFarms = farms.filter((f) => {
    if (f.associationId && producer.associationId && f.associationId !== producer.associationId) {
      return false;
    }
    if (f.producerId) {
      return f.producerId === producer.id;
    }
    return (
      Boolean(producer.documentId) &&
      producer.documentId !== 'N/A' &&
      producer.documentId.length >= 4 &&
      f.producerDocument === producer.documentId
    );
  });
  const totalProducerCacaoHa = producerFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
  const cleanPhone = producer.phone?.replace(/[^0-9]/g, '') || '';

  // Look up field labels from associated template
  const matchedTemplate = useMemo(() => {
    return (
      producerTemplates.find((t) => t.id === producer.templateId) ||
      producerTemplates.find((t) => t.code === producer.templateCode) ||
      null
    );
  }, [producerTemplates, producer.templateId, producer.templateCode]);

  const fieldLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    const templatesToScan = matchedTemplate ? [matchedTemplate] : producerTemplates;
    templatesToScan.forEach((tpl) => {
      const allFields = [
        ...(tpl.producerSections?.flatMap((s) => s.fields || []) || []),
        ...(tpl.producerFields || []),
        ...(tpl.fields || [])
      ];
      allFields.forEach((f) => {
        if (f.id && (f.name || f.label)) {
          map.set(f.id, f.name || f.label || f.id);
        }
      });
    });
    return map;
  }, [matchedTemplate, producerTemplates]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl card-3d-outer overflow-hidden flex flex-col max-h-[92vh] bg-white text-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#06694b] to-[#044c36] text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {producer.producerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">{producer.producerName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold bg-white/20 text-emerald-100 border border-white/30">
                  C.C. {producer.documentId}
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>{producer.associationName || 'Asociación Vinculada'}</span>
                {producer.associationCode && (
                  <span className="font-mono-num text-emerald-200">({producer.associationCode})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Associated Template Banner */}
          {(producer.templateTitle || producer.templateCode || matchedTemplate) && (
            <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
                <div>
                  <span className="text-[11px] font-bold text-emerald-950 block">
                    Plantilla de Productor vinculada:
                  </span>
                  <span className="font-semibold text-emerald-900">
                    {producer.templateTitle || matchedTemplate?.title || 'Plantilla de Productor'}
                  </span>
                </div>
              </div>
              {(producer.templateCode || matchedTemplate?.code) && (
                <span className="px-2 py-0.5 rounded font-mono-num font-bold text-[10px] bg-emerald-200 text-emerald-900 border border-emerald-400">
                  {producer.templateCode || matchedTemplate?.code}
                </span>
              )}
            </div>
          )}

          {/* Quick Contact & Agricultural Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border-2 border-slate-300 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Ubicación & Contacto
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{producer.veredaOrLocation || 'Ubicación General'}</span>
              </div>
              {producer.phone && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={`tel:${producer.phone}`}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-emerald-800 font-bold flex items-center gap-1.5 hover:bg-emerald-50 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{producer.phone}</span>
                  </a>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#059669] text-white font-bold flex items-center gap-1.5 hover:bg-[#047857] transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border-2 border-slate-300 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Resumen Agrícola
              </span>
              <div className="flex items-center justify-between text-slate-700">
                <span>Predios Registrados:</span>
                <span className="font-bold text-slate-900 font-mono-num">{producerFarms.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Área Total en Cacao:</span>
                <span className="font-bold text-[#059669] font-mono-num">{totalProducerCacaoHa.toFixed(1)} Ha</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold pt-0.5">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Habeas Data & Autorización Firmada</span>
              </div>
            </div>
          </div>

          {/* Dynamic Values / Custom Attributes with human-readable labels */}
          {producer.dynamicValues && Object.keys(producer.dynamicValues).length > 0 && (
            <div className="bg-white p-4 rounded-xl border-2 border-slate-300 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block flex items-center justify-between">
                <span>Datos Técnicos de la Plantilla</span>
                <span className="text-slate-500 font-normal lowercase">
                  ({Object.keys(producer.dynamicValues).length} campos)
                </span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                {Object.entries(producer.dynamicValues).map(([key, val]) => {
                  const label = fieldLabelMap.get(key) || key.replace(/([A-Z])/g, ' $1');
                  return (
                    <div key={key} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-600 font-medium capitalize pr-2">{label}:</span>
                      <span className="font-bold text-slate-900 text-right">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Farms linked to this producer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-700" />
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
                    className="p-3 rounded-xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{farm.farmName}</span>
                        <span className="text-[10px] font-mono-num font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          {farm.cacaoAreaHa} Ha Cacao
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {farm.vereda}, {farm.municipality} · {farm.altitudeMeters ? `${farm.altitudeMeters} m.s.n.m.` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onGoToFarm(farm.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer btn-3d-light"
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
        <div className="p-4 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer btn-3d-light"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onStartReception(producer);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer btn-3d-emerald"
          >
            <Scale className="w-4 h-4" />
            <span>Registrar Recepción de Cacao</span>
          </button>
        </div>
      </div>
    </div>
  );
};
