import React, { useState } from 'react';
import { 
  Sprout, 
  Layers, 
  Award, 
  ShieldCheck, 
  Thermometer, 
  Scale, 
  Mountain, 
  LayoutGrid, 
  List, 
  Sparkles 
} from 'lucide-react';
import { CacaoClone, Farm } from '../../types';

interface CloneListViewProps {
  clones: CacaoClone[];
  allFarms: Farm[];
}

export const CloneListView: React.FC<CloneListViewProps> = ({
  clones,
  allFarms
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Compute how many trees and farms have each clone across the entire ecosystem
  const getCloneStats = (cloneCode: string) => {
    let totalTrees = 0;
    let farmsWithClone = 0;

    allFarms.forEach((f) => {
      const match = f.cloneDistributions?.find(
        (cd) =>
          cd.cloneName.toLowerCase() === cloneCode.toLowerCase() ||
          cd.cloneName.toLowerCase().includes(cloneCode.toLowerCase())
      );
      if (match) {
        totalTrees += match.plantCount || 0;
        farmsWithClone += 1;
      }
    });

    return { totalTrees, farmsWithClone };
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-serif-cacao font-bold text-slate-900 tracking-wide">
              Catálogo Genético de Clones de Cacao
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-num font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
              {clones.length} Clones
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700 border border-slate-400">
              Catálogo General · Independiente de Asociación
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Materiales genéticos registrados en el ecosistema con perfil sensorial, índice de grano, productividad y protocolo de fermentación.
          </p>
        </div>

        {/* Grid / Table toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid' ? 'btn-3d-emerald' : 'btn-3d-light'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'btn-3d-emerald' : 'btn-3d-light'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clones.map((clone) => {
            const stats = getCloneStats(clone.code);

            return (
              <div
                key={clone.id}
                className="glass-panel rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-0.5 transition duration-200"
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#06694b] to-[#044c36] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white font-mono-num font-bold text-xs shrink-0">
                        {clone.code.slice(0, 6)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {clone.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {clone.origin}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-400 shrink-0">
                      {clone.category}
                    </span>
                  </div>

                  {/* Sensory Profile */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Perfil Sensorial de Taza
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {clone.sensoryProfile}
                    </p>
                  </div>

                  {/* Technical Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-300">
                      <span className="text-[10px] text-slate-500 block font-semibold">Índice Grano</span>
                      <span className="font-mono-num font-bold text-xs text-slate-900">{clone.grainIndexGrams} g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-300">
                      <span className="text-[10px] text-slate-500 block font-semibold">Índice Mazorca</span>
                      <span className="font-mono-num font-bold text-xs text-slate-900">{clone.podIndex} maz/kg</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-300">
                      <span className="text-[10px] text-slate-500 block font-semibold">Rendimiento</span>
                      <span className="font-mono-num font-bold text-xs text-[#047857]">{clone.yieldKgHaYear} kg/Ha</span>
                    </div>
                  </div>

                  {/* Resistance & Fermentation */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Mountain className="w-3.5 h-3.5 text-amber-600" />
                        Altitud Óptima:
                      </span>
                      <span className="font-mono-num font-bold text-slate-900">{clone.altitudeRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                        Tolerancia Monilia:
                      </span>
                      <span className="font-bold text-emerald-800">{clone.moniliaResistance}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                        Fermentación en Central:
                      </span>
                      <span className="font-mono-num font-bold text-slate-900">{clone.fermentationDays} días</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Ecosystem Presence */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-[#059669]" />
                    <span>En {stats.farmsWithClone} finca(s) del ecosistema</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 font-mono-num font-bold text-slate-800">
                    {stats.totalTrees.toLocaleString()} árboles
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-600 border-b-2 border-slate-300 font-bold">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Nombre del Clon</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Índice Grano</th>
                  <th className="py-3 px-4">Rendimiento</th>
                  <th className="py-3 px-4">Fermentación</th>
                  <th className="py-3 px-4">Resistencia Monilia</th>
                  <th className="py-3 px-4">Árboles en Fincas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clones.map((clone) => {
                  const stats = getCloneStats(clone.code);
                  return (
                    <tr key={clone.id} className="hover:bg-emerald-50/60 transition">
                      <td className="py-3 px-4 font-mono-num font-bold text-[#047857] whitespace-nowrap">
                        {clone.code}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {clone.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                          {clone.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-num font-semibold text-slate-800">
                        {clone.grainIndexGrams} g
                      </td>
                      <td className="py-3 px-4 font-mono-num font-bold text-[#047857]">
                        {clone.yieldKgHaYear} kg/Ha/año
                      </td>
                      <td className="py-3 px-4 font-mono-num text-slate-700">
                        {clone.fermentationDays} días
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {clone.moniliaResistance}
                      </td>
                      <td className="py-3 px-4 font-mono-num font-bold text-slate-900">
                        {stats.totalTrees.toLocaleString()} ({stats.farmsWithClone} fincas)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

