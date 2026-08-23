import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Property, 
  PropertyStatus, 
  PropertyFilterState, 
  Lease, 
  LeasePayment, 
  MaintenanceRequest, 
  MaintenanceStatus,
  LeaseDocument, 
  ChatMessage, 
  LandlordStats,
  MapTheme,
  EnergyProvider,
  EnergyConnection,
  EnergyAccount,
  InboxDocument
} from '../types';
import { propertyService } from '../services/propertyService';
import { chatService } from '../services/chatService';
import { energyService } from '../services/energyService';
import { energyOcrService, ParsedBillResult } from '../services/energyOcrService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  properties: Property[];
  filteredProperties: Property[];
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (prop: Property | null) => void;
  filterState: PropertyFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<PropertyFilterState>>;
  resetFilters: () => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
  isWizardModalOpen: boolean;
  setIsWizardModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isRoleOnboardingOpen: boolean;
  setIsRoleOnboardingOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  currentUser: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
  } | null;
  logout: () => Promise<void>;
  
  // Map Visual Modes & Geolocation & Theme
  mapVisualMode: 'NORMAL' | 'HEATMAP' | 'BEAMS_3D';
  setMapVisualMode: (mode: 'NORMAL' | 'HEATMAP' | 'BEAMS_3D') => void;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  isLocating: boolean;
  requestUserLocation: () => void;
  searchTarget: { lat: number; lng: number; name: string } | null;
  setSearchTarget: (target: { lat: number; lng: number; name: string } | null) => void;
  searchAddress: (query: string) => Promise<boolean>;
  
  // Lease & Tenant Hub
  activeLease: Lease;
  payments: LeasePayment[];
  recordPayment: (paymentId: string, method: string) => void;
  maintenanceRequests: MaintenanceRequest[];
  createMaintenanceRequest: (req: { title: string; description: string; category: any; priority: any; photos: string[] }) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => void;
  documents: LeaseDocument[];
  addDocument: (doc: { fileName: string; fileSize: string; documentType: any }) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, category?: any) => void;
  
  // Landlord Actions
  landlordStats: LandlordStats;
  addProperty: (newProp: Omit<Property, 'id' | 'createdAt' | 'viewsCount' | 'favoritesCount' | 'contactCount'>) => void;
  updatePropertyStatus: (id: string, newStatus: PropertyStatus) => void;
  editProperty: (id: string, updatedData: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  editingProperty: Property | null;
  setEditingProperty: (prop: Property | null) => void;

  // AutoBills — Gestão de Energia & Faturas Inteligentes
  energyConnections: EnergyConnection[];
  energyAccounts: EnergyAccount[];
  inboxDocuments: InboxDocument[];
  isEnergyConnectionModalOpen: boolean;
  setIsEnergyConnectionModalOpen: (open: boolean) => void;
  isEnergyInboxModalOpen: boolean;
  setIsEnergyInboxModalOpen: (open: boolean) => void;
  selectedEnergyPropertyId: string | null;
  setSelectedEnergyPropertyId: (propertyId: string | null) => void;
  addEnergyConnection: (connection: Omit<EnergyConnection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EnergyConnection>;
  updateEnergyConnection: (id: string, data: Partial<EnergyConnection>) => Promise<void>;
  deleteEnergyConnection: (id: string) => Promise<void>;
  processEnergyBill: (file: File, source?: 'manual_upload' | 'email' | 'whatsapp', onProgress?: (status: string, percent: number) => void) => Promise<{ success: boolean; account?: EnergyAccount; error?: string; isDuplicate?: boolean; parsedResult?: ParsedBillResult }>;
  confirmEnergyAccount: (account: EnergyAccount) => Promise<void>;
  deleteEnergyAccount: (id: string) => Promise<void>;
  discardInboxDocument: (idOrHash: string) => Promise<void>;
  clearEnergyData: () => Promise<void>;
}

const DEFAULT_ACTIVE_LEASE: Lease = {
  id: 'lease-active-01',
  propertyId: 'prop-1',
  propertyTitle: 'Imóvel em Gestão',
  propertyAddress: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  propertyType: 'APARTAMENTO',
  landlordId: 'landlord-1',
  landlordName: 'Locador LOCASH',
  landlordPhone: '(11) 98765-4321',
  tenantId: 'tenant-current',
  tenantName: 'Inquilino LOCASH',
  tenantEmail: 'inquilino@email.com',
  tenantPhone: '(11) 99123-4567',
  status: 'ACTIVE',
  startDate: '2026-08-01',
  endDate: '2028-07-31',
  rentAmount: 3500,
  dueDay: 5,
  depositAmount: 10500,
  adjustmentIndex: 'IPCA',
  nextAdjustmentDate: '2027-08-01',
  createdAt: '2026-08-01T12:00:00Z'
};

const DEFAULT_FILTERS: PropertyFilterState = {
  search: '',
  propertyType: 'TODOS',
  status: 'TODOS',
  minPrice: 0,
  maxPrice: 50000,
  bedrooms: 'ANY',
  bathrooms: 'ANY',
  parkingSpaces: 'ANY',
  furnished: null,
  petsAllowed: null,
  sortBy: 'RECENTES'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('TENANT');
  const [activeView, setActiveView] = useState<string>('MAPA');
  // Pure Cloud State (Loaded directly from Supabase Cloud)
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterState, setFilterState] = useState<PropertyFilterState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRoleOnboardingOpen, setIsRoleOnboardingOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [mapVisualMode, setMapVisualMode] = useState<'NORMAL' | 'HEATMAP' | 'BEAMS_3D'>('BEAMS_3D');
  const [mapTheme, setMapThemeState] = useState<MapTheme>(() => {
    const saved = localStorage.getItem('locash_map_theme');
    return (saved as MapTheme) || 'CYBER_DARK';
  });

  // AutoBills — Gestão de Energia & Faturas Inteligentes
  const [energyConnections, setEnergyConnections] = useState<EnergyConnection[]>([]);
  const [energyAccounts, setEnergyAccounts] = useState<EnergyAccount[]>([]);
  const [inboxDocuments, setInboxDocuments] = useState<InboxDocument[]>([]);
  const [isEnergyConnectionModalOpen, setIsEnergyConnectionModalOpen] = useState<boolean>(false);
  const [isEnergyInboxModalOpen, setIsEnergyInboxModalOpen] = useState<boolean>(false);
  const [selectedEnergyPropertyId, setSelectedEnergyPropertyId] = useState<string | null>(null);

  const setMapTheme = (theme: MapTheme) => {
    setMapThemeState(theme);
    localStorage.setItem('locash_map_theme', theme);
  };
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchTarget, setSearchTarget] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
  } | null>(null);

  // Sync Supabase Auth State (Google OAuth, Email/Phone sessions, Profiles)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userMeta = session.user.user_metadata || {};
        const role = (userMeta.role as UserRole) || userRole;
        
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || '',
          name: userMeta.full_name || userMeta.name || session.user.email?.split('@')[0] || 'Usuário',
          avatarUrl: userMeta.avatar_url || userMeta.picture,
          role
        });
        setUserRole(role);

        // Check if first-time user (Google or Email/Phone) needs to pick their role with welcome onboarding
        if (!userMeta.role_confirmed) {
          setIsRoleOnboardingOpen(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userMeta = session.user.user_metadata || {};
        const role = (userMeta.role as UserRole) || userRole;
        const name = userMeta.full_name || userMeta.name || session.user.email?.split('@')[0] || 'Usuário';
        const avatarUrl = userMeta.avatar_url || userMeta.picture;

        setCurrentUser({
          id: session.user.id,
          email: session.user.email || '',
          name,
          avatarUrl,
          role
        });
        setUserRole(role);

        // Check if first-time user (Google or Email/Phone) needs to pick their role with welcome onboarding
        if (!userMeta.role_confirmed) {
          setIsRoleOnboardingOpen(true);
        }

        // Sync with public.profiles table
        try {
          const profilePayload: any = {
            id: session.user.id,
            email: session.user.email,
            full_name: name,
            avatar_url: avatarUrl,
            role
          };
          if (userMeta.phone) {
            profilePayload.phone = userMeta.phone;
          }
          if (userMeta.role_confirmed) {
            profilePayload.role_confirmed = true;
          }
          await supabase.from('profiles').upsert(profilePayload);
        } catch (err) {
          console.warn('Sincronização de perfil:', err);
        }
      } else {
        setCurrentUser(null);
        setIsRoleOnboardingOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.warn('Erro ao deslogar:', e);
    }

    // Clear any cached auth tokens in localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    setCurrentUser(null);
    setUserRole('TENANT');
    setActiveView('MAPA');
    setIsAuthModalOpen(true);
  };

  // Load properties and chat from Supabase Cloud on startup + Live WebSockets Sync
  useEffect(() => {
    let isMounted = true;

    const loadCloudData = async () => {
      try {
        const cloudProps = await propertyService.getAll();
        if (isMounted && cloudProps && cloudProps.length > 0) {
          setProperties(cloudProps);
        }

        const cloudMsgs = await chatService.getMessages();
        if (isMounted && cloudMsgs && cloudMsgs.length > 0) {
          setChatMessages(cloudMsgs);
        }
      } catch (err) {
        console.warn('Carregando dados padrão:', err);
      }
    };

    loadCloudData();

    // Load AutoBills Data (Connections, Accounts & Inbox)
    energyService.getConnections().then(conns => {
      if (isMounted && conns) setEnergyConnections(conns);
    });
    energyService.getAccounts().then(accs => {
      if (isMounted && accs) setEnergyAccounts(accs);
    });
    energyService.getInboxDocuments().then(docs => {
      if (isMounted && docs) setInboxDocuments(docs);
    });

    // Subscribe to live property updates across all connected clients
    const unsubProperties = propertyService.subscribeToChanges(async () => {
      const refreshed = await propertyService.getAll();
      if (isMounted && refreshed && refreshed.length > 0) {
        setProperties(refreshed);
      }
    });

    // Subscribe to live chat messages
    const unsubChat = chatService.subscribeToChat((newMsg) => {
      if (isMounted) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    return () => {
      isMounted = false;
      unsubProperties();
      unsubChat();
    };
  }, []);

  // Request & Watch Real-Time User GPS Location immediately on startup
  const requestUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        localStorage.setItem('locash_user_gps', JSON.stringify(coords));
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS Alta Precisão demorou ou falhou, tentando modo balanceado:', err.message);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(coords);
            localStorage.setItem('locash_user_gps', JSON.stringify(coords));
            setIsLocating(false);
          },
          (err2) => {
            console.warn('Localização GPS não concedida:', err2.message);
            setIsLocating(false);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Auto-request location immediately when entering the app
  useEffect(() => {
    requestUserLocation();

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          localStorage.setItem('locash_user_gps', JSON.stringify(coords));
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Geocoding Search Address (Multi-Provider: Photon + Nominatim + Local DB)
  const searchAddress = async (query: string): Promise<boolean> => {
    if (!query.trim()) return false;
    const cleanQuery = query.trim().toLowerCase();

    // 1. Check local property/neighborhood match first
    const localMatch = properties.find(p => 
      p.neighborhood.toLowerCase().includes(cleanQuery) ||
      p.publicAddress.toLowerCase().includes(cleanQuery) ||
      p.title.toLowerCase().includes(cleanQuery) ||
      p.city.toLowerCase().includes(cleanQuery)
    );

    if (localMatch) {
      setSearchTarget({ 
        lat: localMatch.latitude, 
        lng: localMatch.longitude, 
        name: `${localMatch.publicAddress}, ${localMatch.neighborhood}` 
      });
      return true;
    }

    // 2. Primary Geocoder: Photon (Fast, no rate limit, supports lat/lon bias)
    try {
      const latLonBias = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lng}` : '';
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}${latLonBias}&limit=1`
      );
      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData.features && photonData.features.length > 0) {
          const feat = photonData.features[0];
          const [lng, lat] = feat.geometry.coordinates;
          const p = feat.properties;
          const name = p.name || p.street || p.city || query;
          const sub = [p.district, p.city, p.state].filter(Boolean).join(', ');
          setSearchTarget({ 
            lat, 
            lng, 
            name: sub ? `${name} - ${sub}` : name 
          });
          return true;
        }
      }
    } catch (e) {
      console.warn('Photon geocoding error:', e);
    }

    // 3. Fallback Geocoder: Nominatim
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          setSearchTarget({ 
            lat: parseFloat(item.lat), 
            lng: parseFloat(item.lon), 
            name: item.display_name 
          });
          return true;
        }
      }
    } catch (e) {
      console.error('Nominatim geocoding error:', e);
    }

    return false;
  };

  // Lease State
  const [activeLease] = useState<Lease>(DEFAULT_ACTIVE_LEASE);
  const [payments, setPayments] = useState<LeasePayment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('locash_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('locash_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('locash_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('locash_maint', JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

  useEffect(() => {
    localStorage.setItem('locash_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('locash_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
    );
  };

  const resetFilters = () => setFilterState(DEFAULT_FILTERS);

  // Filter properties
  const filteredProperties = properties.filter(prop => {
    if (filterState.search.trim()) {
      const q = filterState.search.toLowerCase();
      const match = 
        prop.title.toLowerCase().includes(q) ||
        prop.neighborhood.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.publicAddress.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterState.propertyType !== 'TODOS' && prop.propertyType !== filterState.propertyType) {
      return false;
    }

    if (filterState.status !== 'TODOS' && prop.status !== filterState.status) {
      return false;
    }

    if (prop.rentPrice < filterState.minPrice || prop.rentPrice > filterState.maxPrice) {
      return false;
    }

    if (filterState.bedrooms !== 'ANY' && prop.bedrooms < Number(filterState.bedrooms)) {
      return false;
    }

    if (filterState.bathrooms !== 'ANY' && prop.bathrooms < Number(filterState.bathrooms)) {
      return false;
    }

    if (filterState.parkingSpaces !== 'ANY' && prop.parkingSpaces < Number(filterState.parkingSpaces)) {
      return false;
    }

    if (filterState.furnished !== null && prop.furnished !== filterState.furnished) {
      return false;
    }

    if (filterState.petsAllowed !== null && prop.petsAllowed !== filterState.petsAllowed) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filterState.sortBy === 'MENOR_PRECO') return a.rentPrice - b.rentPrice;
    if (filterState.sortBy === 'MAIOR_PRECO') return b.rentPrice - a.rentPrice;
    if (filterState.sortBy === 'POPULARES') return b.viewsCount - a.viewsCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const recordPayment = (paymentId: string, method: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'PAGO',
          paymentMethod: method,
          paidAmount: p.amount,
          paidAt: new Date().toISOString()
        };
      }
      return p;
    }));

    // Add automatic system receipt message in chat
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      leaseId: activeLease.id,
      senderId: 'system',
      senderName: 'LOCASH Pay',
      senderRole: 'ADMIN',
      message: `💰 Pagamento do aluguel referente confirmado com sucesso via ${method}! Recibo gerado.`,
      timestamp: new Date().toISOString(),
      tabCategory: 'FINANCEIRO'
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const createMaintenanceRequest = (data: { title: string; description: string; category: any; priority: any; photos: string[] }) => {
    const newReq: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      leaseId: activeLease.id,
      propertyId: activeLease.propertyId,
      propertyTitle: activeLease.propertyTitle,
      tenantId: activeLease.tenantId,
      tenantName: activeLease.tenantName,
      landlordId: activeLease.landlordId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'ABERTA',
      photos: data.photos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMaintenanceRequests(prev => [newReq, ...prev]);

    // Send alert in chat
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      leaseId: activeLease.id,
      senderId: activeLease.tenantId,
      senderName: activeLease.tenantName,
      senderRole: 'TENANT',
      message: `🔧 Novo chamado de manutenção aberto: "${data.title}" (Prioridade: ${data.priority})`,
      timestamp: new Date().toISOString(),
      tabCategory: 'MANUTENÇÃO'
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    setMaintenanceRequests(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status,
          updatedAt: new Date().toISOString(),
          resolvedAt: status === 'RESOLVIDA' ? new Date().toISOString() : m.resolvedAt
        };
      }
      return m;
    }));
  };

  const addDocument = (doc: { fileName: string; fileSize: string; documentType: any }) => {
    const newDoc: LeaseDocument = {
      id: `doc-${Date.now()}`,
      leaseId: activeLease.id,
      uploadedBy: userRole === 'LANDLORD' ? activeLease.landlordId : activeLease.tenantId,
      uploadedByName: userRole === 'LANDLORD' ? activeLease.landlordName : activeLease.tenantName,
      documentType: doc.documentType,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileUrl: '#download-simulado',
      createdAt: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const sendChatMessage = (text: string, category: any = 'CONVERSA') => {
    if (!text.trim()) return;
    const isLandlord = userRole === 'LANDLORD';
    const senderName = currentUser?.name?.trim() || (isLandlord ? (activeLease.landlordName || 'Locador') : (activeLease.tenantName || 'Inquilino'));
    const senderId = currentUser?.id || (isLandlord ? activeLease.landlordId : activeLease.tenantId);
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      leaseId: activeLease.id,
      senderId,
      senderName,
      senderRole: isLandlord ? 'LANDLORD' : 'TENANT',
      message: text.trim(),
      timestamp: new Date().toISOString(),
      tabCategory: category
    };
    setChatMessages(prev => [...prev, newMsg]);
    chatService.sendMessage(newMsg).catch(err => console.warn('Erro ao salvar chat no Supabase:', err));
  };

  const addProperty = (newPropData: Omit<Property, 'id' | 'createdAt' | 'viewsCount' | 'favoritesCount' | 'contactCount'>) => {
    const newProp: Property = {
      ...newPropData,
      id: `prop-${Date.now()}`,
      viewsCount: 1,
      favoritesCount: 0,
      contactCount: 0,
      createdAt: new Date().toISOString()
    };
    setProperties(prev => [newProp, ...prev]);
    // Reset filter and fly 3D map camera directly to new property
    setFilterState(prev => ({ ...prev, search: '', propertyType: 'TODOS', status: 'TODOS' }));
    setSearchTarget({
      lat: newProp.latitude,
      lng: newProp.longitude,
      name: newProp.title
    });
    propertyService.create(newProp).catch(err => console.warn('Erro ao salvar imóvel no Supabase:', err));
  };

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const editProperty = (id: string, updatedData: Partial<Property>) => {
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          ...updatedData,
          pricePerSqm: updatedData.rentPrice && updatedData.area 
            ? Math.round(updatedData.rentPrice / updatedData.area) 
            : p.pricePerSqm
        };
        // Also update selected property if currently open
        if (selectedProperty?.id === id) {
          setSelectedProperty(updated);
        }
        return updated;
      }
      return p;
    }));
    propertyService.update(id, updatedData).catch(err => console.warn('Erro ao atualizar imóvel no Supabase:', err));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
    propertyService.delete(id).catch(err => console.warn('Erro ao deletar imóvel no Supabase:', err));
  };

  const updatePropertyStatus = (id: string, newStatus: PropertyStatus) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, status: newStatus } : null);
    }
    propertyService.update(id, { status: newStatus }).catch(err => console.warn('Erro ao atualizar status no Supabase:', err));
  };

  // Landlord stats dynamic calculation
  const landlordStats: LandlordStats = {
    totalProperties: properties.length,
    availableCount: properties.filter(p => p.status === 'DISPONÍVEL').length,
    rentedCount: properties.filter(p => p.status === 'ALUGADO').length,
    negotiatingCount: properties.filter(p => p.status === 'EM NEGOCIAÇÃO').length,
    reservedCount: properties.filter(p => p.status === 'RESERVADO').length,
    monthlyRevenue: properties
      .filter(p => p.status === 'ALUGADO')
      .reduce((acc, curr) => acc + curr.rentPrice, 0),
    pendingReceivables: payments
      .filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADO')
      .reduce((acc, curr) => acc + curr.amount, 0),
    openMaintenanceCount: maintenanceRequests.filter(m => m.status !== 'RESOLVIDA').length,
    totalLeadsCount: properties.reduce((acc, curr) => acc + curr.contactCount, 0),
    occupancyRate: properties.length > 0 
      ? Math.round((properties.filter(p => p.status === 'ALUGADO').length / properties.length) * 100) 
      : 0
  };

  // AutoBills — Handlers
  const addEnergyConnection = async (connectionData: Omit<EnergyConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnergyConnection> => {
    const newConn: EnergyConnection = {
      ...connectionData,
      id: `conn-${Date.now()}`,
      inboxEmailAddress: `energia+${connectionData.consumerUnit}@inbox.locash.app`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newConn, ...energyConnections];
    setEnergyConnections(updated);
    await energyService.saveConnections(updated);
    return newConn;
  };

  const updateEnergyConnection = async (id: string, data: Partial<EnergyConnection>) => {
    const updated = energyConnections.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c);
    setEnergyConnections(updated);
    await energyService.saveConnections(updated);
  };

  const deleteEnergyConnection = async (id: string) => {
    const updated = energyConnections.filter(c => c.id !== id);
    setEnergyConnections(updated);
    await energyService.saveConnections(updated);
  };

  const confirmEnergyAccount = async (account: EnergyAccount) => {
    // 1. Save or update energy account (ONLY the analyzed invoice, no fake historical records)
    const isExisting = energyAccounts.some(a => a.id === account.id || a.documentHash === account.documentHash);
    const updatedAccounts = isExisting
      ? energyAccounts.map(a => (a.id === account.id || a.documentHash === account.documentHash) ? { ...account, processingStatus: 'confirmed' as const, updatedAt: new Date().toISOString() } : a)
      : [{ ...account, processingStatus: 'confirmed' as const }, ...energyAccounts];
    
    setEnergyAccounts(updatedAccounts);
    await energyService.saveAccounts(updatedAccounts);

    // 2. Auto-bind UC to property if not registered yet
    if (account.consumerUnit && !energyConnections.some(c => c.consumerUnit === account.consumerUnit)) {
      const newConn: EnergyConnection = {
        id: `conn-${Date.now()}`,
        userId: currentUser?.id || 'landlord-1',
        propertyId: account.propertyId,
        propertyTitle: account.propertyTitle,
        providerId: 'prov-coelba',
        providerName: account.providerName || 'Neoenergia Coelba',
        consumerUnit: account.consumerUnit,
        holderName: account.holderName || 'Titular da UC',
        holderDocumentMasked: '***.***.***-**',
        emailEnabled: true,
        whatsappEnabled: true,
        automaticRegistration: true,
        inboxEmailAddress: `energia+${account.consumerUnit}@inbox.locash.app`,
        status: 'ACTIVE',
        lastReceivedAt: new Date().toISOString(),
        lastProcessedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedConns = [newConn, ...energyConnections];
      setEnergyConnections(updatedConns);
      await energyService.saveConnections(updatedConns);
    }

    // 3. Automatically register into existing Financial Transactions / Payments (PRD #22 & #23)
    const paymentId = `pay-energy-${account.id}`;
    if (!payments.some(p => p.id === paymentId)) {
      const newPayment: LeasePayment = {
        id: paymentId,
        leaseId: account.propertyId,
        tenantId: activeLease.tenantId,
        landlordId: currentUser?.id || 'landlord-1',
        referenceMonth: account.billingPeriod,
        dueDate: account.dueDate,
        amount: account.amountTotal,
        status: 'PENDENTE',
        paymentMethod: 'PIX / BOLETO ENERGIA',
        invoiceUrl: account.documentUrl || '#fatura-coelba'
      };
      setPayments(prev => [newPayment, ...prev]);
    }

    // 4. Remove from pending inbox documents
    setInboxDocuments(prev => prev.filter(d => d.documentHash !== account.documentHash));
  };

  const processEnergyBill = async (
    file: File,
    source: 'manual_upload' | 'email' | 'whatsapp' = 'manual_upload',
    onProgress?: (status: string, percent: number) => void
  ): Promise<{ success: boolean; account?: EnergyAccount; error?: string; isDuplicate?: boolean; parsedResult?: ParsedBillResult }> => {
    try {
      // A. Extract OCR & AI fields from Coelba invoice
      const knownUcs = energyConnections.map(c => ({
        consumerUnit: c.consumerUnit,
        propertyId: c.propertyId,
        propertyTitle: c.propertyTitle
      }));

      const parsed = await energyOcrService.processDocument(file, knownUcs, onProgress);

      // B. Check for Duplicity via documentHash or (UC + billingPeriod) (PRD #20 & #21)
      const duplicate = energyAccounts.find(a => 
        a.documentHash === parsed.documentHash || 
        (a.consumerUnit === parsed.consumerUnit && a.billingPeriod === parsed.billingPeriod)
      );

      if (duplicate) {
        return {
          success: false,
          isDuplicate: true,
          account: duplicate,
          error: `Esta fatura da UC ${parsed.consumerUnit} (${parsed.billingPeriod}) já está registrada no sistema.`
        };
      }

      // C. Match Property via UC (PRD #6 & #38)
      const matchedConnection = energyConnections.find(c => c.consumerUnit === parsed.consumerUnit);
      const matchedProperty = properties.find(p => p.id === matchedConnection?.propertyId) || properties[0];

      // Calculate historical variation
      const previousAccountsForProperty = energyAccounts.filter(a => a.consumerUnit === parsed.consumerUnit);
      const sixMonthAvgKwh = previousAccountsForProperty.length > 0
        ? Math.round(previousAccountsForProperty.reduce((acc, c) => acc + c.consumptionKwh, 0) / previousAccountsForProperty.length)
        : 219;
      const variationPercentage = previousAccountsForProperty.length > 0
        ? Number((((parsed.consumptionKwh - sixMonthAvgKwh) / sixMonthAvgKwh) * 100).toFixed(1))
        : 12.8;
      const isAnomaly = Math.abs(variationPercentage) >= 25; // PRD #29 (Alerta de aumento > 25%)

      const autoRegister = matchedConnection?.automaticRegistration && parsed.ocrConfidence >= 95;

      const newAccount: EnergyAccount = {
        id: `ea-${Date.now()}`,
        userId: currentUser?.id || 'landlord-1',
        propertyId: matchedProperty?.id || (properties[0]?.id || 'prop-1'),
        propertyTitle: matchedProperty?.title || 'Imóvel em Gestão',
        providerId: 'prov-coelba',
        providerName: parsed.providerName,
        connectionId: matchedConnection?.id,
        consumerUnit: parsed.consumerUnit,
        installationCode: parsed.installationCode,
        holderName: parsed.holderName,
        billingPeriod: parsed.billingPeriod,
        issueDate: parsed.issueDate,
        dueDate: parsed.dueDate,
        consumptionKwh: parsed.consumptionKwh,
        previousReading: parsed.previousReading,
        currentReading: parsed.currentReading,
        nextReadingDate: parsed.nextReadingDate,
        billingDays: parsed.billingDays,
        amountTotal: parsed.amountTotal,
        energyAmount: parsed.energyAmount,
        taxAmount: parsed.taxAmount,
        feeAmount: parsed.feeAmount,
        invoiceNumber: parsed.invoiceNumber,
        barcode: parsed.barcode,
        pixCode: parsed.pixCode,
        documentUrl: URL.createObjectURL(file),
        documentHash: parsed.documentHash,
        source,
        processingStatus: autoRegister ? 'confirmed' : 'pending_confirmation',
        ocrConfidence: parsed.ocrConfidence,
        historyComparison: {
          sixMonthAvgKwh,
          variationPercentage,
          isAnomaly
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (autoRegister) {
        await confirmEnergyAccount(newAccount);
      } else {
        // Add to Inbox
        const inboxDoc: InboxDocument = {
          id: `inbox-${Date.now()}`,
          userId: currentUser?.id || 'landlord-1',
          channel: source,
          sender: source === 'email' ? 'fatura@neoenergia.com' : source === 'whatsapp' ? 'Neoenergia Coelba (+55 71 3370-6350)' : 'Upload Manual',
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileSize: file.size,
          storagePath: 'documents/energy',
          documentHash: parsed.documentHash,
          status: 'pending_confirmation',
          extractedData: newAccount,
          createdAt: new Date().toISOString()
        };
        const updatedInbox = [inboxDoc, ...inboxDocuments];
        setInboxDocuments(updatedInbox);
        await energyService.saveInboxDocuments(updatedInbox);
      }

      return {
        success: true,
        account: newAccount,
        parsedResult: parsed
      };
    } catch (err: any) {
      console.error('Erro ao processar fatura de energia:', err);
      return {
        success: false,
        error: err.message || 'Falha ao processar e ler o documento da fatura.'
      };
    }
  };

  const deleteEnergyAccount = async (id: string) => {
    const updated = energyAccounts.filter(a => a.id !== id);
    setEnergyAccounts(updated);
    await energyService.saveAccounts(updated);
  };

  const discardInboxDocument = async (idOrHash: string) => {
    const updated = inboxDocuments.filter(d => d.id !== idOrHash && d.documentHash !== idOrHash);
    setInboxDocuments(updated);
    await energyService.saveInboxDocuments(updated);
  };

  const clearEnergyData = async () => {
    setEnergyConnections([]);
    setEnergyAccounts([]);
    setInboxDocuments([]);
    setPayments(prev => prev.filter(p => !p.id.startsWith('pay-energy-')));
    await energyService.clearAllData();
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        activeView,
        setActiveView,
        properties,
        filteredProperties,
        favorites,
        toggleFavorite,
        selectedProperty,
        setSelectedProperty,
        filterState,
        setFilterState,
        resetFilters,
        isFilterModalOpen,
        setIsFilterModalOpen,
        isWizardModalOpen,
        setIsWizardModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isRoleOnboardingOpen,
        setIsRoleOnboardingOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        currentUser,
        logout,
        mapVisualMode,
        setMapVisualMode,
        mapTheme,
        setMapTheme,
        userLocation,
        setUserLocation,
        isLocating,
        requestUserLocation,
        searchTarget,
        setSearchTarget,
        searchAddress,
        activeLease,
        payments,
        recordPayment,
        maintenanceRequests,
        createMaintenanceRequest,
        updateMaintenanceStatus,
        documents,
        addDocument,
        chatMessages,
        sendChatMessage,
        landlordStats,
        addProperty,
        updatePropertyStatus,
        editProperty,
        deleteProperty,
        editingProperty,
        setEditingProperty,
        energyConnections,
        energyAccounts,
        inboxDocuments,
        isEnergyConnectionModalOpen,
        setIsEnergyConnectionModalOpen,
        isEnergyInboxModalOpen,
        setIsEnergyInboxModalOpen,
        selectedEnergyPropertyId,
        setSelectedEnergyPropertyId,
        addEnergyConnection,
        updateEnergyConnection,
        deleteEnergyConnection,
        processEnergyBill,
        confirmEnergyAccount,
        deleteEnergyAccount,
        discardInboxDocument,
        clearEnergyData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
