import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Association, 
  Producer, 
  Farm, 
  CentralBeneficio, 
  ReceptionBatch, 
  CacaoClone, 
  ProducerTemplate,
  FarmTemplate,
  EcosystemUserAccount 
} from '../types';
import { 
  INITIAL_ASSOCIATIONS, 
  INITIAL_PRODUCERS, 
  INITIAL_FARMS, 
  INITIAL_CENTRALES,
  INITIAL_RECEPTIONS,
  INITIAL_CLONES
} from '../data/mockData';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Helper to sanitize undefined values before Firestore writes
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (Array.isArray(data)) {
    return data.filter((i) => i !== undefined).map((i) => sanitizeForFirestore(i)) as any;
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

// Local Storage Keys for Instant Offline Cache
const STORAGE_KEYS = {
  ASSOCIATIONS: 'agronomatrix_central_associations',
  PRODUCERS: 'agronomatrix_central_producers',
  FARMS: 'agronomatrix_central_farms',
  PRODUCER_TEMPLATES: 'agronomatrix_central_producer_templates',
  FARM_TEMPLATES: 'agronomatrix_central_farm_templates',
  CENTRALES: 'agronomatrix_central_facilities',
  RECEPTIONS: 'agronomatrix_central_receptions',
  CLONES: 'agronomatrix_central_clones'
};

function readLocalCache<T>(key: string, fallback: T): T {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T;
    }
  } catch (e) {
    console.warn(`Error reading local cache for ${key}:`, e);
  }
  return fallback;
}

function writeLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing local cache for ${key}:`, e);
  }
}

/**
 * Real-time subscription to Associations (stored in `cacao_templates` with category='asociacion')
 */
export function subscribeToAssociations(
  onData: (associations: Association[]) => void,
  onStatusChange?: (isOnline: boolean) => void
) {
  const colRef = collection(db, 'cacao_templates');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (onStatusChange) onStatusChange(true);
        const list: Association[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === 'asociacion') {
            list.push({
              id: docSnap.id,
              name: data.title || data.name || 'Asociación Sin Nombre',
              code: data.code || `ASOC-${docSnap.id.slice(0, 4)}`,
              description: data.description || '',
              department: data.associationDetails?.department || data.department || 'Santander',
              municipality: data.associationDetails?.municipality || data.municipality || 'San Vicente de Chucurí',
              contactPhone: data.associationDetails?.contactPhone || data.contactPhone,
              contactEmail: data.associationDetails?.contactEmail || data.contactEmail,
              totalMembers: data.associationDetails?.totalMembers || data.totalMembers || 0,
              certifiedHectares: data.associationDetails?.certifiedHectares || data.certifiedHectares || 0,
              createdAt: data.createdAt || new Date().toISOString()
            });
          }
        });

        if (list.length === 0) {
          const fallback = readLocalCache(STORAGE_KEYS.ASSOCIATIONS, INITIAL_ASSOCIATIONS);
          writeLocalCache(STORAGE_KEYS.ASSOCIATIONS, fallback);
          onData(fallback);
        } else {
          writeLocalCache(STORAGE_KEYS.ASSOCIATIONS, list);
          onData(list);
        }
      },
      (err) => {
        console.warn('Firestore associations subscription warning, using local cache:', err.message);
        if (onStatusChange) onStatusChange(false);
        const fallback = readLocalCache(STORAGE_KEYS.ASSOCIATIONS, INITIAL_ASSOCIATIONS);
        onData(fallback);
      }
    );
  } catch (e) {
    if (onStatusChange) onStatusChange(false);
    const fallback = readLocalCache(STORAGE_KEYS.ASSOCIATIONS, INITIAL_ASSOCIATIONS);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Real-time subscription to Producers (`cacao_producers`)
 */
export function subscribeToProducers(
  onData: (producers: Producer[]) => void,
  onStatusChange?: (isOnline: boolean) => void
) {
  const colRef = collection(db, 'cacao_producers');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (onStatusChange) onStatusChange(true);
        const list: Producer[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let resolvedDocId = data.documentId || 'N/A';
          if (
            (resolvedDocId.toLowerCase() === 'cc' || resolvedDocId.toLowerCase() === 'ti' || resolvedDocId === 'N/A') &&
            data.dynamicValues
          ) {
            const numericVal = Object.values(data.dynamicValues).find(
              (v) => typeof v === 'string' && /^\d{5,12}$/.test(v.trim())
            );
            if (numericVal) resolvedDocId = String(numericVal).trim();
          }

          list.push({
            id: docSnap.id,
            templateId: data.templateId,
            templateCode: data.templateCode,
            templateTitle: data.templateTitle,
            associationId: data.associationId,
            associationName: data.associationName,
            associationCode: data.associationCode,
            producerName: data.producerName || 'Productor sin nombre',
            documentId: resolvedDocId,
            phone: data.phone,
            veredaOrLocation: data.veredaOrLocation || 'Vereda General',
            latitude: data.latitude,
            longitude: data.longitude,
            gpsAccuracy: data.gpsAccuracy,
            photoUrl: data.photoUrl,
            dataAuthorization: data.dataAuthorization ?? true,
            dynamicValues: data.dynamicValues || {},
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            syncStatus: data.syncStatus,
            operatorEmail: data.operatorEmail,
            sourceDevice: data.sourceDevice
          });
        });

        writeLocalCache(STORAGE_KEYS.PRODUCERS, list);
        onData(list);
      },
      (err) => {
        console.warn('Firestore producers subscription warning, using local cache:', err.message);
        if (onStatusChange) onStatusChange(false);
        const fallback = readLocalCache(STORAGE_KEYS.PRODUCERS, INITIAL_PRODUCERS);
        onData(fallback);
      }
    );
  } catch (e) {
    if (onStatusChange) onStatusChange(false);
    const fallback = readLocalCache(STORAGE_KEYS.PRODUCERS, INITIAL_PRODUCERS);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Real-time subscription to Farms (`cacao_farms`)
 */
export function subscribeToFarms(
  onData: (farms: Farm[]) => void,
  onStatusChange?: (isOnline: boolean) => void
) {
  const colRef = collection(db, 'cacao_farms');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (onStatusChange) onStatusChange(true);
        const list: Farm[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            templateId: data.templateId,
            templateCode: data.templateCode,
            templateTitle: data.templateTitle,
            producerId: data.producerId,
            producerName: data.producerName,
            producerDocument: data.producerDocument,
            associationId: data.associationId,
            associationName: data.associationName,
            associationCode: data.associationCode,
            farmName: data.farmName || 'Predio Cacaotero',
            cadastralCode: data.cadastralCode || 'N/A',
            department: data.department || 'Santander',
            municipality: data.municipality || 'San Vicente de Chucurí',
            vereda: data.vereda || 'Vereda General',
            latitude: data.latitude,
            longitude: data.longitude,
            altitudeMeters: data.altitudeMeters,
            gpsAccuracy: data.gpsAccuracy,
            totalAreaHa: data.totalAreaHa || 0,
            cacaoAreaHa: data.cacaoAreaHa || 0,
            cloneDistributions: data.cloneDistributions || [],
            dynamicValues: data.dynamicValues || {},
            deforestationStatus: data.deforestationStatus || 'compliant',
            deforestationDetails: data.deforestationDetails || 'Verificado conforme a normativa EUDR.',
            kmlFileName: data.kmlFileName,
            visitDate: data.visitDate,
            recommendations: data.recommendations,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            syncStatus: data.syncStatus,
            technicianEmail: data.technicianEmail
          });
        });

        writeLocalCache(STORAGE_KEYS.FARMS, list);
        onData(list);
      },
      (err) => {
        console.warn('Firestore farms subscription warning, using local cache:', err.message);
        if (onStatusChange) onStatusChange(false);
        const fallback = readLocalCache(STORAGE_KEYS.FARMS, INITIAL_FARMS);
        onData(fallback);
      }
    );
  } catch (e) {
    if (onStatusChange) onStatusChange(false);
    const fallback = readLocalCache(STORAGE_KEYS.FARMS, INITIAL_FARMS);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Real-time subscription to Centrales de Beneficio (`cacao_templates` category='centrales_beneficio')
 */
export function subscribeToCentrales(
  onData: (centrales: CentralBeneficio[]) => void,
  onStatusChange?: (isOnline: boolean) => void
) {
  const colRef = collection(db, 'cacao_templates');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (onStatusChange) onStatusChange(true);
        const list: CentralBeneficio[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === 'centrales_beneficio') {
            list.push({
              id: docSnap.id,
              title: data.title || data.centralName || 'Central de Beneficio',
              code: data.code || `CENTRAL-${docSnap.id.slice(0, 4)}`,
              centralName: data.centralName || data.title || 'Central de Beneficio',
              description: data.description || '',
              associationId: data.associationId,
              associationName: data.associationName,
              associationCode: data.associationCode,
              department: data.centralLocation?.department || data.department || 'Santander',
              municipality: data.centralLocation?.municipality || data.municipality || 'San Vicente de Chucurí',
              veredaOrAddress: data.centralLocation?.veredaOrAddress || data.veredaOrAddress || '',
              latitude: data.centralLocation?.latitude || data.latitude,
              longitude: data.centralLocation?.longitude || data.longitude,
              altitudeMeters: data.centralLocation?.altitudeMeters || data.altitudeMeters,
              capacityKgPerMonth: data.processingCapacityKgMonth || data.capacityKgPerMonth || 15000,
              fermentationBoxesCount: data.fermentationBoxesCount || 10,
              fermentationType: data.fermentationType || 'Cajones de Madera Escalonados',
              dryingAreaSqMeters: data.dryingAreaSqMeters || 180,
              dryingType: data.dryingType || 'Marquesina Solar Tipo Túnel',
              status: (data.status as any) || 'operativa',
              activeBatchesCount: data.activeBatchesCount || 2,
              createdAt: data.createdAt
            });
          }
        });

        if (list.length === 0) {
          const fallback = readLocalCache(STORAGE_KEYS.CENTRALES, INITIAL_CENTRALES);
          writeLocalCache(STORAGE_KEYS.CENTRALES, fallback);
          onData(fallback);
        } else {
          writeLocalCache(STORAGE_KEYS.CENTRALES, list);
          onData(list);
        }
      },
      (err) => {
        console.warn('Firestore centrales subscription warning, using local cache:', err.message);
        if (onStatusChange) onStatusChange(false);
        const fallback = readLocalCache(STORAGE_KEYS.CENTRALES, INITIAL_CENTRALES);
        onData(fallback);
      }
    );
  } catch (e) {
    if (onStatusChange) onStatusChange(false);
    const fallback = readLocalCache(STORAGE_KEYS.CENTRALES, INITIAL_CENTRALES);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Real-time subscription to Reception Batches (`cacao_receptions`)
 */
export function subscribeToReceptions(
  onData: (receptions: ReceptionBatch[]) => void,
  onStatusChange?: (isOnline: boolean) => void
) {
  const colRef = collection(db, 'cacao_receptions');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (onStatusChange) onStatusChange(true);
        const list: ReceptionBatch[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ReceptionBatch);
        });

        if (list.length === 0) {
          const fallback = readLocalCache(STORAGE_KEYS.RECEPTIONS, INITIAL_RECEPTIONS);
          writeLocalCache(STORAGE_KEYS.RECEPTIONS, fallback);
          onData(fallback);
        } else {
          writeLocalCache(STORAGE_KEYS.RECEPTIONS, list);
          onData(list);
        }
      },
      (err) => {
        console.warn('Firestore receptions subscription warning, using local cache:', err.message);
        if (onStatusChange) onStatusChange(false);
        const fallback = readLocalCache(STORAGE_KEYS.RECEPTIONS, INITIAL_RECEPTIONS);
        onData(fallback);
      }
    );
  } catch (e) {
    if (onStatusChange) onStatusChange(false);
    const fallback = readLocalCache(STORAGE_KEYS.RECEPTIONS, INITIAL_RECEPTIONS);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Saves or updates a Producer in Firestore and local cache
 */
export async function saveProducerToFirestore(producer: Producer): Promise<void> {
  try {
    const docRef = doc(db, 'cacao_producers', producer.id);
    await setDoc(docRef, sanitizeForFirestore(producer), { merge: true });
  } catch (e) {
    console.warn('Could not write producer to Firestore, storing in local cache:', e);
  }

  try {
    const current = readLocalCache<Producer[]>(STORAGE_KEYS.PRODUCERS, INITIAL_PRODUCERS);
    const existingIndex = current.findIndex((p) => p.id === producer.id);
    const updated = existingIndex >= 0
      ? current.map((p) => (p.id === producer.id ? producer : p))
      : [producer, ...current];
    writeLocalCache(STORAGE_KEYS.PRODUCERS, updated);
  } catch (e) {
    console.error('Error updating local producer cache:', e);
  }
}

/**
 * Deletes a Producer from Firestore and local cache
 */
export async function deleteProducerFromFirestore(producerId: string): Promise<void> {
  try {
    const docRef = doc(db, 'cacao_producers', producerId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Could not delete producer from Firestore, updating local cache:', e);
  }

  try {
    const current = readLocalCache<Producer[]>(STORAGE_KEYS.PRODUCERS, INITIAL_PRODUCERS);
    const updated = current.filter((p) => p.id !== producerId);
    localStorage.setItem(STORAGE_KEYS.PRODUCERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting producer from local cache:', e);
  }
}

/**
 * Saves or updates a Farm in Firestore and local cache
 */
export async function saveFarmToFirestore(farm: Farm): Promise<void> {
  try {
    const docRef = doc(db, 'cacao_farms', farm.id);
    await setDoc(docRef, sanitizeForFirestore(farm), { merge: true });
  } catch (e) {
    console.warn('Could not write farm to Firestore, storing in local cache:', e);
  }

  try {
    const current = readLocalCache<Farm[]>(STORAGE_KEYS.FARMS, INITIAL_FARMS);
    const existingIndex = current.findIndex((f) => f.id === farm.id);
    const updated = existingIndex >= 0
      ? current.map((f) => (f.id === farm.id ? farm : f))
      : [farm, ...current];
    writeLocalCache(STORAGE_KEYS.FARMS, updated);
  } catch (e) {
    console.error('Error updating local farm cache:', e);
  }
}

/**
 * Deletes a Farm from Firestore and local cache
 */
export async function deleteFarmFromFirestore(farmId: string): Promise<void> {
  try {
    const docRef = doc(db, 'cacao_farms', farmId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Could not delete farm from Firestore, updating local cache:', e);
  }

  try {
    const current = readLocalCache<Farm[]>(STORAGE_KEYS.FARMS, INITIAL_FARMS);
    const updated = current.filter((f) => f.id !== farmId);
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting farm from local cache:', e);
  }
}

/**
 * Real-time subscription to Producer Templates (`cacao_templates` category='productores')
 */
export function subscribeToProducerTemplates(
  onData: (templates: ProducerTemplate[]) => void
) {
  const colRef = collection(db, 'cacao_templates');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: ProducerTemplate[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === 'productores' || data.category === 'productor') {
            list.push({
              id: docSnap.id,
              code: data.code || `PROD-${docSnap.id.slice(0, 4)}`,
              title: data.title || data.name || 'Plantilla de Productor',
              description: data.description || '',
              associationId: data.associationId,
              associationName: data.associationName,
              associationCode: data.associationCode,
              requireDataAuthorization: data.requireDataAuthorization ?? true,
              producerSections: data.producerSections || [],
              producerFields: data.producerFields || [],
              fields: data.fields || [],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          }
        });

        writeLocalCache(STORAGE_KEYS.PRODUCER_TEMPLATES, list);
        onData(list);
      },
      () => {
        const fallback = readLocalCache<ProducerTemplate[]>(STORAGE_KEYS.PRODUCER_TEMPLATES, []);
        onData(fallback);
      }
    );
  } catch (e) {
    const fallback = readLocalCache<ProducerTemplate[]>(STORAGE_KEYS.PRODUCER_TEMPLATES, []);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Real-time subscription to Farm Templates (`cacao_templates` category='fincas')
 */
export function subscribeToFarmTemplates(
  onData: (templates: FarmTemplate[]) => void
) {
  const colRef = collection(db, 'cacao_templates');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: FarmTemplate[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === 'fincas' || data.category === 'finca') {
            list.push({
              id: docSnap.id,
              code: data.code || `FINCA-${docSnap.id.slice(0, 4)}`,
              title: data.title || data.name || 'Plantilla de Finca',
              description: data.description || '',
              associationId: data.associationId,
              associationName: data.associationName,
              associationCode: data.associationCode,
              requireKmlPolygon: data.requireKmlPolygon ?? false,
              requireGpsCoordinates: data.requireGpsCoordinates ?? false,
              clonesTemplateId: data.clonesTemplateId,
              clonesTemplateCode: data.clonesTemplateCode,
              clonesTemplateTitle: data.clonesTemplateTitle,
              cloneDistributions: data.cloneDistributions || [],
              clones: data.clones || [],
              farmSections: data.farmSections || [],
              farmFields: data.farmFields || [],
              fields: data.fields || [],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          }
        });

        writeLocalCache(STORAGE_KEYS.FARM_TEMPLATES, list);
        onData(list);
      },
      () => {
        const fallback = readLocalCache<FarmTemplate[]>(STORAGE_KEYS.FARM_TEMPLATES, []);
        onData(fallback);
      }
    );
  } catch (e) {
    const fallback = readLocalCache<FarmTemplate[]>(STORAGE_KEYS.FARM_TEMPLATES, []);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Real-time subscription to Cacao Clones (`cacao_templates` category='clones')
 */
export function subscribeToClones(
  onData: (clones: CacaoClone[]) => void
) {
  const colRef = collection(db, 'cacao_templates');
  let unsubscribe: (() => void) | null = null;

  try {
    unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: CacaoClone[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === 'clones' || data.category === 'clon') {
            list.push({
              id: docSnap.id,
              code: data.code || data.title || docSnap.id,
              name: data.title || data.name || 'Clon de Cacao',
              origin: data.origin || 'Colombia / Selección Genética',
              category: data.cloneCategory || 'Fino de Aroma',
              sensoryProfile: data.sensoryProfile || data.description || 'Notas frutales, florales y cacao fino.',
              grainIndexGrams: data.grainIndexGrams || 1.6,
              podIndex: data.podIndex || 17,
              yieldKgHaYear: data.yieldKgHaYear || 1600,
              altitudeRange: data.altitudeRange || '200 - 1.200 m.s.n.m.',
              moniliaResistance: data.moniliaResistance || 'Tolerante',
              escobaBrujaResistance: data.escobaBrujaResistance || 'Alta',
              fermentationDays: data.fermentationDays || 6,
              description: data.description || ''
            });
          }
        });

        if (list.length === 0) {
          const fallback = readLocalCache(STORAGE_KEYS.CLONES, INITIAL_CLONES);
          writeLocalCache(STORAGE_KEYS.CLONES, fallback);
          onData(fallback);
        } else {
          writeLocalCache(STORAGE_KEYS.CLONES, list);
          onData(list);
        }
      },
      () => {
        const fallback = readLocalCache(STORAGE_KEYS.CLONES, INITIAL_CLONES);
        onData(fallback);
      }
    );
  } catch (e) {
    const fallback = readLocalCache(STORAGE_KEYS.CLONES, INITIAL_CLONES);
    onData(fallback);
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Saves a new reception batch in Firestore and updates local cache
 */
export async function saveReceptionToFirestore(batch: ReceptionBatch): Promise<void> {
  try {
    const docRef = doc(db, 'cacao_receptions', batch.id);
    await setDoc(docRef, sanitizeForFirestore(batch), { merge: true });
  } catch (e) {
    console.warn('Could not write reception to Firestore, storing in local cache:', e);
  }

  // Update local cache
  try {
    const current = readLocalCache<ReceptionBatch[]>(STORAGE_KEYS.RECEPTIONS, INITIAL_RECEPTIONS);
    const existingIndex = current.findIndex((r) => r.id === batch.id);
    const updated = existingIndex >= 0 
      ? current.map((r) => (r.id === batch.id ? batch : r))
      : [batch, ...current];
    writeLocalCache(STORAGE_KEYS.RECEPTIONS, updated);
  } catch (e) {
    console.error('Error updating local reception cache:', e);
  }
}

export const ECOSYSTEM_USERS_STORAGE_KEY = 'cacao_ecosystem_users';
export const ECOSYSTEM_USERS_RECORDS_CATEGORY = 'ecosystem_users';

/**
 * Root Administrator and Seed accounts from the Administrative Web Application
 */
export const PRIMARY_ADMIN_EMAIL = 'juanpablo.garzonruiz@gmail.com';

export const INITIAL_ECOSYSTEM_USERS: EcosystemUserAccount[] = [
  {
    id: 'user_primary',
    name: 'Juan Pablo Garzón Ruiz',
    email: PRIMARY_ADMIN_EMAIL,
    phone: '+57 312 456 7890',
    role: 'Director General / Super Administrador',
    isPrimary: true,
    assignedApps: ['admin', 'campo', 'central'],
    password: 'Moquitas2026.',
    totpSecret: 'CACAOSECRETOPREMIUM234567CACAO23',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    authProvider: 'firebaseAuth'
  }
];

/**
 * Real-time subscription to Ecosystem Users created in the administrative application
 * Stored in Firestore collection `records` with category `ecosystem_users` or id `eco_user_*`
 */
export function subscribeToEcosystemUsers(
  onData: (users: EcosystemUserAccount[]) => void
) {
  const colRef = collection(db, 'records');

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const list: EcosystemUserAccount[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && (data.category === ECOSYSTEM_USERS_RECORDS_CATEGORY || docSnap.id.startsWith('eco_user_'))) {
          list.push({
            id: docSnap.id,
            name: data.name || data.email?.split('@')[0] || 'Operador Central',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'Supervisor Central de Beneficio',
            isPrimary: data.isPrimary || data.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL,
            assignedApps: data.assignedApps || ['central'],
            password: data.password || '',
            totpSecret: data.totpSecret || 'CACAOSECRETOPREMIUM234567CACAO23',
            status: (data.status as any) || 'active',
            avatarUrl: data.avatarUrl,
            createdAt: data.createdAt,
            authProvider: data.authProvider || 'firebaseAuth'
          });
        }
      });

      // Merge with initial ecosystem user if not present
      const hasPrimary = list.some((u) => u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL);
      const finalList = hasPrimary ? list : [...INITIAL_ECOSYSTEM_USERS, ...list];

      try {
        localStorage.setItem(ECOSYSTEM_USERS_STORAGE_KEY, JSON.stringify(finalList));
      } catch (e) {
        console.warn('Error saving ecosystem users to cache:', e);
      }

      onData(finalList);
    },
    (err) => {
      console.warn('Ecosystem users subscription warning, falling back to local cache:', err.message);
      try {
        const cached = localStorage.getItem(ECOSYSTEM_USERS_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onData(parsed);
            return;
          }
        }
      } catch (e) {}
      onData(INITIAL_ECOSYSTEM_USERS);
    }
  );

  return unsubscribe;
}

/**
 * Authenticates user credentials directly using Firebase Authentication.
 */
export async function authenticateWithFirebaseAuth(
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'auth/wrong-password') {
      return { success: false, error: 'Contraseña incorrecta para la cuenta registrada en Firebase.' };
    }
    if (code === 'auth/user-disabled') {
      return { success: false, error: 'Esta cuenta ha sido suspendida en Firebase.' };
    }
    if (code === 'auth/too-many-requests') {
      return { success: false, error: 'Demasiados intentos fallidos. Intenta más tarde.' };
    }
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      return { success: false, error: 'Usuario no encontrado o credencial inválida en Firebase Authentication.' };
    }
    return { success: false, error: err?.message || 'Error de autenticación en Firebase' };
  }
}

/**
 * Signs out from Firebase Authentication
 */
export async function signOutFirebaseAuth(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Error al cerrar sesión en Firebase Auth:', e);
  }
}
