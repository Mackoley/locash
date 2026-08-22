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
  MapTheme
} from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_ACTIVE_LEASE, 
  INITIAL_PAYMENTS, 
  INITIAL_MAINTENANCE_REQUESTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_LANDLORD_STATS 
} from '../data/mockData';

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
  
  // Map Visual Modes & Geolocation & Theme
  mapVisualMode: 'NORMAL' | 'HEATMAP' | 'BEAMS_3D';
  setMapVisualMode: (mode: 'NORMAL' | 'HEATMAP' | 'BEAMS_3D') => void;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  userLocation: { lat: number; lng: number } | null;
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
}

const DEFAULT_FILTERS: PropertyFilterState = {
  search: '',
  propertyType: 'TODOS',
  status: 'TODOS',
  minPrice: 0,
  maxPrice: 25000,
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
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('locash_properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('locash_favorites');
    return saved ? JSON.parse(saved) : ['prop-1', 'prop-3'];
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterState, setFilterState] = useState<PropertyFilterState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [mapVisualMode, setMapVisualMode] = useState<'NORMAL' | 'HEATMAP' | 'BEAMS_3D'>('NORMAL');
  const [mapTheme, setMapThemeState] = useState<MapTheme>(() => {
    const saved = localStorage.getItem('locash_map_theme');
    return (saved as MapTheme) || 'CYBER_DARK';
  });

  const setMapTheme = (theme: MapTheme) => {
    setMapThemeState(theme);
    localStorage.setItem('locash_map_theme', theme);
  };
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('locash_user_gps');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchTarget, setSearchTarget] = useState<{ lat: number; lng: number; name: string } | null>(null);

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
        console.warn('Localização GPS não concedida:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

  // Search Address with OpenStreetMap Nominatim Geocoding API
  const searchAddress = async (query: string): Promise<boolean> => {
    if (!query.trim()) return false;
    try {
      const encoded = encodeURIComponent(query.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=1`, {
        headers: { 'Accept-Language': 'pt-BR' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setSearchTarget({ lat, lng, name: item.display_name });
        return true;
      } else {
        // Fallback search without country filter
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.length > 0) {
          const item = fallbackData[0];
          setSearchTarget({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), name: item.display_name });
          return true;
        }
      }
    } catch (e) {
      console.error('Erro na pesquisa de endereço:', e);
    }
    return false;
  };

  // Lease State
  const [activeLease] = useState<Lease>(INITIAL_ACTIVE_LEASE);
  const [payments, setPayments] = useState<LeasePayment[]>(() => {
    const saved = localStorage.getItem('locash_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem('locash_maint');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_REQUESTS;
  });
  const [documents, setDocuments] = useState<LeaseDocument[]>(() => {
    const saved = localStorage.getItem('locash_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('locash_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

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
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      leaseId: activeLease.id,
      senderId: isLandlord ? activeLease.landlordId : activeLease.tenantId,
      senderName: isLandlord ? activeLease.landlordName : activeLease.tenantName,
      senderRole: isLandlord ? 'LANDLORD' : 'TENANT',
      message: text,
      timestamp: new Date().toISOString(),
      tabCategory: category
    };
    setChatMessages(prev => [...prev, newMsg]);
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
    // Reset search filter so the newly added property is immediately visible on map & list
    setFilterState(prev => ({ ...prev, search: '', propertyType: 'TODOS', status: 'TODOS' }));
    setSelectedProperty(newProp);
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
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
  };

  const updatePropertyStatus = (id: string, newStatus: PropertyStatus) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, status: newStatus } : null);
    }
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
        mapVisualMode,
        setMapVisualMode,
        mapTheme,
        setMapTheme,
        userLocation,
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
        setEditingProperty
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
