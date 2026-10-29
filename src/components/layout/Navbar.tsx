import React from 'react';
import { Building2, Factory, Users, Trees, Search, Scale, Map, PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { Association, MainTab } from '../../types';
import { UserMenu } from '../auth/UserMenu';
import logoUrl from '../../Logo Agronomatrix .png';

interface NavbarProps {
  associations: Association[]; selectedAssociationId: string; onSelectAssociation: (id: string) => void;
  activeTab: MainTab; onSelectTab: (tab: MainTab) => void; searchQuery: string; onSearchChange: (query: string) => void;
  isOnline: boolean; onOpenNewReception: () => void; onOpenMap: () => void;
  producersCount: number; farmsCount: number; centralesCount: number; receptionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ associations, selectedAssociationId, onSelectAssociation, activeTab, onSelectTab, searchQuery, onSearchChange, isOnline, onOpenNewReception, onOpenMap, producersCount, farmsCount, centralesCount, receptionsCount }) => {
  const currentAssoc = associations.find(a => a.id === selectedAssociationId);
  const navItems = [
    { id: 'productores' as MainTab, label: 'Productores', count: producersCount, Icon: Users },
    { id: 'fincas' as MainTab, label: 'Fincas y predios', count: farmsCount, Icon: Trees },
    { id: 'centrales' as MainTab, label: 'Centrales', count: centralesCount, Icon: Factory },
    { id: 'recepciones' as MainTab, label: 'Lotes y recepción', count: receptionsCount, Icon: Scale },
  ];
  const associationSelect = <select aria-label="Asociación seleccionada" value={selectedAssociationId} onChange={e => onSelectAssociation(e.target.value)}><option value="all">Todas las asociaciones ({associations.length})</option>{associations.map(a => <option key={a.id} value={a.id}>{a.name} ({a.department})</option>)}</select>;

  return <>
    <aside className="portal-sidebar">
      <div className="sidebar-brand"><img src={logoUrl} alt="" /><div><strong>AGRONOMATRIX</strong><span>Portal Técnico</span></div></div>
      <div className="sidebar-association"><label htmlFor="sidebar-association-select">Asociación activa</label><select id="sidebar-association-select" value={selectedAssociationId} onChange={e => onSelectAssociation(e.target.value)}><option value="all">Todas las asociaciones ({associations.length})</option>{associations.map(a => <option key={a.id} value={a.id}>{a.name} ({a.department})</option>)}</select></div>
      <nav className="sidebar-nav" aria-label="Módulos del portal">{navItems.map(({ id, label, count, Icon }) => <button key={id} type="button" onClick={() => onSelectTab(id)} className={activeTab === id ? 'active' : ''} aria-current={activeTab === id ? 'page' : undefined}><Icon size={18} /><span>{label}</span><span className="nav-count">{count}</span></button>)}</nav>
      <div className="sidebar-actions"><button type="button" className="primary" onClick={onOpenNewReception}><PlusCircle size={16} /> Nueva recepción</button><button type="button" onClick={onOpenMap}><Map size={16} /> Mapa de fincas</button></div>
      <div className="sidebar-status"><span className="status-dot" style={!isOnline ? { background: '#D8B28F' } : undefined} />{isOnline ? 'Conectado · Firestore' : 'Sin conexión · Caché local'}</div>
    </aside>
    <header className="portal-header">
      <div><div className="portal-header-title">{navItems.find(item => item.id === activeTab)?.label}</div><div className="portal-header-context"><Building2 size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />{currentAssoc?.name || (selectedAssociationId === 'all' ? 'Todas las asociaciones' : 'Cargando asociación')}</div></div>
      <div className="portal-header-tools"><div className="mobile-association">{associationSelect}</div><label className="portal-search"><Search size={15} /><input type="search" value={searchQuery} onChange={e => onSearchChange(e.target.value)} placeholder="Buscar productor, finca o central…" /></label><UserMenu /></div>
    </header>
  </>;
};
