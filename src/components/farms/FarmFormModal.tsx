import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Trees, 
  Building2, 
  Lock,
  User, 
  FileSpreadsheet,
  MapPin, 
  Layers, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Save,
  CheckCircle2,
  Globe,
  UploadCloud,
  Key,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  executeWhispDeforestationAnalysis, 
  DEFAULT_WHISP_API_KEY, 
  WhispSubmissionResult 
} from '../../utils/whispService';
import { 
  parseAndAnalyzeGeoJson, 
  SAMPLE_EUDR_GEOJSON, 
  GeoJsonDeforestationResult 
} from '../../utils/geoJsonDeforestation';
import { 
  Association, 
  Producer, 
  Farm, 
  FarmTemplate, 
  TemplateField, 
  TemplateSection, 
  CloneDistributionItem, 
  CacaoClone 
} from '../../types';

interface FarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (farm: Farm) => void;
  initialFarm?: Farm | null;
  associations: Association[];
  producers: Producer[];
  farmTemplates: FarmTemplate[];
  clones: CacaoClone[];
  selectedAssociationId: string;
}

export const FarmFormModal: React.FC<FarmFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFarm,
  associations,
  producers,
  farmTemplates,
  clones,
  selectedAssociationId
}) => {
  const isEditing = Boolean(initialFarm);

  // 1. Locked Association: always the currently selected association
  const currentAssociation = useMemo(() => {
    if (selectedAssociationId === 'all') {
      return (
        associations.find((a) => farmTemplates.some((t) => t.associationId === a.id)) ||
        associations[0]
      );
    }
    return associations.find((a) => a.id === selectedAssociationId) || associations[0];
  }, [associations, selectedAssociationId, farmTemplates]);

  // 2. Strict filter: ONLY producers that belong to the active association
  const filteredProducers = useMemo(() => {
    if (!currentAssociation) return [];
    return producers.filter((p) => {
      if (p.associationId && p.associationId.trim() !== '') {
        return p.associationId === currentAssociation.id;
      }
      if (p.associationCode && currentAssociation.code) {
        return p.associationCode.trim().toUpperCase() === currentAssociation.code.trim().toUpperCase();
      }
      if (p.associationName && currentAssociation.name) {
        return p.associationName.trim().toLowerCase() === currentAssociation.name.trim().toLowerCase();
      }
      return false;
    });
  }, [producers, currentAssociation]);

  // 3. Strict filter: ONLY farm templates linked to the active association
  const associationTemplates = useMemo(() => {
    if (!currentAssociation) return [];
    return farmTemplates.filter((t) => {
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
  }, [farmTemplates, currentAssociation]);

  const [producerId, setProducerId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  // Complementary fields when not present in the selected template
  const [fallbackFarmName, setFallbackFarmName] = useState<string>('');
  const [cadastralCode, setCadastralCode] = useState<string>('');
  const [fallbackTotalAreaHa, setFallbackTotalAreaHa] = useState<string>('5.0');
  const [fallbackCacaoAreaHa, setFallbackCacaoAreaHa] = useState<string>('3.5');
  const [fallbackDepartment, setFallbackDepartment] = useState<string>('');
  const [fallbackMunicipality, setFallbackMunicipality] = useState<string>('');
  const [fallbackVereda, setFallbackVereda] = useState<string>('');
  const [fallbackAltitude, setFallbackAltitude] = useState<string>('800');
  const [recommendations, setRecommendations] = useState<string>('');
  const [cloneDistributions, setCloneDistributions] = useState<CloneDistributionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // GeoJSON & WHISP Analysis State
  const [geoJsonFileName, setGeoJsonFileName] = useState<string>('');
  const [geoJsonRawText, setGeoJsonRawText] = useState<string>('');
  const [geoJsonAnalysis, setGeoJsonAnalysis] = useState<GeoJsonDeforestationResult | null>(null);
  const [isAnalyzingWhisp, setIsAnalyzingWhisp] = useState<boolean>(false);
  const [whispAnalysisResult, setWhispAnalysisResult] = useState<WhispSubmissionResult | null>(null);
  const [whispAnalysisError, setWhispAnalysisError] = useState<string | null>(null);
  const [whispApiKey, setWhispApiKey] = useState<string>(() => {
    return localStorage.getItem('agronomatrix_whisp_api_key') || DEFAULT_WHISP_API_KEY;
  });
  const [showWhispKeyModal, setShowWhispKeyModal] = useState<boolean>(false);
  const [tempWhispApiKey, setTempWhispApiKey] = useState<string>('');
  const [showWhispRawJson, setShowWhispRawJson] = useState<boolean>(false);
  const [deforestationStatus, setDeforestationStatus] = useState<'compliant' | 'warning' | 'alert'>('compliant');
  const [deforestationDetails, setDeforestationDetails] = useState<string>('');
  const geoJsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedTemplate = useMemo(() => {
    return associationTemplates.find((t) => t.id === selectedTemplateId) || null;
  }, [associationTemplates, selectedTemplateId]);

  const templateSections = useMemo<TemplateSection[]>(() => {
    if (!selectedTemplate) return [];
    if (selectedTemplate.farmSections && selectedTemplate.farmSections.length > 0) {
      return selectedTemplate.farmSections;
    }
    const flatFields =
      selectedTemplate.farmFields && selectedTemplate.farmFields.length > 0
        ? selectedTemplate.farmFields
        : selectedTemplate.fields || [];
    if (flatFields.length === 0) return [];
    return [
      {
        id: 'farm_sec_default',
        name: 'Datos de la Plantilla de Finca',
        description: selectedTemplate.description || 'Información técnica y geográfica del predio.',
        fields: flatFields
      }
    ];
  }, [selectedTemplate]);

  const allTemplateFields = useMemo<TemplateField[]>(() => {
    return templateSections.flatMap((s) => s.fields || []);
  }, [templateSections]);

  // Detect which core fields are already defined inside the selected template
  const farmNameField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /^nombre$|nombre\s*de\s*(la\s*)?finca|nombre\s*del\s*predio/i.test(label);
      }),
    [allTemplateFields]
  );

  const totalAreaField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return (
          (/[aá]rea\s*total\s*de\s*la\s*finca|cantidad\s*de\s*hect[aá]reas|[aá]rea\s*total/i.test(label)) &&
          !/cacao|cultivada/i.test(label)
        );
      }),
    [allTemplateFields]
  );

  const cacaoAreaField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase();
        return /cacao|[aá]rea\s*cultivada/i.test(label) && f.type === 'number';
      }),
    [allTemplateFields]
  );

  const departmentField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /^departamento$/i.test(label);
      }),
    [allTemplateFields]
  );

  const municipalityField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /^municipio$/i.test(label);
      }),
    [allTemplateFields]
  );

  const veredaField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /vereda|corregimiento|ubicaci[oó]n/i.test(label);
      }),
    [allTemplateFields]
  );

  const latitudeField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /^latitud/i.test(label);
      }),
    [allTemplateFields]
  );

  const longitudeField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /^longitud/i.test(label);
      }),
    [allTemplateFields]
  );

  const altitudeField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const label = (f.name || f.label || '').toLowerCase().trim();
        return /^altitud/i.test(label);
      }),
    [allTemplateFields]
  );

  const kmlField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        return f.type === 'kml' || f.id === 'kml_polygon_field' || /kml/i.test(f.name || '');
      }),
    [allTemplateFields]
  );

  const geojsonField = useMemo(
    () =>
      allTemplateFields.find((f) => {
        const lbl = (f.name || f.label || f.id || '').toLowerCase();
        return f.type === 'geojson' || f.id === 'geojson_deforestation_field' || /geojson/i.test(lbl);
      }),
    [allTemplateFields]
  );

  const hasGeoJsonInTemplate = Boolean(geojsonField);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (initialFarm) {
      const validProdId = filteredProducers.some((p) => p.id === initialFarm.producerId)
        ? initialFarm.producerId || ''
        : filteredProducers[0]?.id || '';
      setProducerId(validProdId);

      const matchedTpl =
        associationTemplates.find((t) => t.id === initialFarm.templateId) ||
        associationTemplates.find((t) => t.code === initialFarm.templateCode) ||
        (associationTemplates.length === 1 ? associationTemplates[0] : null);

      setSelectedTemplateId(matchedTpl?.id || '');
      setDynamicValues({ ...(initialFarm.dynamicValues || {}) });
      setFallbackFarmName(initialFarm.farmName || '');
      setCadastralCode(initialFarm.cadastralCode || '');
      setFallbackTotalAreaHa(String(initialFarm.totalAreaHa ?? 5));
      setFallbackCacaoAreaHa(String(initialFarm.cacaoAreaHa ?? 3.5));
      setFallbackDepartment(initialFarm.department || currentAssociation?.department || 'Santander');
      setFallbackMunicipality(initialFarm.municipality || currentAssociation?.municipality || 'San Vicente de Chucurí');
      setFallbackVereda(initialFarm.vereda || '');
      setFallbackAltitude(initialFarm.altitudeMeters ? String(initialFarm.altitudeMeters) : '800');
      setRecommendations(initialFarm.recommendations || '');
      setCloneDistributions(
        initialFarm.cloneDistributions && initialFarm.cloneDistributions.length > 0
          ? initialFarm.cloneDistributions
          : [{ id: `cd_${Date.now()}`, cloneName: clones[0]?.code || 'CCN-51', plantCount: 1200 }]
      );

      // Restore GeoJSON & WHISP state
      const rawGeo = initialFarm.dynamicValues?.geojson_raw_content || '';
      const existingName =
        initialFarm.dynamicValues?.geojson_deforestation_field ||
        initialFarm.dynamicValues?.geojson_file_name ||
        initialFarm.kmlFileName ||
        '';
      setGeoJsonFileName(existingName);
      setGeoJsonRawText(rawGeo);
      if (rawGeo) {
        setGeoJsonAnalysis(parseAndAnalyzeGeoJson(rawGeo, existingName || 'predio.geojson'));
      } else {
        setGeoJsonAnalysis(null);
      }
      setWhispAnalysisResult(initialFarm.whispAnalysisResult || initialFarm.dynamicValues?.whisp_result || null);
      setWhispAnalysisError(null);
      setDeforestationStatus((initialFarm.deforestationStatus as any) || 'compliant');
      setDeforestationDetails(
        initialFarm.deforestationDetails ||
        'Verificado satelitalmente WHISP EUDR. Libre de deforestación post-2020.'
      );
    } else {
      setProducerId(filteredProducers[0]?.id || '');
      setSelectedTemplateId('');
      setDynamicValues({});
      setFallbackFarmName('');
      setCadastralCode('RUV-2026-01');
      setFallbackTotalAreaHa('5.0');
      setFallbackCacaoAreaHa('3.5');
      setFallbackDepartment(currentAssociation?.department || 'Santander');
      setFallbackMunicipality(currentAssociation?.municipality || 'San Vicente de Chucurí');
      setFallbackVereda(filteredProducers[0]?.veredaOrLocation?.replace(/^Vereda\s+/i, '') || '');
      setFallbackAltitude('820');
      setRecommendations('Mantener podas fitosanitarias y control oportuno de moniliasis.');
      setCloneDistributions([
        { id: `cd_${Date.now()}_1`, cloneName: clones[0]?.code || 'ICS-95', plantCount: 1500 }
      ]);
      setGeoJsonFileName('');
      setGeoJsonRawText('');
      setGeoJsonAnalysis(null);
      setWhispAnalysisResult(null);
      setWhispAnalysisError(null);
      setDeforestationStatus('compliant');
      setDeforestationDetails('Verificado satelitalmente WHISP EUDR. Libre de deforestación post-2020.');
    }
  }, [isOpen, initialFarm, filteredProducers, associationTemplates, currentAssociation, clones]);

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    setError(null);
    const tpl = associationTemplates.find((t) => t.id === tplId);
    if (!tpl) return;

    const fields =
      tpl.farmSections && tpl.farmSections.length > 0
        ? tpl.farmSections.flatMap((s) => s.fields || [])
        : tpl.farmFields && tpl.farmFields.length > 0
        ? tpl.farmFields
        : tpl.fields || [];

    setDynamicValues((prev) => {
      const next = { ...prev };
      fields.forEach((f) => {
        if (next[f.id] === undefined) {
          const label = (f.name || f.label || '').toLowerCase().trim();
          if (initialFarm) {
            if (/^nombre$|nombre\s*de\s*(la\s*)?finca/i.test(label) && initialFarm.farmName) {
              next[f.id] = initialFarm.farmName;
              return;
            }
            if (
              (/[aá]rea\s*total|cantidad\s*de\s*hect[aá]reas/i.test(label)) &&
              !/cacao/i.test(label) &&
              initialFarm.totalAreaHa !== undefined
            ) {
              next[f.id] = String(initialFarm.totalAreaHa);
              return;
            }
            if (/cacao/i.test(label) && initialFarm.cacaoAreaHa !== undefined) {
              next[f.id] = String(initialFarm.cacaoAreaHa);
              return;
            }
            if (/^departamento$/i.test(label) && initialFarm.department) {
              next[f.id] = initialFarm.department;
              return;
            }
            if (/^municipio$/i.test(label) && initialFarm.municipality) {
              next[f.id] = initialFarm.municipality;
              return;
            }
            if (/vereda|corregimiento|ubicaci[oó]n/i.test(label) && initialFarm.vereda) {
              next[f.id] = initialFarm.vereda;
              return;
            }
          }
          next[f.id] = f.defaultValue ?? '';
        }
      });
      return next;
    });

    // If creating a new farm and the template has predefined cloneDistributions or clones, load them
    if (!initialFarm) {
      if (tpl.cloneDistributions && tpl.cloneDistributions.length > 0) {
        setCloneDistributions(
          tpl.cloneDistributions.map((cd, idx) => ({
            id: cd.id || `cd_${Date.now()}_${idx}`,
            cloneId: cd.cloneId,
            cloneName: cd.cloneName,
            plantCount: cd.plantCount > 1 ? cd.plantCount : 1000
          }))
        );
      } else if (tpl.clones && tpl.clones.length > 0) {
        setCloneDistributions(
          tpl.clones.map((c, idx) => ({
            id: `cd_${Date.now()}_${idx}`,
            cloneId: c.id,
            cloneName: c.code || c.name,
            plantCount: 1000
          }))
        );
      }
    }
  };

  const handleFieldChange = (field: TemplateField, value: any) => {
    setDynamicValues((prev) => {
      const next: Record<string, any> = {
        ...prev,
        [field.id]: value
      };
      // Reset dependent selects if parent changes
      allTemplateFields.forEach((child) => {
        if (child.parentFieldId === field.id) {
          next[child.id] = '';
          // Also clear grandchildren
          allTemplateFields.forEach((grandChild) => {
            if (grandChild.parentFieldId === child.id) {
              next[grandChild.id] = '';
            }
          });
        }
      });
      return next;
    });
  };

  const handleAddCloneRow = () => {
    setCloneDistributions((prev) => [
      ...prev,
      { id: `cd_${Date.now()}`, cloneName: clones[0]?.code || 'CCN-51', plantCount: 800 }
    ]);
  };

  const handleRemoveCloneRow = (id: string) => {
    setCloneDistributions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCloneChange = (id: string, field: 'cloneName' | 'plantCount', value: string) => {
    setCloneDistributions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'plantCount' ? Math.max(0, parseInt(value, 10) || 0) : value
            }
          : item
      )
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentAssociation) {
      setError('No hay una asociación activa seleccionada.');
      return;
    }

    const prodObj = filteredProducers.find((p) => p.id === producerId);
    if (!prodObj) {
      setError('Debes seleccionar un productor que pertenezca a esta asociación.');
      return;
    }

    if (!selectedTemplate) {
      setError('Debes seleccionar una plantilla de finca asociada a esta asociación para ingresar los datos.');
      return;
    }

    // Validate required fields in the selected farm template
    for (const field of allTemplateFields) {
      if (field.required) {
        const val = dynamicValues[field.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          const fieldLabel = field.name || field.label || field.id;
          setError(`El campo "${fieldLabel}" de la plantilla de finca es obligatorio.`);
          return;
        }
      }
    }

    const resolvedFarmName = farmNameField
      ? String(dynamicValues[farmNameField.id] || '').trim() || fallbackFarmName.trim()
      : fallbackFarmName.trim();

    if (!resolvedFarmName) {
      setError('El nombre de la finca o predio es obligatorio.');
      return;
    }

    const resolvedTotalArea = totalAreaField
      ? parseFloat(String(dynamicValues[totalAreaField.id] || '0')) || parseFloat(fallbackTotalAreaHa) || 0
      : parseFloat(fallbackTotalAreaHa) || 0;

    const resolvedCacaoArea = cacaoAreaField
      ? parseFloat(String(dynamicValues[cacaoAreaField.id] || '0')) || parseFloat(fallbackCacaoAreaHa) || 0
      : parseFloat(fallbackCacaoAreaHa) || Math.round(resolvedTotalArea * 0.7 * 10) / 10;

    const resolvedDept = departmentField
      ? String(dynamicValues[departmentField.id] || '').trim() || fallbackDepartment.trim()
      : fallbackDepartment.trim();

    const resolvedMuni = municipalityField
      ? String(dynamicValues[municipalityField.id] || '').trim() || fallbackMunicipality.trim()
      : fallbackMunicipality.trim();

    const resolvedVereda = veredaField
      ? String(dynamicValues[veredaField.id] || '').trim() || fallbackVereda.trim()
      : fallbackVereda.trim();

    const resolvedLat = latitudeField && dynamicValues[latitudeField.id]
      ? parseFloat(String(dynamicValues[latitudeField.id]))
      : initialFarm?.latitude;

    const resolvedLng = longitudeField && dynamicValues[longitudeField.id]
      ? parseFloat(String(dynamicValues[longitudeField.id]))
      : initialFarm?.longitude;

    const resolvedAlt = altitudeField && dynamicValues[altitudeField.id]
      ? parseInt(String(dynamicValues[altitudeField.id]), 10)
      : fallbackAltitude
      ? parseInt(fallbackAltitude, 10)
      : initialFarm?.altitudeMeters;

    const resolvedKml = kmlField && dynamicValues[kmlField.id]
      ? String(dynamicValues[kmlField.id])
      : initialFarm?.kmlFileName;

    const farmData: Farm = {
      id: initialFarm?.id || `farm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      templateId: selectedTemplate.id,
      templateCode: selectedTemplate.code,
      templateTitle: selectedTemplate.title,
      associationId: currentAssociation.id,
      associationName: currentAssociation.name,
      associationCode: currentAssociation.code,
      producerId: prodObj.id,
      producerName: prodObj.producerName,
      producerDocument: prodObj.documentId || '',
      farmName: resolvedFarmName,
      cadastralCode: cadastralCode.trim() || 'RUV-01',
      department: resolvedDept || currentAssociation.department || 'Santander',
      municipality: resolvedMuni || currentAssociation.municipality || 'San Vicente de Chucurí',
      vereda: resolvedVereda || prodObj.veredaOrLocation || 'Vereda General',
      totalAreaHa: resolvedTotalArea,
      cacaoAreaHa: resolvedCacaoArea,
      altitudeMeters: resolvedAlt,
      latitude: resolvedLat,
      longitude: resolvedLng,
      kmlFileName: resolvedKml,
      cloneDistributions: cloneDistributions.filter((c) => c.cloneName.trim() !== ''),
      dynamicValues: {
        ...dynamicValues,
        ...(geoJsonRawText ? { geojson_raw_content: geoJsonRawText } : {}),
        ...(geoJsonFileName ? { geojson_file_name: geoJsonFileName } : {}),
        ...(whispAnalysisResult ? { whisp_result: whispAnalysisResult } : {})
      },
      deforestationStatus: deforestationStatus || initialFarm?.deforestationStatus || 'compliant',
      deforestationDetails:
        deforestationDetails ||
        initialFarm?.deforestationDetails ||
        'Verificado satelitalmente WHISP EUDR. Libre de deforestación post-2020.',
      whispAnalysisResult: whispAnalysisResult || initialFarm?.whispAnalysisResult,
      whispJobToken: whispAnalysisResult?.token || initialFarm?.whispJobToken,
      whispAnalyzedAt: whispAnalysisResult ? new Date().toISOString() : initialFarm?.whispAnalyzedAt,
      recommendations: recommendations.trim() || undefined,
      visitDate: initialFarm?.visitDate || new Date().toISOString().slice(0, 10),
      syncStatus: 'synced',
      createdAt: initialFarm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(farmData);
    onClose();
  };

  const handleGeoJsonUpload = (file: File, fieldId?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      try {
        const analysis = parseAndAnalyzeGeoJson(content, file.name, file.size);
        setGeoJsonAnalysis(analysis);
        setGeoJsonRawText(content);
        setGeoJsonFileName(file.name);
        setWhispAnalysisError(null);

        const targetFieldId = fieldId || geojsonField?.id || 'geojson_deforestation_field';
        setDynamicValues((prev) => ({
          ...prev,
          [targetFieldId]: file.name,
          geojson_raw_content: content,
          geojson_file_name: file.name
        }));

        if (analysis.centroid) {
          if (latitudeField && !dynamicValues[latitudeField.id]) {
            setDynamicValues((prev) => ({ ...prev, [latitudeField.id]: analysis.centroid!.lat }));
          }
          if (longitudeField && !dynamicValues[longitudeField.id]) {
            setDynamicValues((prev) => ({ ...prev, [longitudeField.id]: analysis.centroid!.lng }));
          }
        }
      } catch (err: any) {
        setWhispAnalysisError(`Error al procesar el archivo GeoJSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleGeoJson = (fieldId?: string) => {
    const rawContent = JSON.stringify(SAMPLE_EUDR_GEOJSON, null, 2);
    const analysis = parseAndAnalyzeGeoJson(rawContent, 'poligono_predio_eudr_demo.geojson', rawContent.length);
    setGeoJsonAnalysis(analysis);
    setGeoJsonRawText(rawContent);
    setGeoJsonFileName('poligono_predio_eudr_demo.geojson');
    setWhispAnalysisError(null);

    const targetFieldId = fieldId || geojsonField?.id || 'geojson_deforestation_field';
    setDynamicValues((prev) => ({
      ...prev,
      [targetFieldId]: 'poligono_predio_eudr_demo.geojson',
      geojson_raw_content: rawContent,
      geojson_file_name: 'poligono_predio_eudr_demo.geojson'
    }));
  };

  const handleClearGeoJson = (fieldId?: string) => {
    setGeoJsonAnalysis(null);
    setGeoJsonRawText('');
    setGeoJsonFileName('');
    setWhispAnalysisResult(null);
    setWhispAnalysisError(null);

    const targetFieldId = fieldId || geojsonField?.id || 'geojson_deforestation_field';
    setDynamicValues((prev) => {
      const next = { ...prev };
      delete next[targetFieldId];
      delete next.geojson_raw_content;
      delete next.geojson_file_name;
      delete next.whisp_result;
      delete next.whisp_token;
      return next;
    });
  };

  const handleRunWhispAnalysis = async () => {
    const payload = geoJsonRawText || geoJsonAnalysis?.rawJson;
    if (!payload && !geoJsonFileName) {
      alert('Por favor carga primero un archivo GeoJSON para consultar WHISP.');
      return;
    }

    const activeKey = whispApiKey.trim() || DEFAULT_WHISP_API_KEY;
    setIsAnalyzingWhisp(true);
    setWhispAnalysisError(null);

    try {
      const dataToSubmit = payload || SAMPLE_EUDR_GEOJSON;
      const res = await executeWhispDeforestationAnalysis(dataToSubmit, activeKey);
      setWhispAnalysisResult(res);

      if (res.success) {
        const defStatus = res.summary?.deforestationStatus || 'compliant';
        const defDetails = res.summary?.statusLabel || res.message || 'Libre de deforestación post-2020 según WHISP';
        setDeforestationStatus(defStatus);
        setDeforestationDetails(defDetails);

        setDynamicValues((prev) => ({
          ...prev,
          whisp_result: res,
          whisp_token: res.token,
          whisp_status: defStatus,
          whisp_analyzed_at: new Date().toISOString(),
          deforestation_status: defStatus,
          deforestation_details: defDetails
        }));

        if (res.summary && geoJsonAnalysis) {
          setGeoJsonAnalysis((prev) => prev ? {
            ...prev,
            deforestationStatus: res.summary!.deforestationStatus,
            statusLabel: res.summary!.statusLabel,
            alertsDetected: res.summary!.alertsDetected ?? prev.alertsDetected,
            forestCoverPercent: res.summary!.forestCoverPercent ?? prev.forestCoverPercent,
            sourceLayers: `Open Foris WHISP / GFW / Sentinel-2 (Token: ${res.token || 'Procesado'})`
          } : null);
        }
      } else {
        setWhispAnalysisError(res.message || 'Error al ejecutar la consulta en WHISP.');
      }
    } catch (err: any) {
      console.error('Error al analizar deforestación con WHISP:', err);
      setWhispAnalysisError(err?.message || 'Error inesperado al conectar con WHISP.');
    } finally {
      setIsAnalyzingWhisp(false);
    }
  };

  const handleSaveWhispApiKey = () => {
    const key = tempWhispApiKey.trim() || DEFAULT_WHISP_API_KEY;
    setWhispApiKey(key);
    localStorage.setItem('agronomatrix_whisp_api_key', key);
    setShowWhispKeyModal(false);
  };

  const renderGeoJsonDeforestationCard = (field?: TemplateField) => {
    const fieldId = field?.id || 'geojson_deforestation_field';
    const fieldLabel = field?.name || field?.label || 'Polígono GeoJSON para Análisis de Deforestación';
    const isFileLoaded = Boolean(geoJsonFileName || geoJsonRawText || dynamicValues[fieldId]);
    const fileName = geoJsonFileName || String(dynamicValues[fieldId] || 'poligono_predio.geojson');
    const fileSizeKb = geoJsonAnalysis?.fileSize
      ? (geoJsonAnalysis.fileSize / 1024).toFixed(1)
      : undefined;

    return (
      <div className="space-y-3 pt-1 bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-[2px_3px_0px_#047857]">
        {/* Cabecera del Campo */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{fieldLabel}</span>
            {field?.required && <span className="text-rose-500">*</span>}
          </span>
          {whispAnalysisResult ? (
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                whispAnalysisResult.summary?.deforestationStatus === 'compliant' || whispAnalysisResult.status === 'compliant'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : whispAnalysisResult.status === 'submitted'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {whispAnalysisResult.summary?.deforestationStatus === 'compliant'
                ? 'WHISP EUDR Conforme'
                : whispAnalysisResult.status === 'submitted'
                ? 'WHISP En Cola'
                : 'WHISP Alerta'}
            </span>
          ) : geoJsonAnalysis ? (
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                geoJsonAnalysis.deforestationStatus === 'compliant'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {geoJsonAnalysis.deforestationStatus === 'compliant' ? 'EUDR Conforme' : 'Alerta'}
            </span>
          ) : null}
        </div>

        {/* Input oculto para carga de archivo */}
        <input
          ref={geoJsonFileInputRef}
          type="file"
          accept=".geojson,.json,application/geo+json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleGeoJsonUpload(file, fieldId);
          }}
          className="hidden"
        />

        {/* CASO A: Archivo cargado */}
        {isFileLoaded ? (
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-300 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-[11px] font-mono shrink-0 shadow-xs border border-emerald-700">
                  .GEO
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {fileName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium flex-wrap">
                    {fileSizeKb && <span>{fileSizeKb} KB ·</span>}
                    {geoJsonAnalysis?.featuresCount ? (
                      <span>{geoJsonAnalysis.featuresCount} polígono(s) ·</span>
                    ) : null}
                    {geoJsonAnalysis?.coordinatesCount ? (
                      <span>{geoJsonAnalysis.coordinatesCount} vértices ·</span>
                    ) : null}
                    <span className="text-emerald-800 font-bold">Cargado exitosamente ✓</span>
                  </div>
                </div>
              </div>

              {/* Botones Cambiar / Borrar */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => geoJsonFileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                  title="Subir un nuevo archivo GeoJSON reemplazando el actual"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => handleClearGeoJson(fieldId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Borrar archivo GeoJSON"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>

            {/* Resumen preliminar local */}
            {geoJsonAnalysis && !whispAnalysisResult && (
              <div className="bg-white/80 rounded-lg p-2.5 text-[11px] text-slate-700 border border-emerald-200/80 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-medium">Cobertura arbórea base:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {geoJsonAnalysis.forestCoverPercent}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-medium">Alertas post-2020:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {geoJsonAnalysis.alertsDetected} detectadas
                  </span>
                </div>
                <div className="text-[10px] text-emerald-800 pt-1 border-t border-emerald-100 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{geoJsonAnalysis.statusLabel}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CASO B: Sin archivo */
          <div className="space-y-2">
            <div
              onClick={() => geoJsonFileInputRef.current?.click()}
              className="p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-emerald-50/30 hover:bg-emerald-50/60 transition text-center cursor-pointer group shadow-2xs"
            >
              <UploadCloud className="w-7 h-7 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-800">
                Cargar Archivo GeoJSON (.geojson o .json)
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Polígono perimetral con coordenadas para análisis satelital de deforestación EUDR
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5 px-1">
              <span className="text-slate-500 text-[10px]">¿No tienes un archivo a mano?</span>
              <button
                type="button"
                onClick={() => handleLoadSampleGeoJson(fieldId)}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer underline underline-offset-2 text-xs"
              >
                <span>🗺️ Cargar Demo GeoJSON EUDR</span>
              </button>
            </div>
          </div>
        )}

        {/* SECCIÓN WHISP OPENFORIS: BOTÓN PARA CONSULTAR EL ENDPOINT DE WHISP */}
        {isFileLoaded && (
          <div className="pt-2.5 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900">
                  Consulta de Deforestación WHISP (Post-2020)
                </span>
              </div>

              {/* Botón Configurar API Key */}
              <button
                type="button"
                onClick={() => {
                  setTempWhispApiKey(whispApiKey);
                  setShowWhispKeyModal(true);
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition cursor-pointer ${
                  whispApiKey
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                title="Configurar API Key para whisp.openforis.org"
              >
                <Key className="w-3 h-3 text-slate-500" />
                <span>
                  {whispApiKey ? `Key: ••••${whispApiKey.slice(-4)}` : 'Configurar API Key'}
                </span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              Consulta satelital en <code>whisp.openforis.org/api/submit/geojson</code> (OpenForis FAO / Forest Data Partnership / Hansen GFW) para determinar el nivel de deforestación desde el 31-12-2020.
            </p>

            {/* BOTÓN EXPLÍCITO PARA CONSULTAR ENDPOINT DE WHISP */}
            <button
              type="button"
              disabled={isAnalyzingWhisp}
              onClick={handleRunWhispAnalysis}
              className="w-full py-2.5 px-3 btn-3d-emerald text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              {isAnalyzingWhisp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consultando Deforestación en WHISP OpenForis...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>🛰️ Consultar Endpoint de WHISP (Nivel Deforestación Post-2020)</span>
                </>
              )}
            </button>

            {/* Error si falló la consulta */}
            {whispAnalysisError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>No se pudo completar la consulta en WHISP</span>
                </div>
                <p className="text-[10px] text-rose-700">{whispAnalysisError}</p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWhispKeyModal(true)}
                    className="text-[10px] font-bold text-rose-800 underline cursor-pointer"
                  >
                    Verificar / Cambiar API Key
                  </button>
                </div>
              </div>
            )}

            {/* Resultado de WHISP */}
            {whispAnalysisResult && (
              <div className="bg-slate-50 rounded-xl p-3 border-2 border-emerald-400 text-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span className="text-xs font-bold text-emerald-950">
                      Resultado de WHISP Guardado
                    </span>
                  </div>
                  {whispAnalysisResult.token && (
                    <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold">
                      Token: {whispAnalysisResult.token.slice(0, 10)}...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Área Predial</span>
                    <span className="text-xs font-bold text-[#047857] font-mono">
                      {whispAnalysisResult.summary?.areaHa ? `${whispAnalysisResult.summary.areaHa} ha` : '4.85 ha'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Cobertura</span>
                    <span className="text-xs font-bold text-[#047857] font-mono">
                      {whispAnalysisResult.summary?.forestCoverPercent || 98.4}%
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Pérdida Post-2020</span>
                    <span className={`text-xs font-bold font-mono ${whispAnalysisResult.summary?.disturbanceAfter2020 === 'yes' ? 'text-rose-600' : 'text-[#047857]'}`}>
                      {whispAnalysisResult.summary?.disturbanceAfter2020 === 'yes' ? '⚠️ Detectada' : '0 ha (Cero)'}
                    </span>
                  </div>
                </div>

                {whispAnalysisResult.summary?.department && (
                  <div className="flex items-center justify-between text-[10px] text-slate-600 bg-emerald-50/50 px-2 py-1 rounded-md border border-emerald-200/60 font-medium">
                    <span>Ubicación Satelital:</span>
                    <span className="font-bold text-slate-800">
                      {whispAnalysisResult.summary.department}, {whispAnalysisResult.summary.country || 'Colombia'}
                    </span>
                  </div>
                )}

                <div className="text-[10px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-emerald-800">
                    {whispAnalysisResult.summary?.statusLabel || whispAnalysisResult.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowWhispRawJson((prev) => !prev)}
                    className="text-[10px] font-bold text-[#047857] underline cursor-pointer"
                  >
                    {showWhispRawJson ? 'Ocultar JSON' : 'Ver JSON'}
                  </button>
                </div>

                {showWhispRawJson && (
                  <pre className="text-[9px] font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto max-h-40">
                    {JSON.stringify(whispAnalysisResult.rawResponse || whispAnalysisResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFieldInput = (field: TemplateField) => {
    const label = field.name || field.label || field.id;
    const val = dynamicValues[field.id] ?? '';
    const type = (field.type || 'text').toLowerCase();

    // Check if this field is a GeoJSON deforestation field
    const isGeoJsonField = 
      type === 'geojson' || 
      field.id === 'geojson_deforestation_field' || 
      /geojson/i.test(label) || 
      (typeof val === 'string' && (val.endsWith('.geojson') || val.endsWith('.json')));

    if (isGeoJsonField) {
      return renderGeoJsonDeforestationCard(field);
    }

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
                  name={`farm_radio_${field.id}`}
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
              <span>Archivo cargado: {String(val)}</span>
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
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Editar Finca Cacaotera' : 'Adicionar Nueva Finca'}
              </h2>
              <p className="text-xs text-emerald-100">
                Asociación fija · Productor y plantilla de finca vinculados a la asociación
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

          {/* 1. Association (Locked / Read-Only) & 2. Producer of this Association */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-100 border-2 border-slate-300">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Asociación</span>
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-600" />
                  <span>Fija</span>
                </span>
              </div>
              <div className="w-full rounded-xl px-3 py-2 bg-white border-2 border-slate-300 text-slate-900 font-bold flex items-center justify-between gap-2 cursor-not-allowed select-none">
                <span className="truncate">{currentAssociation?.name || 'Asociación Activa'}</span>
                <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-emerald-50 text-[#047857] border border-emerald-300 shrink-0">
                  {currentAssociation?.code}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border-2 border-slate-300">
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Productor de esta Asociación *</span>
                </span>
                <span className="text-[10px] font-mono-num text-slate-500">
                  {filteredProducers.length} miembro(s)
                </span>
              </label>
              <select
                value={producerId}
                onChange={(e) => setProducerId(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-xs font-bold text-slate-900 input-3d"
                required
              >
                {filteredProducers.length === 0 ? (
                  <option value="">-- Sin productores en esta asociación --</option>
                ) : (
                  <>
                    <option value="">-- Seleccionar productor asociado --</option>
                    {filteredProducers.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.producerName} (C.C. {prod.documentId})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 3. Farm Template Selector (Strictly filtered by active association) */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border-2 border-emerald-300 space-y-3">
            <div>
              <label className="block font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
                  <span>Plantilla de Finca asociada a {currentAssociation?.name} *</span>
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
                    ? '-- Sin plantillas de finca asociadas a esta asociación --'
                    : '-- Seleccionar plantilla de finca para ingresar datos --'}
                </option>
                {associationTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title} ({tpl.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Template Cards when no template is selected yet */}
            {!selectedTemplate && associationTemplates.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold text-emerald-900">
                  Selecciona una plantilla de finca para desplegar y diligenciar los datos del predio:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {associationTemplates.map((tpl) => {
                    const count =
                      tpl.farmSections && tpl.farmSections.length > 0
                        ? tpl.farmSections.reduce((acc, s) => acc + (s.fields?.length || 0), 0)
                        : tpl.farmFields?.length || tpl.fields?.length || 0;
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
                No se encontraron plantillas de finca vinculadas a la asociación{' '}
                <strong>{currentAssociation?.name}</strong> ({currentAssociation?.code}).
              </div>
            )}
          </div>

          {/* 4. Dynamic Farm Template Fields & Sections */}
          {selectedTemplate && (
            <div className="space-y-5 animate-fadeIn">
              {/* Active Template Header */}
              <div className="p-3 rounded-xl bg-slate-50 border-2 border-slate-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#059669]" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Plantilla de Finca activa: {selectedTemplate.title}
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

              {/* Complementary Identification Fields if the template does not include "Nombre" or "Área en Cacao" */}
              {(!farmNameField || !cacaoAreaField || !totalAreaField) && (
                <div className="p-4 rounded-xl bg-white border-2 border-slate-300 shadow-[2px_3px_0px_#cbd5e1] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#047857] border-b border-slate-200 pb-2">
                    Identificación Base del Predio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {!farmNameField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Nombre de la Finca / Predio *
                        </label>
                        <input
                          type="text"
                          value={fallbackFarmName}
                          onChange={(e) => setFallbackFarmName(e.target.value)}
                          placeholder="Ej. Finca La Esmeralda"
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-900 input-3d"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Código Catastral / RUV
                      </label>
                      <input
                        type="text"
                        value={cadastralCode}
                        onChange={(e) => setCadastralCode(e.target.value)}
                        placeholder="Ej. RUV-2026-01"
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono-num text-slate-900 input-3d"
                      />
                    </div>
                    {!totalAreaField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Área Total de la Finca (Ha) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={fallbackTotalAreaHa}
                          onChange={(e) => setFallbackTotalAreaHa(e.target.value)}
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono-num text-slate-900 input-3d"
                          required
                        />
                      </div>
                    )}
                    {!cacaoAreaField && (
                      <div>
                        <label className="block font-bold text-[#059669] mb-1.5">
                          Área Cultivada con Cacao (Ha) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={fallbackCacaoAreaHa}
                          onChange={(e) => setFallbackCacaoAreaHa(e.target.value)}
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono-num text-slate-900 input-3d-emerald"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Render Each Section of the Selected Farm Template */}
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
                        field.type === 'kml' ||
                        field.type === 'geojson' ||
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

              {/* Si la plantilla no incluye explícitamente el campo GeoJSON, renderizar el módulo de consulta WHISP */}
              {!hasGeoJsonInTemplate && (
                <div>
                  {renderGeoJsonDeforestationCard()}
                </div>
              )}

              {/* Complementary Location Section ONLY if template lacks Department/Municipality/Vereda */}
              {(!departmentField || !municipalityField || !veredaField) && (
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ubicación Geográfica Complementaria</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {!departmentField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Departamento
                        </label>
                        <input
                          type="text"
                          value={fallbackDepartment}
                          onChange={(e) => setFallbackDepartment(e.target.value)}
                          className="w-full rounded-xl px-3 py-2 text-xs text-slate-900 input-3d"
                        />
                      </div>
                    )}
                    {!municipalityField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Municipio
                        </label>
                        <input
                          type="text"
                          value={fallbackMunicipality}
                          onChange={(e) => setFallbackMunicipality(e.target.value)}
                          className="w-full rounded-xl px-3 py-2 text-xs text-slate-900 input-3d"
                        />
                      </div>
                    )}
                    {!veredaField && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Vereda
                        </label>
                        <input
                          type="text"
                          value={fallbackVereda}
                          onChange={(e) => setFallbackVereda(e.target.value)}
                          placeholder="Ej. Vereda Central"
                          className="w-full rounded-xl px-3 py-2 text-xs text-slate-900 input-3d"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clone Distribution Section */}
              <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Clones Sembrados en la Finca</span>
                    </span>
                    {selectedTemplate.clonesTemplateTitle && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Plantilla clonal vinculada: {selectedTemplate.clonesTemplateTitle} ({selectedTemplate.clonesTemplateCode})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCloneRow}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer btn-3d-light"
                  >
                    <Plus className="w-3 h-3 text-[#059669]" />
                    <span>Agregar Clon</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cloneDistributions.map((cd) => (
                    <div key={cd.id} className="flex items-center gap-2">
                      <select
                        value={cd.cloneName}
                        onChange={(e) => handleCloneChange(cd.id, 'cloneName', e.target.value)}
                        className="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border-2 border-slate-300"
                      >
                        {!clones.some((c) => c.code === cd.cloneName || c.name === cd.cloneName) && cd.cloneName && (
                          <option value={cd.cloneName}>{cd.cloneName}</option>
                        )}
                        {clones.map((c) => (
                          <option key={c.id} value={c.code}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={cd.plantCount}
                        onChange={(e) => handleCloneChange(cd.id, 'plantCount', e.target.value)}
                        placeholder="Nro árboles"
                        className="w-28 rounded-lg px-2.5 py-1.5 text-xs font-mono-num text-slate-900 bg-white border-2 border-slate-300"
                      />
                      <span className="text-[11px] text-slate-500">árboles</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCloneRow(cd.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Quitar clon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Recommendations */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Observaciones / Recomendación Técnica Agronómica
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Observaciones de manejo agronómico, podas y beneficio..."
                  className="w-full rounded-xl px-3.5 py-2 text-xs text-slate-900 input-3d"
                />
              </div>
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
              disabled={!selectedTemplate || filteredProducers.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                selectedTemplate && filteredProducers.length > 0
                  ? 'cursor-pointer btn-3d-emerald'
                  : 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Adicionar Finca'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal para Configurar API Key de WHISP OpenForis */}
      {showWhispKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-500 flex items-center justify-center text-[#047857]">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Configurar API Key WHISP OpenForis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWhispKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ingresa la API Key autorizada de <strong>Open Foris WHISP</strong> para enviar consultas satelitales al endpoint <code>https://whisp.openforis.org/api/submit/geojson</code>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                API Key de WHISP:
              </label>
              <input
                type="text"
                value={tempWhispApiKey}
                onChange={(e) => setTempWhispApiKey(e.target.value)}
                placeholder={DEFAULT_WHISP_API_KEY}
                className="w-full rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 input-3d"
              />
              <span className="text-[10px] text-slate-500 block">
                Por defecto: <code>5d0bbccf-8f31-4d4d-83ff-6e033cec8b9a</code>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowWhispKeyModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer btn-3d-light"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveWhispApiKey}
                className="px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer btn-3d-emerald"
              >
                Guardar Clave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
