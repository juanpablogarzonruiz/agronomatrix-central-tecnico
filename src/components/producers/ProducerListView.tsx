import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Trees, 
  Building2, 
  ShieldCheck, 
  LayoutGrid, 
  List, 
  Download, 
  Scale, 
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Producer, Farm } from '../../types';
import { ProducerDetailModal } from './ProducerDetailModal';

interface ProducerListViewProps {
  producers: Producer[];
  farms: Farm[];
  selectedAssociationName?: string;
  onGoToFarm: (farmId: string) => void;
  onStartReception: (producer: Producer) => void;
}

export const ProducerListView: React.FC<ProducerListViewProps> = ({
  producers,
  farms,
  selectedAssociationName,
  onGoToFarm,
  onStartReception
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);

  // Compute farms & cacao area for each producer
  const getProducerFarms = (producer: Producer) => {
    return farms.filter(
      (f) => f.producerId === producer.id || f.producerDocument === producer.documentId
    );
  };

  const exportToCSV = () => {
    const headers = ['Nombre Productor', 'Documento/Cédula', 'Asociación', 'Vereda', 'Teléfono', 'Nro Fincas', 'Hectáreas Cacao'];
    const rows = producers.map((p) => {
      const pFarms = getProducerFarms(p);
      const cacaoHa = pFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
      return [
        `"${p.producerName}"`,
        `"${p.documentId}"`,
        `"${p.associationName || ''}"`,
        `"${p.veredaOrLocation || ''}"`,
        `"${p.phone || ''}"`,
        pFarms.length,
        cacaoHa.toFixed(1)
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `productores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-white tracking-wide">
              Listado de Productores Cacaoteros
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono-num font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {producers.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedAssociationName 
              ? `Productores adscritos a: ${selectedAssociationName}`
              : 'Directorio general de familias cacaoteras registradas en el ecosistema'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-white/10"
            title="Exportar listado de productores a formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Grid / Table toggle */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista en tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista en tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {producers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No se encontraron productores</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay productores vinculados a esta asociación o que coincidan con la búsqueda ingresada.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {producers.map((producer) => {
            const pFarms = getProducerFarms(producer);
            const totalCacaoHa = pFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
            const cleanPhone = producer.phone?.replace(/[^0-9]/g, '') || '';

            return (
              <div
                key={producer.id}
                className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition duration-200 flex flex-col justify-between group shadow-lg hover:shadow-emerald-950/20"
              >
                <div>
                  {/* Top: Initials & Association Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {producer.producerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition line-clamp-1">
                          {producer.producerName}
                        </h3>
                        <p className="text-[11px] font-mono-num text-slate-400">
                          C.C. {producer.documentId}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-slate-800 text-slate-300 border border-white/10 shrink-0">
                      {producer.associationCode || 'ASOC'}
                    </span>
                  </div>

                  {/* Association link info */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{producer.associationName || 'Asociación General'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{producer.veredaOrLocation || 'Ubicación General'}</span>
                    </div>

                    {/* Farms & Cacao area indicators */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Trees className="w-3 h-3 text-emerald-400" />
                        <span>{pFarms.length} predio(s)</span>
                      </span>
                      <span className="font-mono-num font-semibold text-emerald-300">
                        {totalCacaoHa.toFixed(1)} Ha Cacao
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  {/* Phone & WhatsApp */}
                  <div className="flex items-center gap-1">
                    {producer.phone && (
                      <a
                        href={`tel:${producer.phone}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition"
                        title={`Llamar a ${producer.producerName}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-green-500/20 text-slate-300 hover:text-green-300 transition"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartReception(producer)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border border-emerald-500/20"
                      title="Registrar pesaje o recepción de cacao"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Recepción</span>
                    </button>

                    <button
                      onClick={() => setSelectedProducer(producer)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-medium flex items-center gap-1 transition cursor-pointer border border-white/10"
                    >
                      <span>Ficha</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-semibold">
                <tr>
                  <th className="py-3 px-4">Productor</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Asociación</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Predios</th>
                  <th className="py-3 px-4">Ha Cacao</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {producers.map((producer) => {
                  const pFarms = getProducerFarms(producer);
                  const totalCacaoHa = pFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
                  const cleanPhone = producer.phone?.replace(/[^0-9]/g, '') || '';

                  return (
                    <tr key={producer.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {producer.producerName}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-400 whitespace-nowrap">
                        {producer.documentId}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-slate-800 text-slate-300 border border-white/10">
                          {producer.associationCode || 'ASOC'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {producer.veredaOrLocation || 'Vereda General'}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-white">
                        {pFarms.length}
                      </td>
                      <td className="py-3 px-4 font-mono-num font-semibold text-emerald-400">
                        {totalCacaoHa.toFixed(1)} Ha
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {producer.phone && (
                            <a
                              href={`tel:${producer.phone}`}
                              className="p-1 rounded bg-slate-800 hover:text-emerald-300 text-slate-300"
                              title="Llamar"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-slate-800 hover:text-green-300 text-slate-300"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onStartReception(producer)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Recepción
                          </button>
                          <button
                            onClick={() => setSelectedProducer(producer)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition cursor-pointer"
                          >
                            Ver Ficha
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Producer Detail Modal */}
      {selectedProducer && (
        <ProducerDetailModal
          producer={selectedProducer}
          farms={farms}
          onClose={() => setSelectedProducer(null)}
          onGoToFarm={(farmId) => {
            setSelectedProducer(null);
            onGoToFarm(farmId);
          }}
          onStartReception={(p) => {
            setSelectedProducer(null);
            onStartReception(p);
          }}
        />
      )}
    </div>
  );
};
