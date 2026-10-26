import React, { useState } from 'react';
import { 
  Trees, 
  Search, 
  MapPin, 
  User, 
  Mountain, 
  Layers, 
  ShieldCheck, 
  LayoutGrid, 
  List, 
  Download, 
  Scale, 
  ExternalLink,
  ChevronRight,
  Filter,
  Compass
} from 'lucide-react';
import { Farm } from '../../types';
import { FarmDetailModal } from './FarmDetailModal';

interface FarmListViewProps {
  farms: Farm[];
  selectedAssociationName?: string;
  onStartReception: (farm: Farm) => void;
}

export const FarmListView: React.FC<FarmListViewProps> = ({
  farms,
  selectedAssociationName,
  onStartReception
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedMuniFilter, setSelectedMuniFilter] = useState<string>('all');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-white tracking-wide">
              Listado de Fincas Cacaoteras
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono-num font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {filteredFarms.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedAssociationName 
              ? `Predios georreferenciados vinculados a: ${selectedAssociationName}`
              : 'Fichas prediales con coordenadas, distribución clonal y estado antideforestación'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Municipality Filter */}
          {municipalities.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-emerald-400" />
              <select
                value={selectedMuniFilter}
                onChange={(e) => setSelectedMuniFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">Todos los municipios</option>
                {municipalities.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-white/10"
            title="Exportar listado de predios a formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
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
      {filteredFarms.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
            <Trees className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No se encontraron fincas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay predios registrados bajo los criterios seleccionados.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-amber-500/40 transition duration-200 flex flex-col justify-between group shadow-lg hover:shadow-amber-950/20"
              >
                <div>
                  {/* Top Bar: Name & Cadastral */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-emerald-800 flex items-center justify-center text-white shadow-md">
                        <Trees className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition line-clamp-1">
                          {farm.farmName}
                        </h3>
                        <p className="text-[11px] font-mono-num text-slate-400">
                          {farm.cadastralCode || 'Predio Cacaotero'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                      {farm.cacaoAreaHa || 0} Ha Cacao
                    </span>
                  </div>

                  {/* Owner & Association */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white truncate">{farm.producerName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{farm.vereda}, {farm.municipality}</span>
                      {farm.altitudeMeters && (
                        <span className="text-slate-500 font-mono-num">· {farm.altitudeMeters} m</span>
                      )}
                    </div>

                    {/* Area Progress Bar */}
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono-num">
                        <span>Cacao: {farm.cacaoAreaHa || 0} Ha</span>
                        <span>Total: {farm.totalAreaHa || 0} Ha ({cacaoPercent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500"
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
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-mono-num text-slate-300"
                          >
                            {c.cloneName}: {c.plantCount}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* EUDR & Deforestation Badge */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>EUDR Verificado</span>
                      </span>
                      {farm.kmlFileName && (
                        <span className="text-[10px] text-slate-400 font-mono-num">Polígono ✓</span>
                      )}
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
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition flex items-center gap-1 text-[11px]"
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
                      onClick={() => onStartReception(farm)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border border-amber-500/20"
                      title="Registrar entrega de lote desde esta finca"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Recepción</span>
                    </button>

                    <button
                      onClick={() => setSelectedFarm(farm)}
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
                  <th className="py-3 px-4">Finca</th>
                  <th className="py-3 px-4">Productor</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Área Cacao</th>
                  <th className="py-3 px-4">Área Total</th>
                  <th className="py-3 px-4">Altitud</th>
                  <th className="py-3 px-4">Clones</th>
                  <th className="py-3 px-4">EUDR</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredFarms.map((farm) => (
                  <tr key={farm.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {farm.farmName}
                    </td>
                    <td className="py-3 px-4 text-slate-200 whitespace-nowrap">
                      {farm.producerName}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {farm.vereda}, {farm.municipality}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-semibold text-emerald-400 whitespace-nowrap">
                      {farm.cacaoAreaHa || 0} Ha
                    </td>
                    <td className="py-3 px-4 font-mono-num text-slate-400 whitespace-nowrap">
                      {farm.totalAreaHa || 0} Ha
                    </td>
                    <td className="py-3 px-4 font-mono-num text-amber-300 whitespace-nowrap">
                      {farm.altitudeMeters ? `${farm.altitudeMeters} m` : 'N/D'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-slate-300">
                        {farm.cloneDistributions?.map((c) => c.cloneName).join(', ') || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {farm.deforestationStatus || 'compliant'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartReception(farm)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Recepción
                        </button>
                        <button
                          onClick={() => setSelectedFarm(farm)}
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

      {/* Farm Detail Modal */}
      {selectedFarm && (
        <FarmDetailModal
          farm={selectedFarm}
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
