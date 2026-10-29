import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToAssociations, 
  subscribeToProducers, 
  subscribeToFarms, 
  subscribeToCentrales, 
  subscribeToReceptions, 
  subscribeToClones,
  subscribeToProducerTemplates,
  subscribeToFarmTemplates,
  saveReceptionToFirestore,
  saveProducerToFirestore,
  deleteProducerFromFirestore,
  saveFarmToFirestore,
  deleteFarmFromFirestore
} from './lib/firebase';
import { 
  Association, 
  Producer, 
  Farm, 
  CentralBeneficio, 
  ReceptionBatch, 
  CacaoClone,
  ProducerTemplate,
  FarmTemplate,
  MainTab 
} from './types';
import { Navbar } from './components/layout/Navbar';
import { AssociationStats } from './components/layout/AssociationStats';
import { ProducerListView } from './components/producers/ProducerListView';
import { ProducerFormModal } from './components/producers/ProducerFormModal';
import { FarmListView } from './components/farms/FarmListView';
import { FarmFormModal } from './components/farms/FarmFormModal';
import { CloneListView } from './components/clones/CloneListView';
import { CentralListView } from './components/centrales/CentralListView';
import { ReceptionListView } from './components/reception/ReceptionListView';
import { NewReceptionModal } from './components/reception/NewReceptionModal';
import { GeoMapModal } from './components/map/GeoMapModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthGate } from './components/auth/AuthGate';
import { SessionLockModal } from './components/auth/SessionLockModal';
import { TwoFactorSetupModal } from './components/auth/TwoFactorSetupModal';
import { CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

const AppDashboard: React.FC = () => {
  const { user, isAuthenticated, isLocked } = useAuth();

  // Core Data Collections
  const [associations, setAssociations] = useState<Association[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [producerTemplates, setProducerTemplates] = useState<ProducerTemplate[]>([]);
  const [farmTemplates, setFarmTemplates] = useState<FarmTemplate[]>([]);
  const [clones, setClones] = useState<CacaoClone[]>([]);
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

  // Producer & Farm CRUD Modal State
  const [isProducerModalOpen, setIsProducerModalOpen] = useState<boolean>(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState<boolean>(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

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
    const unsubProdTemplates = subscribeToProducerTemplates((data) => setProducerTemplates(data));
    const unsubFarmTemplates = subscribeToFarmTemplates((data) => setFarmTemplates(data));
    const unsubClones = subscribeToClones((data) => setClones(data));
    const unsubCent = subscribeToCentrales((data) => setCentrales(data), setIsOnline);
    const unsubRec = subscribeToReceptions((data) => setReceptions(data), setIsOnline);

    return () => {
      unsubAssoc();
      unsubProd();
      unsubFarms();
      unsubProdTemplates();
      unsubFarmTemplates();
      unsubClones();
      unsubCent();
      unsubRec();
    };
  }, []);

  // Ensure an active association is selected
  useEffect(() => {
    if (associations.length > 0) {
      const exists = associations.some((a) => a.id === selectedAssociationId);
      if (!exists) {
        setSelectedAssociationId(associations[0].id);
      }
    }
  }, [associations, selectedAssociationId]);

  const currentAssociation = useMemo(() => {
    return associations.find((a) => a.id === selectedAssociationId) || associations[0];
  }, [associations, selectedAssociationId]);

  const activeAssociationId = currentAssociation?.id || selectedAssociationId;

  // Producers strictly associated with the selected Association
  const associationProducers = useMemo(() => {
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

  // Set of producer IDs in the active association for farm matching
  const assocProducerIds = useMemo(() => {
    return new Set(associationProducers.map((p) => p.id));
  }, [associationProducers]);

  // Farms strictly associated with the selected Association
  const associationFarms = useMemo(() => {
    if (!currentAssociation) return [];
    return farms.filter((f) => {
      if (f.associationId && f.associationId.trim() !== '') {
        return f.associationId === currentAssociation.id;
      }
      if (f.producerId && assocProducerIds.has(f.producerId)) {
        return true;
      }
      if (f.associationCode && currentAssociation.code) {
        return f.associationCode.trim().toUpperCase() === currentAssociation.code.trim().toUpperCase();
      }
      if (f.associationName && currentAssociation.name) {
        return f.associationName.trim().toLowerCase() === currentAssociation.name.trim().toLowerCase();
      }
      return false;
    });
  }, [farms, assocProducerIds, currentAssociation]);

  // Receptions strictly associated with the selected Association
  const associationReceptions = useMemo(() => {
    if (!currentAssociation) return [];
    return receptions.filter((r) => {
      if (r.associationId && r.associationId.trim() !== '') {
        return r.associationId === currentAssociation.id;
      }
      return assocProducerIds.has(r.producerId);
    });
  }, [receptions, currentAssociation, assocProducerIds]);

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

  // Clones are independent of the selected association
  const searchedClones = useMemo(() => {
    if (!query) return clones;
    return clones.filter((c) =>
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.origin.toLowerCase().includes(query)
    );
  }, [clones, query]);

  // Centrales de Beneficio are independent of the selected association
  const searchedCentrales = useMemo(() => {
    if (!query) return centrales;
    return centrales.filter((c) => 
      (c.centralName && c.centralName.toLowerCase().includes(query)) ||
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.code && c.code.toLowerCase().includes(query)) ||
      (c.municipality && c.municipality.toLowerCase().includes(query)) ||
      (c.department && c.department.toLowerCase().includes(query))
    );
  }, [centrales, query]);

  const searchedReceptions = useMemo(() => {
    if (!query) return associationReceptions;
    return associationReceptions.filter((r) => 
      r.batchCode.toLowerCase().includes(query) ||
      r.producerName.toLowerCase().includes(query) ||
      r.farmName.toLowerCase().includes(query) ||
      r.centralName.toLowerCase().includes(query)
    );
  }, [associationReceptions, query]);

  // Handlers for Producer CRUD
  const handleSaveProducer = async (producer: Producer) => {
    const isEdit = producers.some((p) => p.id === producer.id);
    await saveProducerToFirestore(producer);
    setProducers((prev) =>
      isEdit ? prev.map((p) => (p.id === producer.id ? producer : p)) : [producer, ...prev]
    );

    // If editing a producer and their association changed, keep their linked farms in sync
    if (isEdit && producer.associationId) {
      const linkedFarms = farms.filter(
        (f) => f.producerId === producer.id && f.associationId !== producer.associationId
      );
      for (const lf of linkedFarms) {
        const updatedFarm: Farm = {
          ...lf,
          associationId: producer.associationId,
          associationName: producer.associationName,
          associationCode: producer.associationCode,
          producerName: producer.producerName,
          producerDocument: producer.documentId
        };
        await saveFarmToFirestore(updatedFarm);
      }
      if (linkedFarms.length > 0) {
        setFarms((prev) =>
          prev.map((f) =>
            f.producerId === producer.id
              ? {
                  ...f,
                  associationId: producer.associationId,
                  associationName: producer.associationName,
                  associationCode: producer.associationCode,
                  producerName: producer.producerName,
                  producerDocument: producer.documentId
                }
              : f
          )
        );
      }
    }

    showToast(
      isEdit
        ? `✓ Productor ${producer.producerName} actualizado exitosamente`
        : `✓ Productor ${producer.producerName} adicionado a ${producer.associationName}`
    );
  };

  const handleDeleteProducer = async (producer: Producer) => {
    await deleteProducerFromFirestore(producer.id);
    setProducers((prev) => prev.filter((p) => p.id !== producer.id));
    showToast(`✓ Productor ${producer.producerName} eliminado`);
  };

  // Handlers for Farm CRUD
  const handleSaveFarm = async (farm: Farm) => {
    const isEdit = farms.some((f) => f.id === farm.id);
    await saveFarmToFirestore(farm);
    setFarms((prev) =>
      isEdit ? prev.map((f) => (f.id === farm.id ? farm : f)) : [farm, ...prev]
    );
    showToast(
      isEdit
        ? `✓ Finca ${farm.farmName} actualizada exitosamente`
        : `✓ Finca ${farm.farmName} adicionada a ${farm.associationName}`
    );
  };

  const handleDeleteFarm = async (farm: Farm) => {
    await deleteFarmFromFirestore(farm.id);
    setFarms((prev) => prev.filter((f) => f.id !== farm.id));
    showToast(`✓ Finca ${farm.farmName} eliminada`);
  };

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
    <div className="min-h-screen flex flex-col bg-[#f4f7f6] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Top Navigation with Hamburger Menu */}
      <Navbar
        associations={associations}
        selectedAssociationId={activeAssociationId}
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
        onOpenAddProducer={() => {
          setEditingProducer(null);
          setIsProducerModalOpen(true);
        }}
        onOpenAddFarm={() => {
          setEditingFarm(null);
          setIsFarmModalOpen(true);
        }}
        producersCount={associationProducers.length}
        farmsCount={associationFarms.length}
        clonesCount={clones.length}
        centralesCount={centrales.length}
        receptionsCount={associationReceptions.length}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Operator Security & Role Verification Banner */}
        {user && (
          <div className="bg-gradient-to-r from-[#06694b] via-[#05583f] to-[#033b2a] text-white border-2 border-slate-900 shadow-[5px_5px_0px_#0f172a] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#6ee7b7]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Operador Autorizado: <span className="text-[#6ee7b7]">{user.name}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/15 text-emerald-100 border border-white/25">
                    Rol: Central de Beneficio
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400/20 text-amber-200 border border-amber-300/40 hidden md:inline-flex">
                    Google Authenticator 2FA Activo 🛡️
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 flex items-center gap-2 mt-0.5">
                  <span>Rol: <strong className="text-white">{user.role}</strong></span>
                  <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
                  <span>Correo: <span className="font-mono-num font-bold text-[#6ee7b7]">{user.email}</span></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTwoFactorModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 border-2 border-slate-900 shadow-[2.5px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Ver código QR y clave secreta de Google Authenticator"
              >
                <QrCode className="w-3.5 h-3.5 text-[#047857]" />
                <span>Credencial 2FA / QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Association Overview Banner & KPIs */}
        <AssociationStats
          association={currentAssociation}
          isAllSelected={false}
          producers={associationProducers}
          farms={associationFarms}
          centrales={centrales}
          onSelectTab={(t) => setActiveTab(t)}
        />

        {/* Dynamic Views based on active tab */}
        {activeTab === 'productores' && (
          <ProducerListView
            producers={searchedProducers}
            farms={associationFarms}
            producerTemplates={producerTemplates}
            selectedAssociationName={currentAssociation?.name}
            onGoToFarm={(farmId) => {
              setActiveTab('fincas');
              const f = associationFarms.find((item) => item.id === farmId);
              if (f) setSearchQuery(f.farmName);
            }}
            onStartReception={handleStartReceptionProducer}
            onAddProducer={() => {
              setEditingProducer(null);
              setIsProducerModalOpen(true);
            }}
            onEditProducer={(prod) => {
              setEditingProducer(prod);
              setIsProducerModalOpen(true);
            }}
            onDeleteProducer={handleDeleteProducer}
          />
        )}

        {activeTab === 'fincas' && (
          <FarmListView
            farms={searchedFarms}
            farmTemplates={farmTemplates}
            selectedAssociationName={currentAssociation?.name}
            onStartReception={handleStartReceptionFarm}
            onAddFarm={() => {
              setEditingFarm(null);
              setIsFarmModalOpen(true);
            }}
            onEditFarm={(farm) => {
              setEditingFarm(farm);
              setIsFarmModalOpen(true);
            }}
            onDeleteFarm={handleDeleteFarm}
          />
        )}

        {activeTab === 'clones' && (
          <CloneListView
            clones={searchedClones}
            allFarms={farms}
          />
        )}

        {activeTab === 'centrales' && (
          <CentralListView
            centrales={searchedCentrales}
            selectedAssociationName={undefined}
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
      <footer className="border-t-2 border-slate-300 py-6 px-4 bg-white text-xs text-slate-600 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold">© {new Date().getFullYear()} Agronomatrix · Cacaoanalytica · Central de Beneficio</p>
          <p className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span>Trazabilidad de Cacao Fino de Aroma · Colombia</span>
          </p>
        </div>
      </footer>

      {/* Producer Add/Edit Modal */}
      <ProducerFormModal
        isOpen={isProducerModalOpen}
        onClose={() => {
          setIsProducerModalOpen(false);
          setEditingProducer(null);
        }}
        onSave={handleSaveProducer}
        initialProducer={editingProducer}
        associations={associations}
        producerTemplates={producerTemplates}
        selectedAssociationId={activeAssociationId}
      />

      {/* Farm Add/Edit Modal */}
      <FarmFormModal
        isOpen={isFarmModalOpen}
        onClose={() => {
          setIsFarmModalOpen(false);
          setEditingFarm(null);
        }}
        onSave={handleSaveFarm}
        initialFarm={editingFarm}
        associations={associations}
        producers={associationProducers}
        farmTemplates={farmTemplates}
        clones={clones}
        selectedAssociationId={activeAssociationId}
      />

      {/* New Reception Modal */}
      <NewReceptionModal
        isOpen={isReceptionModalOpen}
        onClose={() => setIsReceptionModalOpen(false)}
        onSaveReception={handleSaveReception}
        associations={associations}
        producers={associationProducers}
        farms={associationFarms}
        centrales={centrales}
        preselectedProducer={preselectedProducer}
        preselectedFarm={preselectedFarm}
        preselectedCentral={preselectedCentral}
        currentAssociationId={activeAssociationId}
      />

      {/* Geographic Map Modal */}
      <GeoMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        association={currentAssociation}
        farms={associationFarms}
        centrales={centrales}
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
          <div className="bg-[#047857] text-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#6ee7b7] shrink-0" />
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
