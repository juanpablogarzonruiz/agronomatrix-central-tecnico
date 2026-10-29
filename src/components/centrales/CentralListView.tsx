import React, { useState } from 'react';
import { 
  Factory, 
  Search, 
  MapPin, 
  Scale, 
  Layers, 
  Sun, 
  Boxes, 
  LayoutGrid, 
  List, 
  Download, 
  ChevronRight,
  ExternalLink,
  Activity,
  Compass
} from 'lucide-react';
import { CentralBeneficio } from '../../types';
import { CentralDetailModal } from './CentralDetailModal';

interface CentralListViewProps {
  centrales: CentralBeneficio[];
  selectedAssociationName?: string;
  onStartReception: (central: CentralBeneficio) => void;
}

export const CentralListView: React.FC<CentralListViewProps> = ({
  centrales,
  selectedAssociationName,
  onStartReception
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCentral, setSelectedCentral] = useState<CentralBeneficio | null>(null);

  const exportToCSV = () => {
    const headers = [
      'Código',
      'Nombre Central',
      'Asociación',
      'Departamento',
      'Municipio',
      'Capacidad (kg/mes)',
      'Nro Cajones',
      'Tipo Fermentación',
      'Área Secado (m²)',
      'Tipo Secado',
      'Estado'
    ];
    const rows = centrales.map((c) => [
      `"${c.code}"`,
      `"${c.centralName || c.title}"`,
      `"${c.associationName || ''}"`,
      `"${c.department}"`,
      `"${c.municipality}"`,
      c.capacityKgPerMonth || 0,
      c.fermentationBoxesCount || 0,
      `"${c.fermentationType || ''}"`,
      c.dryingAreaSqMeters || 0,
      `"${c.dryingType || ''}"`,
      `"${c.status}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `centrales_beneficio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-slate-900 tracking-wide">
              Centrales de Beneficio Cacaoteras
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-num font-bold bg-teal-100 text-teal-800 border border-teal-400">
              {centrales.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700 border border-slate-400">
              Red General · Independiente de Asociación
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Centros comunitarios de fermentación, secado solar y transformación postcosecha de todo el ecosistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-white/10"
            title="Exportar listado de centrales a formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
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
      {centrales.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
            <Factory className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No se encontraron centrales de beneficio</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay centrales registradas para la asociación seleccionada.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {centrales.map((central) => {
            const mapsUrl = (central.latitude && central.longitude)
              ? `https://www.google.com/maps?q=${central.latitude},${central.longitude}`
              : null;
            const dryEstimate = Math.round((central.capacityKgPerMonth || 0) * 0.36);

            return (
              <div
                key={central.id}
                className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-teal-500/40 transition duration-200 flex flex-col justify-between group shadow-lg hover:shadow-teal-950/20"
              >
                <div>
                  {/* Top Bar: Name & Code */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center text-white shadow-md">
                        <Factory className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-teal-300 transition line-clamp-1">
                          {central.centralName || central.title}
                        </h3>
                        <p className="text-[11px] font-mono-num text-slate-400">
                          {central.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold uppercase text-emerald-400">
                        {central.status || 'Operativa'}
                      </span>
                    </div>
                  </div>

                  {/* Association & Location */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {central.veredaOrAddress ? `${central.veredaOrAddress}, ` : ''}
                        {central.municipality}, {central.department}
                      </span>
                    </div>

                    {/* Capacity Specs */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Capacidad Mensual</span>
                        <span className="font-mono-num font-bold text-white text-xs">
                          {(central.capacityKgPerMonth / 1000).toFixed(0)}k kg baba
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Grano Seco Estimado</span>
                        <span className="font-mono-num font-bold text-teal-300 text-xs">
                          {(dryEstimate / 1000).toFixed(1)}k kg/mes
                        </span>
                      </div>
                    </div>

                    {/* Infrastructure details */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Boxes className="w-3 h-3 text-emerald-400" />
                          <span>Fermentación:</span>
                        </span>
                        <span className="font-mono-num font-semibold text-white">
                          {central.fermentationBoxesCount} cajones
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Sun className="w-3 h-3 text-amber-400" />
                          <span>Secado Solar:</span>
                        </span>
                        <span className="font-mono-num font-semibold text-white">
                          {central.dryingAreaSqMeters} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 transition flex items-center gap-1 text-[11px]"
                      title="Ver coordenadas en Google Maps"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">GPS</span>
                    </a>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartReception(central)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border border-teal-500/20"
                      title="Registrar pesaje o ingreso de lote a esta central"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Recibir Lote</span>
                    </button>

                    <button
                      onClick={() => setSelectedCentral(central)}
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
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Central de Beneficio</th>
                  <th className="py-3 px-4">Asociación</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Capacidad Baba</th>
                  <th className="py-3 px-4">Cajones</th>
                  <th className="py-3 px-4">Área Secado</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {centrales.map((central) => (
                  <tr key={central.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-mono-num text-teal-300 whitespace-nowrap font-bold">
                      {central.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {central.centralName || central.title}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {central.associationName || 'Asociación General'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {central.municipality}, {central.department}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-white whitespace-nowrap">
                      {(central.capacityKgPerMonth / 1000).toFixed(0)}k kg/mes
                    </td>
                    <td className="py-3 px-4 font-mono-num text-amber-300 whitespace-nowrap">
                      {central.fermentationBoxesCount}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-slate-300 whitespace-nowrap">
                      {central.dryingAreaSqMeters} m²
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {central.status || 'operativa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartReception(central)}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Recibir Lote
                        </button>
                        <button
                          onClick={() => setSelectedCentral(central)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition cursor-pointer"
                        >
                          Ver Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Central Detail Modal */}
      {selectedCentral && (
        <CentralDetailModal
          central={selectedCentral}
          onClose={() => setSelectedCentral(null)}
          onStartReception={(c) => {
            setSelectedCentral(null);
            onStartReception(c);
          }}
        />
      )}
    </div>
  );
};
