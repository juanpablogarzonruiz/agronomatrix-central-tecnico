import React, { useState } from 'react';
import { 
  Trees, 
  MapPin, 
  User, 
  ShieldCheck, 
  LayoutGrid, 
  List, 
  Download, 
  Scale, 
  ChevronRight,
  Filter,
  Compass,
  PlusCircle,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Farm, FarmTemplate } from '../../types';
import { FarmDetailModal } from './FarmDetailModal';

interface FarmListViewProps {
  farms: Farm[];
  farmTemplates?: FarmTemplate[];
  selectedAssociationName?: string;
  onStartReception: (farm: Farm) => void;
  onAddFarm: () => void;
  onEditFarm: (farm: Farm) => void;
  onDeleteFarm: (farm: Farm) => void;
}

export const FarmListView: React.FC<FarmListViewProps> = ({
  farms,
  farmTemplates = [],
  selectedAssociationName,
  onStartReception,
  onAddFarm,
  onEditFarm,
  onDeleteFarm
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedMuniFilter, setSelectedMuniFilter] = useState<string>('all');
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);

  // Municipalities for filtering
  const municipalities = Array.from(
    new Set(farms.map((f) => f.municipality).filter(Boolean))
  ) as string[];

  const filteredFarms = farms.filter((f) => {
    return selectedMuniFilter === 'all' || f.municipality === selectedMuniFilter;
  });

  const exportToCSV = () => {
    const headers = [
      'Nombre Finca',
      'Código Catastral',
      'Productor',
      'Cédula',
      'Asociación',
      'Municipio',
      'Vereda',
      'Área Total (Ha)',
      'Área Cacao (Ha)',
      'Altitud (m)',
      'Clones Principales',
      'Estado EUDR'
    ];
    const rows = filteredFarms.map((f) => {
      const clonesStr = f.cloneDistributions?.map((c) => `${c.cloneName}:${c.plantCount}`).join(';') || '';
      return [
        `"${f.farmName}"`,
        `"${f.cadastralCode || ''}"`,
        `"${f.producerName || ''}"`,
        `"${f.producerDocument || ''}"`,
        `"${f.associationName || ''}"`,
        `"${f.municipality || ''}"`,
        `"${f.vereda || ''}"`,
        f.totalAreaHa || 0,
        f.cacaoAreaHa || 0,
        f.altitudeMeters || '',
        `"${clonesStr}"`,
        `"${f.deforestationStatus || 'compliant'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fincas_${new Date().toISOString().slice(0, 10)}.csv`);
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
              Fincas de la Asociación
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-num font-bold bg-amber-100 text-amber-800 border border-amber-400">
              {filteredFarms.length}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {selectedAssociationName 
              ? `Predios cacaoteros asociados exclusivamente a: ${selectedAssociationName}`
              : 'Predios registrados en la asociación seleccionada'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Farm Button */}
          <button
            onClick={onAddFarm}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-emerald"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Adicionar Finca</span>
          </button>

          {/* Municipality Filter */}
          {municipalities.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border-2 border-slate-300 shadow-[2px_2px_0px_#64748b] rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-[#059669]" />
              <select
                value={selectedMuniFilter}
                onChange={(e) => setSelectedMuniFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white text-slate-900">Todos los municipios</option>
                {municipalities.map((m) => (
                  <option key={m} value={m} className="bg-white text-slate-900">{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d-light"
            title="Exportar listado de predios a formato CSV"
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
      {filteredFarms.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-400 mx-auto flex items-center justify-center text-amber-800">
            <Trees className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No hay fincas registradas en esta asociación</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Puedes adicionar la primera finca cacaotera vinculada a <strong>{selectedAssociationName || 'esta asociación'}</strong>.
          </p>
          <button
            onClick={onAddFarm}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer btn-3d-emerald"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Adicionar Finca</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarms.map((farm) => {
            const cacaoPercent = farm.totalAreaHa && farm.totalAreaHa > 0
              ? Math.min(100, Math.round(((farm.cacaoAreaHa || 0) / farm.totalAreaHa) * 100))
              : 0;
            const mapsUrl = (farm.latitude && farm.longitude)
              ? `https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`
              : null;

            return (
              <div
                key={farm.id}
                className="glass-panel rounded-2xl p-4 hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Name & Edit/Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06694b] to-[#044c36] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white shrink-0">
                        <Trees className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#047857] transition line-clamp-1">
                          {farm.farmName}
                        </h3>
                        <p className="text-[11px] font-mono-num text-slate-500">
                          {farm.cadastralCode || 'Predio Cacaotero'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditFarm(farm)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 transition cursor-pointer"
                        title="Editar finca"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFarmToDelete(farm)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 transition cursor-pointer"
                        title="Eliminar finca"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Owner & Association */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-slate-800 truncate">
                        <User className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span className="font-bold truncate">{farm.producerName}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold bg-emerald-100 text-emerald-800 border border-emerald-400 shrink-0">
                        {farm.cacaoAreaHa || 0} Ha Cacao
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{farm.vereda}, {farm.municipality}</span>
                      {farm.altitudeMeters && (
                        <span className="text-slate-500 font-mono-num">· {farm.altitudeMeters} m</span>
                      )}
                    </div>

                    {/* Area Progress Bar */}
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-600 font-mono-num font-semibold">
                        <span>Cacao: {farm.cacaoAreaHa || 0} Ha</span>
                        <span>Total: {farm.totalAreaHa || 0} Ha ({cacaoPercent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#059669] to-amber-500"
                          style={{ width: `${cacaoPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Clones Chips */}
                    {farm.cloneDistributions && farm.cloneDistributions.length > 0 && (
                      <div className="pt-1.5 flex flex-wrap items-center gap-1">
                        {farm.cloneDistributions.slice(0, 3).map((c) => (
                          <span 
                            key={c.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-[10px] font-mono-num font-bold text-slate-700"
                          >
                            {c.cloneName}: {c.plantCount}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* EUDR & Deforestation Badge */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-[#047857] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>EUDR Verificado</span>
                      </span>
                      {farm.kmlFileName && (
                        <span className="text-[10px] text-slate-500 font-mono-num font-semibold">Polígono ✓</span>
                      )}
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
                      onClick={() => onStartReception(farm)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-400"
                      title="Registrar entrega de lote desde esta finca"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Recepción</span>
                    </button>

                    <button
                      onClick={() => setSelectedFarm(farm)}
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
                  <th className="py-3 px-4">Finca</th>
                  <th className="py-3 px-4">Productor</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Área Cacao</th>
                  <th className="py-3 px-4">Área Total</th>
                  <th className="py-3 px-4">Altitud</th>
                  <th className="py-3 px-4">Clones</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredFarms.map((farm) => (
                  <tr key={farm.id} className="hover:bg-emerald-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {farm.farmName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {farm.producerName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {farm.vereda}, {farm.municipality}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-[#047857] whitespace-nowrap">
                      {farm.cacaoAreaHa || 0} Ha
                    </td>
                    <td className="py-3 px-4 font-mono-num text-slate-600 whitespace-nowrap">
                      {farm.totalAreaHa || 0} Ha
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-amber-700 whitespace-nowrap">
                      {farm.altitudeMeters ? `${farm.altitudeMeters} m` : 'N/D'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {farm.cloneDistributions?.map((c) => c.cloneName).join(', ') || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartReception(farm)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] border border-emerald-400 text-[11px] font-bold transition cursor-pointer"
                        >
                          Recepción
                        </button>
                        <button
                          onClick={() => setSelectedFarm(farm)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          Ficha
                        </button>
                        <button
                          onClick={() => onEditFarm(farm)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 transition cursor-pointer"
                          title="Editar finca"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFarmToDelete(farm)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 transition cursor-pointer"
                          title="Eliminar finca"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {farmToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl card-3d-outer p-6 bg-white text-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-rose-700 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Eliminar Finca?</h3>
                <p className="text-xs text-slate-600">
                  Se eliminará el predio <strong>{farmToDelete.farmName}</strong> ({farmToDelete.producerName}).
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                onClick={() => setFarmToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer btn-3d-light"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteFarm(farmToDelete);
                  setFarmToDelete(null);
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

      {/* Farm Detail Modal */}
      {selectedFarm && (
        <FarmDetailModal
          farm={selectedFarm}
          farmTemplates={farmTemplates}
          onClose={() => setSelectedFarm(null)}
          onStartReception={(f) => {
            setSelectedFarm(null);
            onStartReception(f);
          }}
        />
      )}
    </div>
  );
};
