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

export interface Producer {
  id: string;
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
  deforestationStatus?: 'compliant' | 'warning' | 'alert' | 'unverified';
  deforestationDetails?: string;
  kmlFileName?: string;
  visitDate?: string;
  recommendations?: string;
  createdAt?: string;
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

export type MainTab = 'productores' | 'fincas' | 'centrales' | 'recepciones';
