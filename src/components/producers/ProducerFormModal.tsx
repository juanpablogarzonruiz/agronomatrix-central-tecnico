import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  UserCheck, 
  Building2, 
  Lock,
  FileSpreadsheet,
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  Save,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Association, Producer, ProducerTemplate, TemplateField, TemplateSection } from '../../types';

interface ProducerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producer: Producer) => void;
  initialProducer?: Producer | null;
  associations: Association[];
  producerTemplates: ProducerTemplate[];
  selectedAssociationId: string;
}

export const ProducerFormModal: React.FC<ProducerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProducer,
  associations,
  producerTemplates,
  selectedAssociationId
}) => {
  const isEditing = Boolean(initialProducer);

  // Locked association: always the currently selected association
  const currentAssociation = useMemo(() => {
    return associations.find((a) => a.id === selectedAssociationId) || associations[0];
  }, [associations, selectedAssociationId]);

  // Strictly filter producer templates belonging to the active association
  const associationTemplates = useMemo(() => {
    if (!currentAssociation) return [];
    return producerTemplates.filter((t) => {
      if (t.associationId && t.associationId.trim() !== '') {
        return t.associationId === currentAssociation.id;
      }
      if (t.associationCode && currentAssociation.code) {
        return t.associationCode.trim().toUpperCase() === currentAssociation.code.trim().toUpperCase();
      }
      if (t.associationName && currentAssociation.name) {
        return t.associationName.trim().toLowerCase() === currentAssociation.name.trim().toLowerCase();
      }
      return false;
    });
  }, [producerTemplates, currentAssociation]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [fallbackName, setFallbackName] = useState<string>('');
  const [fallbackDoc, setFallbackDoc] = useState<string>('');
  const [fallbackPhone, setFallbackPhone] = useState<string>('');
  const [veredaOrLocation, setVeredaOrLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [dataAuthorization, setDataAuthorization] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(() => {
    return associationTemplates.find((t) => t.id === selectedTemplateId) || null;
  }, [associationTemplates, selectedTemplateId]);

  // Compute sections & flat fields for the selected template
  const templateSections = useMemo<TemplateSection[]>(() => {
    if (!selectedTemplate) return [];
    if (selectedTemplate.producerSections && selectedTemplate.producerSections.length > 0) {
      return selectedTemplate.producerSections;
    }
    const flatFields =
      selectedTemplate.producerFields && selectedTemplate.producerFields.length > 0
        ? selectedTemplate.producerFields
        : selectedTemplate.fields || [];
    if (flatFields.length === 0) return [];
    return [
      {
        id: 'sec_default',
        name: 'Campos de la Plantilla de Productor',
        description: selectedTemplate.description || 'Diligencia los datos definidos en la plantilla.',
        fields: flatFields
      }
    ];
  }, [selectedTemplate]);

  const allTemplateFields = useMemo<TemplateField[]>(() => {
    return templateSections.flatMap((s) => s.fields || []);
  }, [templateSections]);

  // Detect whether template already includes core fields
  const nameField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return /nombres?\s*completos?|nombre\s*del\s*productor|^nombres?$/i.test(label);
      }),
    [allTemplateFields]
  );

  const lastNameField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return /apellidos?\s*completos?|^apellidos?$/i.test(label);
      }),
    [allTemplateFields]
  );

  const docNumberField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return (
          /n[uú]mero\s*de\s*documento|c[eé]dula|documento\s*de\s*identidad|identificaci[oó]n/i.test(label) &&
          !/tipo\s*de\s*documento/i.test(label)
        );
      }),
    [allTemplateFields]
  );

  const phoneField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return f.type === 'tel' || /tel[eé]fono\s*principal|tel[eé]fono|celular|whatsapp/i.test(label);
      }),
    [allTemplateFields]
  );

  const locationField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return /vereda|ubicaci[oó]n|corregimiento|direcci[oó]n/i.test(label);
      }),
    [allTemplateFields]
  );

  // Initialize modal state on open
  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (initialProducer) {
      const matchedTpl =
        associationTemplates.find((t) => t.id === initialProducer.templateId) ||
        associationTemplates.find((t) => t.code === initialProducer.templateCode) ||
        (associationTemplates.length === 1 ? associationTemplates[0] : null);

      setSelectedTemplateId(matchedTpl?.id || '');
      setDynamicValues({ ...(initialProducer.dynamicValues || {}) });
      setFallbackName(initialProducer.producerName || '');
      setFallbackDoc(initialProducer.documentId || '');
      setFallbackPhone(initialProducer.phone || '');
      setVeredaOrLocation(initialProducer.veredaOrLocation || '');
      setLatitude(initialProducer.latitude !== undefined ? String(initialProducer.latitude) : '');
      setLongitude(initialProducer.longitude !== undefined ? String(initialProducer.longitude) : '');
      setDataAuthorization(initialProducer.dataAuthorization ?? true);
    } else {
      // Require user to select the producer template associated with this association
      setSelectedTemplateId('');
      setDynamicValues({});
      setFallbackName('');
      setFallbackDoc('');
      setFallbackPhone('');
      setVeredaOrLocation('');
      setLatitude('');
      setLongitude('');
      setDataAuthorization(true);
    }
  }, [isOpen, initialProducer, associationTemplates]);

  // When a template is selected, initialize default values for fields not yet present
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    setError(null);
    const tpl = associationTemplates.find((t) => t.id === tplId);
    if (!tpl) return;

    const fields =
      tpl.producerSections && tpl.producerSections.length > 0
        ? tpl.producerSections.flatMap((s) => s.fields || [])
        : tpl.producerFields && tpl.producerFields.length > 0
        ? tpl.producerFields
        : tpl.fields || [];

    setDynamicValues((prev) => {
      const next = { ...prev };
      fields.forEach((f) => {
        if (next[f.id] === undefined) {
          const label = (f.name || f.label || '').toLowerCase();
          if (initialProducer) {
            if (f.name && next[f.name] !== undefined) {
              next[f.id] = next[f.name];
              return;
            }
            if (/nombres?\s*completos?|nombre\s*del\s*productor/i.test(label) && initialProducer.producerName) {
              next[f.id] = initialProducer.producerName;
              return;
            }
            if (
              /n[uú]mero\s*de\s*documento|c[eé]dula/i.test(label) &&
              !/tipo/i.test(label) &&
              initialProducer.documentId
            ) {
              next[f.id] = initialProducer.documentId;
              return;
            }
            if ((f.type === 'tel' || /tel[eé]fono\s*principal/i.test(label)) && initialProducer.phone) {
              next[f.id] = initialProducer.phone;
              return;
            }
          }
          next[f.id] = f.defaultValue ?? '';
        }
      });
      return next;
    });
  };

  const handleFieldChange = (field: TemplateField, value: any) => {
    setDynamicValues((prev) => {
      const next: Record<string, any> = {
        ...prev,
        [field.id]: value
      };
      // Reset dependent children if this field is a parent
      allTemplateFields.forEach((child) => {
        if (child.parentFieldId === field.id) {
          next[child.id] = '';
        }
      });
      return next;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentAssociation) {
      setError('No hay una asociación activa seleccionada.');
      return;
    }

    if (!selectedTemplate) {
      setError('Debes seleccionar una plantilla de productor asociada a esta asociación para ingresar los datos.');
      return;
    }

    // Validate required template fields
    for (const field of allTemplateFields) {
      if (field.required) {
        const val = dynamicValues[field.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          const fieldLabel = field.name || field.label || field.id;
          setError(`El campo "${fieldLabel}" de la plantilla es obligatorio.`);
          return;
        }
      }
    }

    // Resolve core summary fields from template dynamicValues or fallback inputs
    const rawFirstName = nameField ? String(dynamicValues[nameField.id] || '').trim() : fallbackName.trim();
    const rawLastName = lastNameField ? String(dynamicValues[lastNameField.id] || '').trim() : '';
    const resolvedProducerName =
      rawFirstName && rawLastName && !rawFirstName.toLowerCase().includes(rawLastName.toLowerCase())
        ? `${rawFirstName} ${rawLastName}`.trim()
        : rawFirstName || fallbackName.trim();

    const resolvedDocId = docNumberField
      ? String(dynamicValues[docNumberField.id] || '').trim() || fallbackDoc.trim()
      : fallbackDoc.trim();

    const resolvedPhone = phoneField
      ? String(dynamicValues[phoneField.id] || '').trim() || fallbackPhone.trim()
      : fallbackPhone.trim();

    const resolvedLocation = locationField
      ? String(dynamicValues[locationField.id] || '').trim() || veredaOrLocation.trim()
      : veredaOrLocation.trim();

    if (!resolvedProducerName) {
      setError('El nombre del productor es obligatorio.');
      return;
    }
    if (!resolvedDocId) {
      setError('El número de documento de identidad del productor es obligatorio.');
      return;
    }

    if (selectedTemplate.requireDataAuthorization && !dataAuthorization) {
      setError('Esta plantilla requiere la autorización de tratamiento de datos (Habeas Data).');
      return;
    }

    const producerData: Producer = {
      id: initialProducer?.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      templateId: selectedTemplate.id,
      templateCode: selectedTemplate.code,
      templateTitle: selectedTemplate.title,
      associationId: currentAssociation.id,
      associationName: currentAssociation.name,
      associationCode: currentAssociation.code,
      producerName: resolvedProducerName,
      documentId: resolvedDocId,
      phone: resolvedPhone || undefined,
      veredaOrLocation: resolvedLocation || currentAssociation.municipality || 'Vereda General',
      latitude: latitude ? parseFloat(latitude) : initialProducer?.latitude,
      longitude: longitude ? parseFloat(longitude) : initialProducer?.longitude,
      dataAuthorization,
      dynamicValues: {
        ...dynamicValues
      },
      syncStatus: 'synced',
      sourceDevice: 'Web Central Beneficio',
      createdAt: initialProducer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(producerData);
    onClose();
  };

  const renderFieldInput = (field: TemplateField) => {
    const label = field.name || field.label || field.id;
    const val = dynamicValues[field.id] ?? '';
    const type = (field.type || 'text').toLowerCase();

    if (type === 'select' || type === 'dependent_select') {
      let options: string[] = field.options || [];
      if (type === 'dependent_select' && field.parentFieldId && field.dependentOptions) {
        const parentVal = String(dynamicValues[field.parentFieldId] || '');
        options = parentVal ? field.dependentOptions[parentVal] || [] : [];
      }

      return (
        <select
          value={val}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          className="w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 input-3d"
          required={field.required}
        >
          <option value="">
            {type === 'dependent_select' && field.parentFieldId && !dynamicValues[field.parentFieldId]
              ? `-- Selecciona primero ${field.parentFieldName || 'el campo anterior'} --`
              : `-- Seleccionar ${label} --`}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'radio' && field.options && field.options.length > 0) {
      return (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {field.options.map((opt) => {
            const isChecked = String(val) === String(opt);
            return (
              <label
                key={opt}
                className={`px-3.5 py-2 rounded-xl border-2 text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                  isChecked
                    ? 'bg-emerald-50 border-[#047857] text-[#047857] shadow-[2px_2px_0px_#064e3b]'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name={`radio_${field.id}`}
                  value={opt}
                  checked={isChecked}
                  onChange={() => handleFieldChange(field, opt)}
                  className="accent-[#047857]"
                  required={field.required && !val}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          rows={2}
          value={val}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={field.placeholder || `Ingresa ${label.toLowerCase()}...`}
          className="w-full rounded-xl px-3.5 py-2 text-xs text-slate-900 input-3d"
          required={field.required}
        />
      );
    }

    if (type === 'attachment' || type === 'kml' || type === 'geojson' || type === 'file') {
      return (
        <div className="space-y-1.5">
          <input
            type="file"
            accept={field.fileAccepted || '*/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFieldChange(field, file.name);
              }
            }}
            className="w-full rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50 border-2 border-dashed border-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
          />
          {val && (
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Archivo seleccionado: {String(val)}</span>
            </p>
          )}
        </div>
      );
    }

    const inputType =
      type === 'number'
        ? 'number'
        : type === 'date'
        ? 'date'
        : type === 'email'
        ? 'email'
        : type === 'tel'
        ? 'tel'
        : 'text';

    return (
      <div className="relative flex items-center">
        <input
          type={inputType}
          step={inputType === 'number' ? 'any' : undefined}
          value={val}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={field.placeholder || `Ingresa ${label.toLowerCase()}`}
          className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-900 input-3d"
          required={field.required}
        />
        {field.unit && (
          <span className="absolute right-3 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 pointer-events-none">
            {field.unit}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl card-3d-outer overflow-hidden flex flex-col max-h-[92vh] bg-white text-slate-900">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#06694b] to-[#044c36] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-sm">
              {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Editar Productor Cacaotero' : 'Adicionar Nuevo Productor'}
              </h2>
              <p className="text-xs text-emerald-100">
                Asociación fija · Diligenciamiento mediante plantilla de productor vinculada
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Association (Locked / Read-Only) */}
          <div className="p-3.5 rounded-xl bg-slate-100 border-2 border-slate-300 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#059669]" />
                <span>Asociación a la que pertenece</span>
              </label>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Asociación Fija</span>
              </span>
            </div>
            <div className="w-full rounded-xl px-3.5 py-2.5 bg-white border-2 border-slate-300 text-slate-900 font-bold flex flex-wrap items-center justify-between gap-2 cursor-not-allowed select-none">
              <span>{currentAssociation?.name || 'Asociación Activa'}</span>
              <span className="text-[11px] font-mono-num px-2 py-0.5 rounded-md bg-emerald-50 text-[#047857] border border-emerald-300">
                {currentAssociation?.code} · {currentAssociation?.municipality}
              </span>
            </div>
          </div>

          {/* 2. Producer Template Selector (Filtered strictly by active association) */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border-2 border-emerald-300 space-y-3">
            <div>
              <label className="block font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
                  <span>Plantilla de Productor asociada a {currentAssociation?.name} *</span>
                </span>
                <span className="text-[11px] font-mono-num text-[#047857]">
                  {associationTemplates.length} disponible(s)
                </span>
              </label>

              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 input-3d-emerald"
                required
              >
                <option value="">
                  {associationTemplates.length === 0
                    ? '-- Sin plantillas de productor asociadas a esta asociación --'
                    : '-- Seleccionar plantilla de productor para ingresar datos --'}
                </option>
                {associationTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title} ({tpl.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Template Selection Cards if none selected yet */}
            {!selectedTemplate && associationTemplates.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold text-emerald-900">
                  Selecciona una plantilla para desplegar y diligenciar los campos del productor:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {associationTemplates.map((tpl) => {
                    const count =
                      tpl.producerSections && tpl.producerSections.length > 0
                        ? tpl.producerSections.reduce((acc, s) => acc + (s.fields?.length || 0), 0)
                        : tpl.producerFields?.length || tpl.fields?.length || 0;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-50 border-2 border-emerald-400 shadow-[2px_3px_0px_#065f46] transition flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{tpl.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {tpl.code}
                            </span>
                          </div>
                          {tpl.description && (
                            <p className="text-[11px] text-slate-600 mt-0.5">{tpl.description}</p>
                          )}
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-[#059669] text-white font-bold text-[11px] shrink-0">
                          Seleccionar ({count} campos)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {associationTemplates.length === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium">
                No se encontraron plantillas de productor vinculadas a la asociación{' '}
                <strong>{currentAssociation?.name}</strong> ({currentAssociation?.code}). Configura o vincula una
                plantilla de productor a esta asociación en el sistema administrativo.
              </div>
            )}
          </div>

          {/* 3. Dynamic Template Sections & Fields (Rendered once template is selected) */}
          {selectedTemplate && (
            <div className="space-y-5 animate-fadeIn">
              {/* Selected Template Badge */}
              <div className="p-3 rounded-xl bg-slate-50 border-2 border-slate-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#059669]" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Plantilla activa: {selectedTemplate.title}
                    </span>
                    {selectedTemplate.description && (
                      <span className="text-[11px] text-slate-600 block">
                        {selectedTemplate.description}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono-num font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                  {selectedTemplate.code}
                </span>
              </div>

              {/* Complementary Core Fields ONLY if template lacks Name or Document Number */}
              {(!nameField || !docNumberField) && (
                <div className="p-4 rounded-xl bg-white border-2 border-slate-300 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                    Identificación Base del Productor
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {!nameField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Nombre Completo del Productor *
                        </label>
                        <input
                          type="text"
                          value={fallbackName}
                          onChange={(e) => setFallbackName(e.target.value)}
                          placeholder="Ej. Juan Pablo Garzón"
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-900 input-3d"
                          required
                        />
                      </div>
                    )}
                    {!docNumberField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Número de Documento / Cédula *
                        </label>
                        <input
                          type="text"
                          value={fallbackDoc}
                          onChange={(e) => setFallbackDoc(e.target.value)}
                          placeholder="Ej. 91245678"
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono-num text-slate-900 input-3d"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Render Each Section of the Selected Producer Template */}
              {templateSections.map((section) => (
                <div
                  key={section.id}
                  className="p-4 rounded-xl bg-white border-2 border-slate-300 shadow-[2px_3px_0px_#cbd5e1] space-y-3.5"
                >
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#047857]">
                      {section.name}
                    </h3>
                    {section.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{section.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {section.fields.map((field) => {
                      const label = field.name || field.label || field.id;
                      const isFullWidth =
                        field.type === 'textarea' ||
                        field.type === 'radio' ||
                        field.type === 'attachment' ||
                        label.length > 42;
                      return (
                        <div key={field.id} className={isFullWidth ? 'sm:col-span-2' : ''}>
                          <label className="block font-bold text-slate-700 mb-1.5">
                            {label} {field.required && <span className="text-rose-600">*</span>}
                          </label>
                          {renderFieldInput(field)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Complementary Location & GPS Section if template does not have a location field */}
              {!locationField && (
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ubicación Veredal y Georreferenciación</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Vereda o Municipio
                      </label>
                      <input
                        type="text"
                        value={veredaOrLocation}
                        onChange={(e) => setVeredaOrLocation(e.target.value)}
                        placeholder={`Ej. ${currentAssociation?.municipality || 'Vereda General'}`}
                        className="w-full rounded-xl px-3 py-2 text-xs text-slate-900 input-3d"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Latitud GPS (Opcional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Ej. 6.8814"
                        className="w-full rounded-xl px-3 py-2 text-xs font-mono-num text-slate-900 input-3d"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Longitud GPS (Opcional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Ej. -73.4142"
                        className="w-full rounded-xl px-3 py-2 text-xs font-mono-num text-slate-900 input-3d"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Habeas Data Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataAuthorization}
                  onChange={(e) => setDataAuthorization(e.target.checked)}
                  className="w-4 h-4 accent-[#047857] rounded"
                />
                <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  Autorización de tratamiento de datos personales (Habeas Data) firmada
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer btn-3d-light"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedTemplate}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                selectedTemplate
                  ? 'cursor-pointer btn-3d-emerald'
                  : 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Adicionar Productor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
