import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToAssociations, 
  subscribeToProducers, 
  subscribeToFarms, 
  subscribeToCentrales, 
  subscribeToReceptions, 
  saveReceptionToFirestore 
} from './lib/firebase';
import { 
  Association, 
  Producer, 
  Farm, 
  CentralBeneficio, 
  ReceptionBatch, 
  MainTab 
} from './types';
import { Navbar } from './components/layout/Navbar';
import { AssociationStats } from './components/layout/AssociationStats';
import { ProducerListView } from './components/producers/ProducerListView';
import { FarmListView } from './components/farms/FarmListView';
import { CentralListView } from './components/centrales/CentralListView';
import { ReceptionListView } from './components/reception/ReceptionListView';
import { NewReceptionModal } from './components/reception/NewReceptionModal';
import { GeoMapModal } from './components/map/GeoMapModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthGate } from './components/auth/AuthGate';
import { SessionLockModal } from './components/auth/SessionLockModal';
import { TwoFactorSetupModal } from './components/auth/TwoFactorSetupModal';
import { CheckCircle2, AlertCircle, ShieldCheck, QrCode, Factory, Building2 } from 'lucide-react';

const AppDashboard: React.FC = () => {
  const { user, isAuthenticated, isLocked } = useAuth();

  // Core Data Collections
  const [associations, setAssociations] = useState<Association[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [centrales, setCentrales] = useState<CentralBeneficio[]>([]);
  const [receptions, setReceptions] = useState<ReceptionBatch[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // App Navigation & Selection State
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('asoc_1');
  const [activeTab, setActiveTab] = useState<MainTab>('productores');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Interactive Overlays
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState<boolean>(false);
  const [preselectedProducer, setPreselectedProducer] = useState<Producer | null>(null);
  const [preselectedFarm, setPreselectedFarm] = useState<Farm | null>(null);
  const [preselectedCentral, setPreselectedCentral] = useState<CentralBeneficio | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Synchronize user association once authenticated
  useEffect(() => {
    if (user && (user as any).associationId) {
      setSelectedAssociationId((user as any).associationId);
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    const unsubAssoc = subscribeToAssociations((data) => setAssociations(data), setIsOnline);
    const unsubProd = subscribeToProducers((data) => setProducers(data), setIsOnline);
    const unsubFarms = subscribeToFarms((data) => setFarms(data), setIsOnline);
    const unsubCent = subscribeToCentrales((data) => setCentrales(data), setIsOnline);
    const unsubRec = subscribeToReceptions((data) => setReceptions(data), setIsOnline);

    return () => {
      unsubAssoc();
      unsubProd();
      unsubFarms();
      unsubCent();
      unsubRec();
    };
  }, []);

  // Set default association once loaded if needed
  useEffect(() => {
    if (associations.length > 0 && selectedAssociationId !== 'all') {
      const exists = associations.some((a) => a.id === selectedAssociationId);
      if (!exists) {
        setSelectedAssociationId(associations[0].id);
      }
    }
  }, [associations, selectedAssociationId]);

  const currentAssociation = useMemo(() => {
    return associations.find((a) => a.id === selectedAssociationId);
  }, [associations, selectedAssociationId]);

  const isAllSelected = selectedAssociationId === 'all';

  // Producers filtered by Association
  const associationProducers = useMemo(() => {
    if (isAllSelected) return producers;
    return producers.filter((p) => {
      if (p.associationId === selectedAssociationId) return true;
      if (currentAssociation && p.associationName && p.associationName.toLowerCase().includes(currentAssociation.name.toLowerCase())) return true;
      if (currentAssociation && p.associationCode && currentAssociation.code && p.associationCode === currentAssociation.code) return true;
      return false;
    });
  }, [producers, selectedAssociationId, isAllSelected, currentAssociation]);

  // Set of producer IDs in the active association for farm matching
  const assocProducerIds = useMemo(() => {
    return new Set(associationProducers.map((p) => p.id));
  }, [associationProducers]);

  // Farms filtered by Association (either directly linked or via its producers)
  const associationFarms = useMemo(() => {
    if (isAllSelected) return farms;
    return farms.filter((f) => {
      if (f.associationId === selectedAssociationId) return true;
      if (f.producerId && assocProducerIds.has(f.producerId)) return true;
      if (currentAssociation && f.associationName && f.associationName.toLowerCase().includes(currentAssociation.name.toLowerCase())) return true;
      if (currentAssociation && f.department === currentAssociation.department && f.municipality === currentAssociation.municipality) return true;
      return false;
    });
  }, [farms, selectedAssociationId, isAllSelected, assocProducerIds, currentAssociation]);

  // Centrales filtered by Association
  const associationCentrales = useMemo(() => {
    if (isAllSelected) return centrales;
    return centrales.filter((c) => {
      if (c.associationId === selectedAssociationId) return true;
      if (currentAssociation && c.associationName && c.associationName.toLowerCase().includes(currentAssociation.name.toLowerCase())) return true;
      if (currentAssociation && c.department === currentAssociation.department) return true;
      return false;
    });
  }, [centrales, selectedAssociationId, isAllSelected, currentAssociation]);

  // Receptions filtered by Association
  const associationReceptions = useMemo(() => {
    if (isAllSelected) return receptions;
    return receptions.filter((r) => {
      if (r.associationId === selectedAssociationId) return true;
      if (assocProducerIds.has(r.producerId)) return true;
      return false;
    });
  }, [receptions, selectedAssociationId, isAllSelected, assocProducerIds]);

  // Apply search query across tabs
  const query = searchQuery.trim().toLowerCase();

  const searchedProducers = useMemo(() => {
    if (!query) return associationProducers;
    return associationProducers.filter((p) => 
      p.producerName.toLowerCase().includes(query) ||
      p.documentId.toLowerCase().includes(query) ||
      (p.veredaOrLocation && p.veredaOrLocation.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query))
    );
  }, [associationProducers, query]);

  const searchedFarms = useMemo(() => {
    if (!query) return associationFarms;
    return associationFarms.filter((f) => 
      f.farmName.toLowerCase().includes(query) ||
      (f.producerName && f.producerName.toLowerCase().includes(query)) ||
      (f.municipality && f.municipality.toLowerCase().includes(query)) ||
      (f.vereda && f.vereda.toLowerCase().includes(query)) ||
      (f.cadastralCode && f.cadastralCode.toLowerCase().includes(query))
    );
  }, [associationFarms, query]);

  const searchedCentrales = useMemo(() => {
    if (!query) return associationCentrales;
    return associationCentrales.filter((c) => 
      (c.centralName && c.centralName.toLowerCase().includes(query)) ||
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.code && c.code.toLowerCase().includes(query)) ||
      (c.municipality && c.municipality.toLowerCase().includes(query)) ||
      (c.department && c.department.toLowerCase().includes(query))
    );
  }, [associationCentrales, query]);

  const searchedReceptions = useMemo(() => {
    if (!query) return associationReceptions;
    return associationReceptions.filter((r) => 
      r.batchCode.toLowerCase().includes(query) ||
      r.producerName.toLowerCase().includes(query) ||
      r.farmName.toLowerCase().includes(query) ||
      r.centralName.toLowerCase().includes(query)
    );
  }, [associationReceptions, query]);

  // Handlers for starting reception with preselected context
  const handleStartReceptionProducer = (prod: Producer) => {
    setPreselectedProducer(prod);
    setPreselectedFarm(null);
    setPreselectedCentral(null);
    setIsReceptionModalOpen(true);
  };

  const handleStartReceptionFarm = (farm: Farm) => {
    setPreselectedFarm(farm);
    const prod = producers.find((p) => p.id === farm.producerId);
    setPreselectedProducer(prod || null);
    setPreselectedCentral(null);
    setIsReceptionModalOpen(true);
  };

  const handleStartReceptionCentral = (central: CentralBeneficio) => {
    setPreselectedCentral(central);
    setPreselectedProducer(null);
    setPreselectedFarm(null);
    setIsReceptionModalOpen(true);
  };

  const handleSaveReception = async (batch: ReceptionBatch) => {
    await saveReceptionToFirestore(batch);
    setReceptions((prev) => [batch, ...prev.filter((r) => r.id !== batch.id)]);
    showToast(`✓ Lote ${batch.batchCode} registrado exitosamente en ${batch.centralName}`);
  };

  // If user is not authorized, ALWAYS display the Auth Gate!
  if (!user || (!isAuthenticated && !isLocked)) {
    return <AuthGate />;
  }

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navigation */}
      <Navbar
        associations={associations}
        selectedAssociationId={selectedAssociationId}
        onSelectAssociation={(id) => setSelectedAssociationId(id)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        isOnline={isOnline}
        onOpenNewReception={() => {
          setPreselectedProducer(null);
          setPreselectedFarm(null);
          setPreselectedCentral(null);
          setIsReceptionModalOpen(true);
        }}
        onOpenMap={() => setIsMapModalOpen(true)}
        producersCount={associationProducers.length}
        farmsCount={associationFarms.length}
        centralesCount={associationCentrales.length}
        receptionsCount={associationReceptions.length}
      />

      {/* Main Page Container */}
      <div className="app-main">
      <main className="app-content flex-1 w-full">
        
        {/* Operator Security & Role Verification Banner */}
        {user && (
          <div className="app-security-banner bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-amber-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center text-white ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Operador Autorizado: <span className="text-emerald-300">{user.name}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Rol: Central de Beneficio
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden md:inline-flex">
                    Google Authenticator 2FA Activo 🛡️
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Rol: <strong className="text-slate-200">{user.role}</strong></span>
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span>Correo: <span className="font-mono-num font-bold text-emerald-400">{user.email}</span></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTwoFactorModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Ver código QR y clave secreta de Google Authenticator"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Credencial 2FA / QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Association Overview Banner & KPIs */}
        <AssociationStats
          association={currentAssociation}
          isAllSelected={isAllSelected}
          producers={associationProducers}
          farms={associationFarms}
          centrales={associationCentrales}
          onSelectTab={(t) => setActiveTab(t)}
        />

        {/* Dynamic Views based on active tab */}
        {activeTab === 'productores' && (
          <ProducerListView
            producers={searchedProducers}
            farms={associationFarms}
            selectedAssociationName={currentAssociation?.name}
            onGoToFarm={(farmId) => {
              setActiveTab('fincas');
              const f = associationFarms.find((item) => item.id === farmId);
              if (f) setSearchQuery(f.farmName);
            }}
            onStartReception={handleStartReceptionProducer}
          />
        )}

        {activeTab === 'fincas' && (
          <FarmListView
            farms={searchedFarms}
            selectedAssociationName={currentAssociation?.name}
            onStartReception={handleStartReceptionFarm}
          />
        )}

        {activeTab === 'centrales' && (
          <CentralListView
            centrales={searchedCentrales}
            selectedAssociationName={currentAssociation?.name}
            onStartReception={handleStartReceptionCentral}
          />
        )}

        {activeTab === 'recepciones' && (
          <ReceptionListView
            receptions={searchedReceptions}
            onOpenNewReception={() => {
              setPreselectedProducer(null);
              setPreselectedFarm(null);
              setPreselectedCentral(null);
              setIsReceptionModalOpen(true);
            }}
            selectedAssociationName={currentAssociation?.name}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 bg-slate-950/80 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Agronomatrix · Portal Técnico de la Central de Beneficio</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Trazabilidad de Cacao Fino de Aroma · Colombia</span>
          </p>
        </div>
      </footer>
      </div>

      {/* New Reception Modal */}
      <NewReceptionModal
        isOpen={isReceptionModalOpen}
        onClose={() => setIsReceptionModalOpen(false)}
        onSaveReception={handleSaveReception}
        associations={associations}
        producers={associationProducers}
        farms={associationFarms}
        centrales={associationCentrales}
        preselectedProducer={preselectedProducer}
        preselectedFarm={preselectedFarm}
        preselectedCentral={preselectedCentral}
        currentAssociationId={selectedAssociationId}
      />

      {/* Geographic Map Modal */}
      <GeoMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        association={currentAssociation}
        farms={associationFarms}
        centrales={associationCentrales}
      />

      {/* Two-Factor Authenticator Setup Modal */}
      {user && (
        <TwoFactorSetupModal
          isOpen={isTwoFactorModalOpen}
          onClose={() => setIsTwoFactorModalOpen(false)}
          user={user}
        />
      )}

      {/* Session Lock Screen */}
      <SessionLockModal />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp">
          <div className="bg-emerald-900/90 text-white border border-emerald-400/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppDashboard />
    </AuthProvider>
  );
};

export default App;
