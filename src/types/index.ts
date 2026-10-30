export interface Association {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  municipality: string;
  contactPhone?: string;
  contactEmail?: string;
  totalMembers?: number;
  certifiedHectares?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateField {
  id: string;
  name?: string;
  label?: string;
  type: string;
  required?: boolean;
  options?: string[];
  dependentOptions?: Record<string, string[]>;
  parentFieldId?: string;
  parentFieldName?: string;
  unit?: string;
  placeholder?: string;
  defaultValue?: string;
  section?: string;
  fileAccepted?: string;
  attachmentFormat?: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
}

export interface ProducerTemplate {
  id: string;
  code: string;
  title: string;
  description?: string;
  associationId?: string;
  associationName?: string;
  associationCode?: string;
  requireDataAuthorization?: boolean;
  producerSections?: TemplateSection[];
  producerFields?: TemplateField[];
  fields?: TemplateField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmTemplate {
  id: string;
  code: string;
  title: string;
  description?: string;
  associationId?: string;
  associationName?: string;
  associationCode?: string;
  requireKmlPolygon?: boolean;
  requireGpsCoordinates?: boolean;
  clonesTemplateId?: string;
  clonesTemplateCode?: string;
  clonesTemplateTitle?: string;
  cloneDistributions?: CloneDistributionItem[];
  clones?: Array<{ id: string; name: string; code?: string }>;
  farmSections?: TemplateSection[];
  farmFields?: TemplateField[];
  fields?: TemplateField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Producer {
  id: string;
  templateId?: string;
  templateCode?: string;
  templateTitle?: string;
  associationId?: string;
  associationName?: string;
  associationCode?: string;
  producerName: string;
  documentId: string;
  phone?: string;
  veredaOrLocation?: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  photoUrl?: string;
  dataAuthorization?: boolean;
  dynamicValues?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: string;
  operatorEmail?: string;
  sourceDevice?: string;
  // Computed / aggregated
  farmsCount?: number;
  totalCacaoAreaHa?: number;
}

export interface CloneDistributionItem {
  id: string;
  cloneId?: string;
  cloneName: string;
  plantCount: number;
}

export interface Farm {
  id: string;
  templateId?: string;
  templateCode?: string;
  templateTitle?: string;
  producerId?: string;
  producerName?: string;
  producerDocument?: string;
  associationId?: string;
  associationName?: string;
  associationCode?: string;
  farmName: string;
  cadastralCode?: string;
  department?: string;
  municipality?: string;
  vereda?: string;
  latitude?: number;
  longitude?: number;
  altitudeMeters?: number;
  gpsAccuracy?: number;
  totalAreaHa?: number;
  cacaoAreaHa?: number;
  cloneDistributions?: CloneDistributionItem[];
  dynamicValues?: Record<string, any>;
  deforestationStatus?: 'compliant' | 'warning' | 'alert' | 'unverified';
  deforestationDetails?: string;
  whispAnalysisResult?: any;
  whispJobToken?: string;
  whispAnalyzedAt?: string;
  kmlFileName?: string;
  visitDate?: string;
  recommendations?: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: string;
  technicianEmail?: string;
}

export interface CentralBeneficio {
  id: string;
  title: string;
  code: string;
  centralName: string;
  description: string;
  associationId?: string;
  associationName?: string;
  associationCode?: string;
  department: string;
  municipality: string;
  veredaOrAddress?: string;
  latitude?: number | string;
  longitude?: number | string;
  altitudeMeters?: number;
  capacityKgPerMonth: number;
  fermentationBoxesCount: number;
  fermentationType?: string;
  dryingAreaSqMeters: number;
  dryingType?: string;
  status: 'operativa' | 'mantenimiento' | 'llenado';
  activeBatchesCount?: number;
  createdAt?: string;
}

export interface ReceptionBatch {
  id: string;
  batchCode: string;
  centralId: string;
  centralName: string;
  associationId: string;
  associationName: string;
  producerId: string;
  producerName: string;
  farmId: string;
  farmName: string;
  weightKgBaba: number;
  estimatedDryKg: number;
  cacaoVariety: string;
  fermentationBoxNumber: number;
  brixDegrees?: number;
  temperatureArrivalC?: number;
  receivedDate: string;
  technicianName: string;
  status: 'fermentacion' | 'secado' | 'almacenado' | 'despachado';
  notes?: string;
}

export interface CacaoClone {
  id: string;
  code: string;
  name: string;
  origin: string;
  category: 'Fino de Aroma' | 'Alta Productividad' | 'Trinitario' | 'Criollo Ancestral';
  sensoryProfile: string;
  grainIndexGrams: number;
  podIndex: number;
  yieldKgHaYear: number;
  altitudeRange: string;
  moniliaResistance: 'Alta' | 'Media' | 'Baja' | 'Tolerante';
  escobaBrujaResistance: 'Alta' | 'Media' | 'Baja' | 'Tolerante';
  fermentationDays: number;
  description: string;
}

export type MainTab = 'productores' | 'fincas' | 'clones' | 'centrales' | 'recepciones';

export * from './auth';
