import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Trees, 
  Building2, 
  LayoutGrid, 
  List, 
  Download, 
  Scale, 
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Producer, Farm, ProducerTemplate } from '../../types';
import { ProducerDetailModal } from './ProducerDetailModal';

interface ProducerListViewProps {
  producers: Producer[];
  farms: Farm[];
  producerTemplates?: ProducerTemplate[];
  selectedAssociationName?: string;
  onGoToFarm: (farmId: string) => void;
  onStartReception: (producer: Producer) => void;
  onAddProducer: () => void;
  onEditProducer: (producer: Producer) => void;
  onDeleteProducer: (producer: Producer) => void;
}

export const ProducerListView: React.FC<ProducerListViewProps> = ({
  producers,
  farms,
  producerTemplates = [],
  selectedAssociationName,
  onGoToFarm,
  onStartReception,
  onAddProducer,
  onEditProducer,
  onDeleteProducer
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [producerToDelete, setProducerToDelete] = useState<Producer | null>(null);

  // Compute farms & cacao area strictly for each producer within the same association
  const getProducerFarms = (producer: Producer) => {
    return farms.filter((f) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-slate-900 tracking-wide">
              Productores de la Asociación
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-num font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
              {producers.length}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {selectedAssociationName 
              ? `Productores asociados exclusivamente a: ${selectedAssociationName}`
              : 'Productores registrados en la asociación seleccionada'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Producer Button */}
          <button
            onClick={onAddProducer}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-emerald"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Adicionar Productor</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-light"
            title="Exportar listado de productores a formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#059669]" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Grid / Table toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'grid' ? 'btn-3d-emerald' : 'btn-3d-light'
              }`}
              title="Vista en tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'table' ? 'btn-3d-emerald' : 'btn-3d-light'
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
        <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-800">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No hay productores en esta asociación</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Puedes adicionar el primer productor vinculado a <strong>{selectedAssociationName || 'esta asociación'}</strong>.
          </p>
          <button
            onClick={onAddProducer}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer btn-3d-emerald"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Adicionar Productor</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {producers.map((producer) => {
            const pFarms = getProducerFarms(producer);
            const totalCacaoHa = pFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
            const cleanPhone = producer.phone?.replace(/[^0-9]/g, '') || '';

            return (
              <div
                key={producer.id}
                className="glass-panel rounded-2xl p-4 hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Initials & Association Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06694b] to-[#044c36] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {producer.producerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#047857] transition line-clamp-1">
                          {producer.producerName}
                        </h3>
                        <p className="text-[11px] font-mono-num text-slate-500">
                          C.C. {producer.documentId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditProducer(producer)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 transition cursor-pointer"
                        title="Editar productor"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProducerToDelete(producer)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 transition cursor-pointer"
                        title="Eliminar productor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Association link info */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span className="truncate">{producer.associationName || selectedAssociationName || 'Asociación Vinculada'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{producer.veredaOrLocation || 'Ubicación General'}</span>
                    </div>

                    {/* Farms & Cacao area indicators */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Trees className="w-3 h-3 text-[#059669]" />
                        <span>{pFarms.length} predio(s)</span>
                      </span>
                      <span className="font-mono-num font-bold text-[#047857]">
                        {totalCacaoHa.toFixed(1)} Ha Cacao
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  {/* Phone & WhatsApp */}
                  <div className="flex items-center gap-1">
                    {producer.phone && (
                      <a
                        href={`tel:${producer.phone}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 transition"
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
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-700 hover:text-green-800 border border-slate-300 transition"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartReception(producer)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-400"
                      title="Registrar pesaje o recepción de cacao"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Recepción</span>
                    </button>

                    <button
                      onClick={() => setSelectedProducer(producer)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer btn-3d-light"
                    >
                      <span>Ficha</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-600 border-b-2 border-slate-300 font-bold">
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
              <tbody className="divide-y divide-slate-200 font-sans">
                {producers.map((producer) => {
                  const pFarms = getProducerFarms(producer);
                  const totalCacaoHa = pFarms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
                  const cleanPhone = producer.phone?.replace(/[^0-9]/g, '') || '';

                  return (
                    <tr key={producer.id} className="hover:bg-emerald-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {producer.producerName}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-600 whitespace-nowrap">
                        {producer.documentId}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                          {producer.associationCode || 'ASOC'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {producer.veredaOrLocation || 'Vereda General'}
                      </td>
                      <td className="py-3 px-4 font-mono-num font-bold text-slate-900">
                        {pFarms.length}
                      </td>
                      <td className="py-3 px-4 font-mono-num font-bold text-[#047857]">
                        {totalCacaoHa.toFixed(1)} Ha
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {producer.phone && (
                            <a
                              href={`tel:${producer.phone}`}
                              className="p-1 rounded bg-slate-100 border border-slate-300 hover:bg-emerald-100 text-slate-700"
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
                              className="p-1 rounded bg-slate-100 border border-slate-300 hover:bg-green-100 text-slate-700"
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
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] border border-emerald-400 text-[11px] font-bold transition cursor-pointer"
                          >
                            Recepción
                          </button>
                          <button
                            onClick={() => setSelectedProducer(producer)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold transition cursor-pointer"
                          >
                            Ficha
                          </button>
                          <button
                            onClick={() => onEditProducer(producer)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 transition cursor-pointer"
                            title="Editar productor"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProducerToDelete(producer)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 transition cursor-pointer"
                            title="Eliminar productor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {producerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl card-3d-outer p-6 bg-white text-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-rose-700 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Eliminar Productor?</h3>
                <p className="text-xs text-slate-600">
                  Se eliminará a <strong>{producerToDelete.producerName}</strong> (C.C. {producerToDelete.documentId}).
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                onClick={() => setProducerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer btn-3d-light"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteProducer(producerToDelete);
                  setProducerToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-slate-900 shadow-[2.5px_3px_0px_#0f172a] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Producer Detail Modal */}
      {selectedProducer && (
        <ProducerDetailModal
          producer={selectedProducer}
          farms={farms}
          producerTemplates={producerTemplates}
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
