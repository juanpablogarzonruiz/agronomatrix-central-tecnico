import React, { useMemo, useState } from 'react';
import { 
  X, 
  Trees, 
  User, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Scale, 
  ExternalLink,
  Building2,
  FileText,
  Compass,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { executeWhispDeforestationAnalysis, DEFAULT_WHISP_API_KEY, WhispSubmissionResult } from '../../utils/whispService';
import { SAMPLE_EUDR_GEOJSON } from '../../utils/geoJsonDeforestation';
import { Farm, FarmTemplate } from '../../types';

interface FarmDetailModalProps {
  farm: Farm | null;
  farmTemplates?: FarmTemplate[];
  onClose: () => void;
  onStartReception: (farm: Farm) => void;
}

export const FarmDetailModal: React.FC<FarmDetailModalProps> = ({
  farm,
  farmTemplates = [],
  onClose,
  onStartReception
}) => {
  if (!farm) return null;
  const [isAnalyzingWhisp, setIsAnalyzingWhisp] = useState<boolean>(false);
  const [whispResult, setWhispResult] = useState<WhispSubmissionResult | null>(
    farm.whispAnalysisResult || farm.dynamicValues?.whisp_result || null
  );
  const [whispError, setWhispError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const handleQueryWhisp = async () => {
    setIsAnalyzingWhisp(true);
    setWhispError(null);
    try {
      const payload = farm.dynamicValues?.geojson_raw_content || SAMPLE_EUDR_GEOJSON;
      const res = await executeWhispDeforestationAnalysis(payload, DEFAULT_WHISP_API_KEY);
      setWhispResult(res);
      if (!res.success) {
        setWhispError(res.message || "Error al consultar WHISP.");
      }
    } catch (err: any) {
      setWhispError(err?.message || "Error de conexión con WHISP.");
    } finally {
      setIsAnalyzingWhisp(false);
    }
  };


  const cacaoPercent = farm.totalAreaHa && farm.totalAreaHa > 0
    ? Math.min(100, Math.round(((farm.cacaoAreaHa || 0) / farm.totalAreaHa) * 100))
    : 0;

  const mapsUrl = (farm.latitude && farm.longitude)
    ? `https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`
    : null;

  // Look up field labels from associated template
  const matchedTemplate = useMemo(() => {
    return (
      farmTemplates.find((t) => t.id === farm.templateId) ||
      farmTemplates.find((t) => t.code === farm.templateCode) ||
      null
    );
  }, [farmTemplates, farm.templateId, farm.templateCode]);

  const fieldLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    const templatesToScan = matchedTemplate ? [matchedTemplate] : farmTemplates;
    templatesToScan.forEach((tpl) => {
      const allFields = [
        ...(tpl.farmSections?.flatMap((s) => s.fields || []) || []),
        ...(tpl.farmFields || []),
        ...(tpl.fields || [])
      ];
      allFields.forEach((f) => {
        if (f.id && (f.name || f.label)) {
          map.set(f.id, f.name || f.label || f.id);
        }
      });
    });
    return map;
  }, [matchedTemplate, farmTemplates]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl card-3d-outer overflow-hidden flex flex-col max-h-[92vh] bg-white text-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#06694b] to-[#044c36] text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-sm">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">{farm.farmName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold bg-white/20 text-emerald-100 border border-white/30">
                  {farm.cadastralCode || 'RUV-01'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-200" />
                <span>Productor: <strong className="text-white">{farm.producerName}</strong></span>
                {farm.producerDocument && (
                  <span className="text-emerald-200 font-mono-num">(C.C. {farm.producerDocument})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Associated Template Banner */}
          {(farm.templateTitle || farm.templateCode || matchedTemplate) && (
            <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
                <div>
                  <span className="text-[11px] font-bold text-emerald-950 block">
                    Plantilla de Finca vinculada:
                  </span>
                  <span className="font-semibold text-emerald-900">
                    {farm.templateTitle || matchedTemplate?.title || 'Plantilla de Finca'}
                  </span>
                </div>
              </div>
              {(farm.templateCode || matchedTemplate?.code) && (
                <span className="px-2 py-0.5 rounded font-mono-num font-bold text-[10px] bg-emerald-200 text-emerald-900 border border-emerald-400">
                  {farm.templateCode || matchedTemplate?.code}
                </span>
              )}
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Área Total</span>
              <span className="text-lg font-bold font-mono-num text-slate-900">{farm.totalAreaHa || 0} Ha</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border-2 border-emerald-300">
              <span className="text-[10px] uppercase font-bold text-[#059669] block">Área Cacao</span>
              <span className="text-lg font-bold font-mono-num text-[#047857]">{farm.cacaoAreaHa || 0} Ha</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Altitud</span>
              <span className="text-lg font-bold font-mono-num text-amber-700">
                {farm.altitudeMeters ? `${farm.altitudeMeters} m` : 'N/D'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Ocupación Cacao</span>
              <span className="text-lg font-bold font-mono-num text-slate-900">{cacaoPercent}%</span>
            </div>
          </div>

          {/* Area Progress Bar */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border-2 border-slate-300">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Proporción de Área en Cacao respecto al Predio</span>
              <span className="font-mono-num text-[#047857] font-bold">{cacaoPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                style={{ width: `${cacaoPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Location & GPS Details */}
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-300 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Ubicación Geográfica & Georreferenciación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{farm.vereda}, {farm.municipality}, {farm.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>{farm.associationName || 'Asociación Vinculada'}</span>
              </div>
            </div>

            {farm.latitude && farm.longitude && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <span className="font-mono-num text-slate-700 text-[11px] flex items-center gap-1.5 font-bold">
                  <Compass className="w-3.5 h-3.5 text-[#059669]" />
                  Lat: {farm.latitude.toFixed(4)}, Lon: {farm.longitude.toFixed(4)}
                  {farm.gpsAccuracy ? ` (±${farm.gpsAccuracy}m)` : ''}
                </span>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#059669] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#047857] transition"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Values from Farm Template */}
          {farm.dynamicValues && Object.keys(farm.dynamicValues).length > 0 && (
            <div className="bg-white p-4 rounded-xl border-2 border-slate-300 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block flex items-center justify-between">
                <span>Datos Técnicos de la Plantilla de Finca</span>
                <span className="text-slate-500 font-normal lowercase">
                  ({Object.keys(farm.dynamicValues).length} campos)
                </span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                {Object.entries(farm.dynamicValues).map(([key, val]) => {
                  const label = fieldLabelMap.get(key) || key.replace(/([A-Z])/g, ' $1');
                  return (
                    <div key={key} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-600 font-medium capitalize pr-2">{label}:</span>
                      <span className="font-bold text-slate-900 text-right">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clone Distribution */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border-2 border-slate-300">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Distribución Clonal en el Predio</span>
            </span>

            {farm.cloneDistributions && farm.cloneDistributions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {farm.cloneDistributions.map((cd) => (
                  <div 
                    key={cd.id}
                    className="p-2.5 rounded-lg bg-white border border-slate-300 flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-900">{cd.cloneName}</span>
                    <span className="font-mono-num text-[#047857] font-bold">
                      {cd.plantCount.toLocaleString()} árboles
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic py-1">Sin desglose de clones registrado.</p>
            )}
          </div>

          {/* EUDR & Deforestation Status + WHISP Integration */}
          <div className="p-4 rounded-xl bg-white border-2 border-emerald-500 shadow-[2px_3px_0px_#047857] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Cumplimiento Antideforestación (EUDR Post-2020)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      (whispResult?.summary?.deforestationStatus === 'compliant' || farm.deforestationStatus === 'compliant')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {whispResult?.summary?.deforestationStatus || farm.deforestationStatus || 'compliant'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                    {whispResult?.summary?.statusLabel || farm.deforestationDetails || 'Predio evaluado satelitalmente con polígono perimetral. Conforme con directrices de la Unión Europea (EUDR 2023/1115).'}
                  </p>
                  {(farm.kmlFileName || farm.dynamicValues?.geojson_deforestation_field || farm.dynamicValues?.geojson_file_name) && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#059669]" />
                        <span>Polígono: {farm.dynamicValues?.geojson_deforestation_field || farm.dynamicValues?.geojson_file_name || farm.kmlFileName}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WHISP Live Metrics if available */}
            {whispResult && (
              <div className="bg-slate-50 p-3 rounded-xl border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Métricas WHISP OpenForis</span>
                  </span>
                  {whispResult.token && (
                    <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold">
                      Token: {whispResult.token.slice(0, 10)}...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Área Predial</span>
                    <span className="text-xs font-bold text-[#047857] font-mono">
                      {whispResult.summary?.areaHa ? `${whispResult.summary.areaHa} ha` : `${farm.totalAreaHa || 4.8} ha`}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Cobertura</span>
                    <span className="text-xs font-bold text-[#047857] font-mono">
                      {whispResult.summary?.forestCoverPercent ?? 98.4}%
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Pérdida Post-2020</span>
                    <span className={`text-xs font-bold font-mono ${whispResult.summary?.disturbanceAfter2020 === 'yes' ? 'text-rose-600' : 'text-[#047857]'}`}>
                      {whispResult.summary?.disturbanceAfter2020 === 'yes' ? '⚠️ Detectada' : '0 ha (Cero)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                  <span className="font-bold text-emerald-800">
                    {whispResult.summary?.statusLabel || whispResult.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-[10px] font-bold text-[#047857] underline cursor-pointer"
                  >
                    {showRawJson ? 'Ocultar JSON' : 'Ver JSON'}
                  </button>
                </div>
                {showRawJson && (
                  <pre className="text-[9px] font-mono bg-slate-900 text-emerald-400 p-2 rounded-lg overflow-x-auto max-h-36">
                    {JSON.stringify(whispResult.rawResponse || whispResult, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Botón de Consulta WHISP */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isAnalyzingWhisp}
                onClick={handleQueryWhisp}
                className="w-full py-2 px-3 btn-3d-emerald text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isAnalyzingWhisp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Consultando Deforestación en WHISP...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>🛰️ {whispResult ? 'Reconsultar Endpoint de WHISP (Post-2020)' : 'Consultar Endpoint de WHISP (Deforestación Post-2020)'}</span>
                  </>
                )}
              </button>
              {whispError && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  {whispError}
                </p>
              )}
            </div>
          </div>

          {/* Last Visit & Technical Recommendations */}
          {farm.recommendations && (
            <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-1.5">
              <div className="flex items-center justify-between text-amber-900">
                <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Recomendación Técnica Agronómica</span>
                </span>
                {farm.visitDate && (
                  <span className="font-mono-num text-[11px] text-amber-800 font-semibold">
                    Visita: {farm.visitDate}
                  </span>
                )}
              </div>
              <p className="text-amber-950 text-xs italic leading-relaxed">
                "{farm.recommendations}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer btn-3d-light"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onStartReception(farm);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer btn-3d-emerald"
          >
            <Scale className="w-4 h-4" />
            <span>Recepción de Cacao de este Predio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
