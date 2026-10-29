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
      <div className="glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono-num uppercase bg-emerald-100 text-emerald-800 border border-emerald-400">
                {isAllSelected ? 'CONSOLIDADO GENERAL' : association?.code || 'ASOCIACIÓN'}
              </span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                {isAllSelected 
                  ? 'Red Nacional de Cooperativas Cacaoteras'
                  : `${association?.municipality || 'Municipio'}, ${association?.department || 'Departamento'}`
                }
              </span>
              {!isAllSelected && association?.certifiedHectares ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-400 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {association.certifiedHectares} Ha Certificadas
                </span>
              ) : null}
            </div>

            <h1 className="text-xl sm:text-2xl font-serif-cacao font-bold text-slate-900 tracking-wide">
              {isAllSelected ? 'Panorama Integral de Asociaciones y Beneficio' : association?.name}
            </h1>

            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {isAllSelected 
                ? 'Monitoreo consolidado del ecosistema de postcosecha: consulte productores vinculados, predios georreferenciados y centrales comunitarias operativas.'
                : association?.description
              }
            </p>
          </div>

          {/* Quick Contact & Info for Selected Association */}
          {!isAllSelected && association && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {association.contactPhone && (
                <a
                  href={`tel:${association.contactPhone}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-3d-emerald"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{association.contactPhone}</span>
                </a>
              )}
              {association.contactEmail && (
                <a
                  href={`mailto:${association.contactEmail}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-3d-light"
                >
                  <Mail className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Contacto</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3 Dynamic Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* KPI 1: Productores */}
        <div 
          onClick={() => onSelectTab('productores')}
          className="glass-panel rounded-2xl p-4 hover:-translate-y-0.5 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              Productores
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-400 shadow-[2px_2px_0px_#059669] flex items-center justify-center text-emerald-800 group-hover:bg-[#047857] group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-slate-900">
              {producers.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">familias registradas</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#059669]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% con Habeas Data firmado</span>
          </div>
        </div>

        {/* KPI 2: Fincas & Área */}
        <div 
          onClick={() => onSelectTab('fincas')}
          className="glass-panel rounded-2xl p-4 hover:-translate-y-0.5 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              Predios Cacaoteros
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-400 shadow-[2px_2px_0px_#d97706] flex items-center justify-center text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-slate-900">
              {farms.length}
            </span>
            <span className="text-xs text-slate-600 font-mono-num font-semibold">
              ({totalCacaoHa.toFixed(1)} Ha Cacao)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Área Total: {totalAreaHa.toFixed(1)} Ha prediales</span>
          </div>
        </div>

        {/* KPI 3: Centrales de Beneficio */}
        <div 
          onClick={() => onSelectTab('centrales')}
          className="glass-panel rounded-2xl p-4 hover:-translate-y-0.5 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              Centrales Beneficio
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-400 shadow-[2px_2px_0px_#0d9488] flex items-center justify-center text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-slate-900">
              {centrales.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">plantas operativas</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-teal-700 font-mono-num font-bold">
            <span>{totalBoxes} cajones</span>
            <span>·</span>
            <span>{totalDryingArea} m² secado</span>
          </div>
        </div>
      </div>

      {/* Clones Distribution Bar */}
      {topClones.length > 0 && (
        <div className="glass-panel-subtle rounded-xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-[#059669]" />
            <span>Clones Predominantes en Predios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {topClones.map(([cloneName, count]) => (
              <span
                key={cloneName}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 shadow-[1.5px_1.5px_0px_#64748b] text-xs text-slate-700 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span className="font-bold text-slate-900">{cloneName}</span>
                <span className="font-mono-num text-[11px] text-slate-500">({count.toLocaleString()} árboles)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
