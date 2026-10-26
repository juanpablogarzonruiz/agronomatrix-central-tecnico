import React from 'react';
import { 
  Scale, 
  Boxes, 
  Sun, 
  CheckCircle2, 
  Calendar, 
  Thermometer, 
  User, 
  Trees, 
  Factory,
  PlusCircle,
  FileText
} from 'lucide-react';
import { ReceptionBatch } from '../../types';

interface ReceptionListViewProps {
  receptions: ReceptionBatch[];
  onOpenNewReception: () => void;
  selectedAssociationName?: string;
}

export const ReceptionListView: React.FC<ReceptionListViewProps> = ({
  receptions,
  onOpenNewReception,
  selectedAssociationName
}) => {
  const totalBabaKg = receptions.reduce((acc, r) => acc + (r.weightKgBaba || 0), 0);
  const totalDryEstKg = receptions.reduce((acc, r) => acc + (r.estimatedDryKg || 0), 0);

  const getStatusBadge = (status: ReceptionBatch['status']) => {
    switch (status) {
      case 'fermentacion':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Boxes className="w-3 h-3" />
            <span>Fermentación</span>
          </span>
        );
      case 'secado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
            <Sun className="w-3 h-3" />
            <span>Secado Solar</span>
          </span>
        );
      case 'almacenado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Almacenado</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-white tracking-wide">
              Control de Lotes & Recepción en Central
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono-num font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {receptions.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedAssociationName 
              ? `Lotes recepcionados de productores adscritos a: ${selectedAssociationName}`
              : 'Bitácora de peso baba, grados brix, cajón de fermentación y secado'
            }
          </p>
        </div>

        <button
          onClick={onOpenNewReception}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Registrar Recepción</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Baba Recibida</span>
          <span className="text-xl font-bold font-mono-num text-white">{totalBabaKg.toLocaleString()} kg</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/10">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Grano Seco Estimado</span>
          <span className="text-xl font-bold font-mono-num text-emerald-400">{totalDryEstKg.toLocaleString()} kg</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Lotes en Proceso</span>
          <span className="text-xl font-bold font-mono-num text-amber-300">{receptions.length} lotes</span>
        </div>
      </div>

      {/* List of Receptions */}
      {receptions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No hay lotes recepcionados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Registra el primer lote de cacao en baba entregado por un productor de la asociación.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {receptions.map((batch) => (
            <div
              key={batch.id}
              className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-emerald-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-num font-bold text-white text-sm">
                    {batch.batchCode}
                  </span>
                  {getStatusBadge(batch.status)}
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono-num">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(batch.receivedDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{batch.producerName}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Trees className="w-3.5 h-3.5 text-amber-400" />
                    <span>{batch.farmName}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 text-teal-300">
                    <Factory className="w-3.5 h-3.5" />
                    <span>{batch.centralName}</span>
                  </span>
                </div>

                {batch.notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    "{batch.notes}"
                  </p>
                )}
              </div>

              {/* Specs & Measurements */}
              <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Peso Baba</span>
                  <span className="text-base font-bold font-mono-num text-white">{batch.weightKgBaba} kg</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Seco Est.</span>
                  <span className="text-base font-bold font-mono-num text-emerald-400">{batch.estimatedDryKg} kg</span>
                </div>

                <div className="text-right bg-slate-900/60 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-semibold text-amber-400 block">Cajón</span>
                  <span className="text-sm font-bold font-mono-num text-amber-300">#{batch.fermentationBoxNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
