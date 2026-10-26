import React from 'react';
import { 
  Building2, 
  Users, 
  Trees, 
  Factory, 
  Scale, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  ShieldCheck, 
  Layers,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Association, Producer, Farm, CentralBeneficio } from '../../types';

interface AssociationStatsProps {
  association?: Association;
  isAllSelected: boolean;
  producers: Producer[];
  farms: Farm[];
  centrales: CentralBeneficio[];
  onSelectTab: (tab: any) => void;
}

export const AssociationStats: React.FC<AssociationStatsProps> = ({
  association,
  isAllSelected,
  producers,
  farms,
  centrales,
  onSelectTab
}) => {
  // Calculated aggregations
  const totalAreaHa = farms.reduce((acc, f) => acc + (f.totalAreaHa || 0), 0);
  const totalCacaoHa = farms.reduce((acc, f) => acc + (f.cacaoAreaHa || 0), 0);
  const totalCapacityKg = centrales.reduce((acc, c) => acc + (c.capacityKgPerMonth || 0), 0);
  const totalBoxes = centrales.reduce((acc, c) => acc + (c.fermentationBoxesCount || 0), 0);
  const totalDryingArea = centrales.reduce((acc, c) => acc + (c.dryingAreaSqMeters || 0), 0);

  // Clones aggregate
  const cloneCounts: Record<string, number> = {};
  farms.forEach((f) => {
    f.cloneDistributions?.forEach((cd) => {
      cloneCounts[cd.cloneName] = (cloneCounts[cd.cloneName] || 0) + (cd.plantCount || 0);
    });
  });
  const topClones = Object.entries(cloneCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Association Header Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/20 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono-num uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isAllSelected ? 'CONSOLIDADO GENERAL' : association?.code || 'ASOCIACIÓN'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {isAllSelected 
                  ? 'Red Nacional de Cooperativas Cacaoteras'
                  : `${association?.municipality || 'Municipio'}, ${association?.department || 'Departamento'}`
                }
              </span>
              {!isAllSelected && association?.certifiedHectares ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {association.certifiedHectares} Ha Certificadas
                </span>
              ) : null}
            </div>

            <h1 className="text-xl sm:text-2xl font-serif-cacao font-bold text-white tracking-wide">
              {isAllSelected ? 'Panorama Integral de Asociaciones y Beneficio' : association?.name}
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isAllSelected 
                ? 'Monitoreo consolidado del ecosistema de postcosecha: consulte productores vinculados, predios georreferenciados y centrales comunitarias operativas.'
                : association?.description
              }
            </p>
          </div>

          {/* Quick Contact & Info for Selected Association */}
          {!isAllSelected && association && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {association.contactPhone && (
                <a
                  href={`tel:${association.contactPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-500/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{association.contactPhone}</span>
                </a>
              )}
              {association.contactEmail && (
                <a
                  href={`mailto:${association.contactEmail}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition border border-white/5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contacto</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4 Dynamic Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: Productores */}
        <div 
          onClick={() => onSelectTab('productores')}
          className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Productores
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-white">
              {producers.length}
            </span>
            <span className="text-xs text-slate-400">familias registradas</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% con Habeas Data firmado</span>
          </div>
        </div>

        {/* KPI 2: Fincas & Área */}
        <div 
          onClick={() => onSelectTab('fincas')}
          className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Predios Cacaoteros
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-white">
              {farms.length}
            </span>
            <span className="text-xs text-slate-400 font-mono-num">
              ({totalCacaoHa.toFixed(1)} Ha Cacao)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Área Total: {totalAreaHa.toFixed(1)} Ha prediales</span>
          </div>
        </div>

        {/* KPI 3: Centrales de Beneficio */}
        <div 
          onClick={() => onSelectTab('centrales')}
          className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Centrales Beneficio
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-white">
              {centrales.length}
            </span>
            <span className="text-xs text-slate-400">plantas operativas</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-teal-400 font-mono-num">
            <span>{totalBoxes} cajones</span>
            <span>·</span>
            <span>{totalDryingArea} m² secado</span>
          </div>
        </div>

        {/* KPI 4: Capacidad Mensual */}
        <div 
          onClick={() => onSelectTab('centrales')}
          className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Capacidad Mensual
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-white">
              {(totalCapacityKg / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-mono-num">kg baba/mes</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-300">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Potencial: {(totalCapacityKg * 0.36 / 1000).toFixed(1)}k kg grano seco</span>
          </div>
        </div>
      </div>

      {/* Clones Distribution Bar */}
      {topClones.length > 0 && (
        <div className="glass-panel-subtle rounded-xl p-3 px-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Clones Predominantes en Predios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {topClones.map(([cloneName, count]) => (
              <span
                key={cloneName}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold text-white">{cloneName}</span>
                <span className="font-mono-num text-[11px] text-slate-400">({count.toLocaleString()} árboles)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
