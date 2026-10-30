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
  Compass,
  Building2
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-slate-900 tracking-wide">
              Centrales de Beneficio Cacaoteras
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-num font-bold bg-teal-100 text-teal-800 border border-teal-400">
              {centrales.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-400">
              Ecosistema Activo
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Centros comunitarios de fermentación controlada, secado solar y transformación postcosecha.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-light"
            title="Exportar listado de centrales a formato CSV"
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
      {centrales.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-400 mx-auto flex items-center justify-center text-teal-800">
            <Factory className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No se encontraron centrales de beneficio</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Actualmente no hay centrales de beneficio registradas o coincidentes con la búsqueda.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centrales.map((central) => {
            const mapsUrl = (central.latitude && central.longitude)
              ? `https://www.google.com/maps?q=${central.latitude},${central.longitude}`
              : null;
            const dryEstimate = Math.round((central.capacityKgPerMonth || 0) * 0.36);

            return (
              <div
                key={central.id}
                className="glass-panel rounded-2xl p-4 hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Name & Code */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white shadow-md shrink-0">
                        <Factory className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#047857] transition line-clamp-1">
                          {central.centralName || central.title}
                        </h3>
                        <p className="text-[11px] font-mono-num text-[#047857] font-bold">
                          {central.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400">
                        {central.status || 'Operativa'}
                      </span>
                    </div>
                  </div>

                  {/* Association & Location */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-2 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span className="truncate">{central.associationName || 'Asociación General Ecosistema'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {central.veredaOrAddress ? `${central.veredaOrAddress}, ` : ''}
                        {central.municipality}, {central.department}
                      </span>
                    </div>

                    {/* Capacity Specs */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Capacidad Baba</span>
                        <span className="font-mono-num font-bold text-slate-900 text-xs">
                          {(central.capacityKgPerMonth / 1000).toFixed(0)}k kg/mes
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Grano Seco Estimado</span>
                        <span className="font-mono-num font-bold text-[#047857] text-xs">
                          {(dryEstimate / 1000).toFixed(1)}k kg/mes
                        </span>
                      </div>
                    </div>

                    {/* Infrastructure details */}
                    <div className="space-y-1 text-[11px] pt-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Boxes className="w-3.5 h-3.5 text-[#059669]" />
                          <span>Fermentación:</span>
                        </span>
                        <span className="font-mono-num font-bold text-slate-900">
                          {central.fermentationBoxesCount} cajones
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Sun className="w-3.5 h-3.5 text-amber-600" />
                          <span>Secado Solar:</span>
                        </span>
                        <span className="font-mono-num font-bold text-slate-900">
                          {central.dryingAreaSqMeters} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 transition flex items-center gap-1 text-[11px] font-bold"
                      title="Ver coordenadas en Google Maps"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">GPS</span>
                    </a>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartReception(central)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-400"
                      title="Registrar pesaje o ingreso de lote a esta central"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Recibir Lote</span>
                    </button>

                    <button
                      onClick={() => setSelectedCentral(central)}
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
              <tbody className="divide-y divide-slate-200 font-sans">
                {centrales.map((central) => (
                  <tr key={central.id} className="hover:bg-emerald-50/60 transition">
                    <td className="py-3 px-4 font-mono-num text-[#047857] whitespace-nowrap font-bold">
                      {central.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {central.centralName || central.title}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {central.associationName || 'Asociación General'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {central.municipality}, {central.department}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-slate-900 whitespace-nowrap">
                      {(central.capacityKgPerMonth / 1000).toFixed(0)}k kg/mes
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-amber-700 whitespace-nowrap">
                      {central.fermentationBoxesCount}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-slate-800 whitespace-nowrap">
                      {central.dryingAreaSqMeters} m²
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-400">
                        {central.status || 'operativa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartReception(central)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-[11px] font-bold transition cursor-pointer border border-emerald-400"
                        >
                          Recibir Lote
                        </button>
                        <button
                          onClick={() => setSelectedCentral(central)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer btn-3d-light"
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
