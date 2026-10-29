import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scale, 
  Factory, 
  User, 
  Trees, 
  Boxes, 
  Thermometer, 
  Sparkles, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { Association, Producer, Farm, CentralBeneficio, ReceptionBatch } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NewReceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReception: (batch: ReceptionBatch) => void;
  associations: Association[];
  producers: Producer[];
  farms: Farm[];
  centrales: CentralBeneficio[];
  preselectedProducer?: Producer | null;
  preselectedFarm?: Farm | null;
  preselectedCentral?: CentralBeneficio | null;
  currentAssociationId?: string;
}

export const NewReceptionModal: React.FC<NewReceptionModalProps> = ({
  isOpen,
  onClose,
  onSaveReception,
  associations,
  producers,
  farms,
  centrales,
  preselectedProducer,
  preselectedFarm,
  preselectedCentral,
  currentAssociationId
}) => {
  const { user } = useAuth();
  const [selectedCentralId, setSelectedCentralId] = useState<string>('');
  const [selectedProducerId, setSelectedProducerId] = useState<string>('');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [weightKgBaba, setWeightKgBaba] = useState<string>('350');
  const [variety, setVariety] = useState<string>('CCN-51 / ICS-95 (Mezcla de Finca)');
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [brixDegrees, setBrixDegrees] = useState<string>('18.5');
  const [tempArrival, setTempArrival] = useState<string>('27.0');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      if (preselectedCentral) {
        setSelectedCentralId(preselectedCentral.id);
      } else if (centrales.length > 0) {
        setSelectedCentralId(centrales[0].id);
      }

      if (preselectedProducer) {
        setSelectedProducerId(preselectedProducer.id);
        const pFarms = farms.filter((f) => f.producerId === preselectedProducer.id);
        setSelectedFarmId(pFarms[0]?.id || '');
      } else if (producers.length > 0) {
        setSelectedProducerId(producers[0].id);
        const pFarms = farms.filter((f) => f.producerId === producers[0].id);
        setSelectedFarmId(pFarms[0]?.id || '');
      } else {
        setSelectedProducerId('');
        setSelectedFarmId('');
      }

      if (preselectedFarm) {
        setSelectedFarmId(preselectedFarm.id);
        if (preselectedFarm.producerId) setSelectedProducerId(preselectedFarm.producerId);
      }

      setError(null);
    }
  }, [isOpen, preselectedProducer, preselectedFarm, preselectedCentral, centrales, producers, farms]);

  // When producer changes, update farm dropdown
  const handleProducerChange = (producerId: string) => {
    setSelectedProducerId(producerId);
    const pFarms = farms.filter((f) => f.producerId === producerId);
    if (pFarms.length > 0) {
      setSelectedFarmId(pFarms[0].id);
    } else {
      setSelectedFarmId('');
    }
  };

  if (!isOpen) return null;

  const currentProducer = producers.find((p) => p.id === selectedProducerId);
  const currentProducerFarms = farms.filter((f) => f.producerId === selectedProducerId);
  const currentCentral = centrales.find((c) => c.id === selectedCentralId);
  const currentFarm = farms.find((f) => f.id === selectedFarmId);

  const numericWeight = parseFloat(weightKgBaba) || 0;
  const estimatedDryKg = Math.round(numericWeight * 0.36);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCentralId) {
      setError('Debes seleccionar una Central de Beneficio para ingresar el lote.');
      return;
    }
    if (!selectedProducerId) {
      setError('Debes seleccionar el Productor cacaotero.');
      return;
    }
    if (!numericWeight || numericWeight <= 0) {
      setError('El peso en baba debe ser mayor a 0 kg.');
      return;
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `LOTE-${currentCentral?.code?.slice(8, 12) || 'POST'}-${year}-${randomSuffix}`;

    const batch: ReceptionBatch = {
      id: `rec_${Date.now()}`,
      batchCode: code,
      centralId: currentCentral?.id || selectedCentralId,
      centralName: currentCentral?.centralName || currentCentral?.title || 'Central de Beneficio',
      associationId: currentProducer?.associationId || currentCentral?.associationId || 'asoc_1',
      associationName: currentProducer?.associationName || currentCentral?.associationName || 'Asociación Vinculada',
      producerId: currentProducer?.id || selectedProducerId,
      producerName: currentProducer?.producerName || 'Productor Registrado',
      farmId: currentFarm?.id || selectedFarmId || 'predio_gen',
      farmName: currentFarm?.farmName || 'Predio Cacaotero',
      weightKgBaba: numericWeight,
      estimatedDryKg: estimatedDryKg,
      cacaoVariety: variety.trim() || 'Cacao Fino de Aroma',
      fermentationBoxNumber: boxNumber || 1,
      brixDegrees: brixDegrees ? parseFloat(brixDegrees) : undefined,
      temperatureArrivalC: tempArrival ? parseFloat(tempArrival) : undefined,
      receivedDate: new Date().toISOString(),
      technicianName: user?.name || 'Ing. Carlos Andrés Mendoza (Central)',
      status: 'fermentacion',
      notes: notes.trim() || undefined
    };

    onSaveReception(batch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nueva Recepción de Cacao en Baba</h2>
              <p className="text-xs text-slate-400">Ingreso a central comunitaria & asignación de cajón</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Central de Beneficio Destination */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-teal-400" />
              <span>Central de Beneficio de Destino *</span>
            </label>
            <select
              value={selectedCentralId}
              onChange={(e) => setSelectedCentralId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              required
            >
              <option value="" disabled>Seleccione una Central...</option>
              {centrales.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.centralName || c.title} ({c.municipality}) - Cap: {(c.capacityKgPerMonth / 1000).toFixed(0)}k kg
                </option>
              ))}
            </select>
          </div>

          {/* Producer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Productor Cacaotero *</span>
              </label>
              <select
                value={selectedProducerId}
                onChange={(e) => handleProducerChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                required
              >
                <option value="" disabled>Seleccione Productor...</option>
                {producers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.producerName} (C.C. {p.documentId})
                  </option>
                ))}
              </select>
            </div>

            {/* Farm Selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-amber-400" />
                <span>Predio / Finca de Origen *</span>
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                required
              >
                {currentProducerFarms.length === 0 ? (
                  <option value="">(Sin fincas registradas para este productor)</option>
                ) : (
                  currentProducerFarms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.farmName} ({f.vereda}) - {f.cacaoAreaHa} Ha
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Weight & Dry Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Peso en Baba (kg) *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={weightKgBaba}
                onChange={(e) => setWeightKgBaba(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono-num text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-emerald-400">Rendimiento Seco Est. (kg)</label>
              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 text-xs font-mono-num font-bold text-emerald-400">
                ~ {estimatedDryKg} kg (36%)
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Nro Cajón</span>
              </label>
              <input
                type="number"
                min="1"
                max={currentCentral?.fermentationBoxesCount || 20}
                value={boxNumber}
                onChange={(e) => setBoxNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono-num text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quality parameters at arrival */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="font-semibold text-slate-300">Grados Brix (°Bx)</label>
              <input
                type="number"
                step="0.1"
                value={brixDegrees}
                onChange={(e) => setBrixDegrees(e.target.value)}
                placeholder="Ej. 18.5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono-num text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Temp. Llegada (°C)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={tempArrival}
                onChange={(e) => setTempArrival(e.target.value)}
                placeholder="Ej. 27.5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono-num text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="font-semibold text-slate-300">Variedad / Clones</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="Ej. CCN-51 / FEAR-5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Observaciones Técnicas de Recepción</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Estado sanitario del grano, mucílago, aroma inicial o condiciones de transporte..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Registrar e Iniciar Fermentación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
