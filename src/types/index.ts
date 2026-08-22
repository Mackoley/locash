export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export type MapTheme = 'CYBER_DARK' | 'MIDNIGHT_BLUE' | 'MATRIX_EMERALD' | 'OLED_MONOCHROME';

export type PropertyType = 
  | 'CASA' 
  | 'APARTAMENTO' 
  | 'KITNET' 
  | 'SOBRADO' 
  | 'COMERCIAL' 
  | 'SÍTIO' 
  | 'CHÁCARA' 
  | 'OUTROS';

export type PropertyStatus = 
  | 'DISPONÍVEL' 
  | 'RESERVADO' 
  | 'EM NEGOCIAÇÃO' 
  | 'ALUGADO';

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  rentPrice: number;
  condoFee: number;
  propertyTax: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  area: number; // m²
  furnished: boolean;
  petsAllowed: boolean;
  latitude: number;
  longitude: number;
  publicAddress: string;
  privateAddress?: string;
  neighborhood: string;
  city: string;
  state: string;
  featured: boolean;
  verified: boolean;
  viewsCount: number;
  favoritesCount: number;
  contactCount: number;
  images: string[];
  demandScore: number; // 0 a 100 para heatmap de demanda
  pricePerSqm: number;
  createdAt: string;
}

export type LeaseStatus = 'ACTIVE' | 'PENDING' | 'EXPIRING' | 'TERMINATED' | 'CANCELLED';

export interface Lease {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyType: PropertyType;
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string;
  rentAmount: number;
  dueDay: number;
  depositAmount: number;
  adjustmentIndex: string; // ex: 'IPCA' ou 'IGP-M'
  nextAdjustmentDate: string;
  createdAt: string;
}

export type PaymentStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'PARCIAL' | 'CANCELADO';

export interface LeasePayment {
  id: string;
  leaseId: string;
  tenantId: string;
  landlordId: string;
  referenceMonth: string; // 'Agosto/2026'
  dueDate: string;
  amount: number;
  paidAmount?: number;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: string;
  invoiceUrl?: string;
}

export type MaintenanceCategory = 
  | 'ELÉTRICA' 
  | 'HIDRÁULICA' 
  | 'ESTRUTURA' 
  | 'PINTURA' 
  | 'PORTAS_JANELAS' 
  | 'INTERNET' 
  | 'SEGURANÇA' 
  | 'OUTROS';

export type MaintenancePriority = 'BAIXA' | 'MÉDIA' | 'ALTA' | 'URGENTE';

export type MaintenanceStatus = 
  | 'ABERTA' 
  | 'EM ANÁLISE' 
  | 'APROVADA' 
  | 'EM ANDAMENTO' 
  | 'RESOLVIDA';

export interface MaintenanceRequest {
  id: string;
  leaseId: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  photos: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  cost?: number;
  contractorName?: string;
}

export type DocumentType = 
  | 'CONTRATO' 
  | 'VISTORIA_ENTRADA' 
  | 'VISTORIA_SAIDA' 
  | 'COMPROVANTE' 
  | 'LAUDO' 
  | 'REGULAMENTO' 
  | 'OUTROS';

export interface LeaseDocument {
  id: string;
  leaseId: string;
  uploadedBy: string;
  uploadedByName: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  leaseId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  attachmentUrl?: string;
  tabCategory?: 'CONVERSA' | 'FINANCEIRO' | 'CONTRATO' | 'MANUTENÇÃO';
}

export interface PropertyFilterState {
  search: string;
  propertyType: PropertyType | 'TODOS';
  status: PropertyStatus | 'TODOS';
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'ANY';
  bathrooms: number | 'ANY';
  parkingSpaces: number | 'ANY';
  furnished: boolean | null;
  petsAllowed: boolean | null;
  sortBy: 'MENOR_PRECO' | 'MAIOR_PRECO' | 'RECENTES' | 'POPULARES';
}

export interface LandlordStats {
  totalProperties: number;
  availableCount: number;
  rentedCount: number;
  negotiatingCount: number;
  reservedCount: number;
  monthlyRevenue: number;
  pendingReceivables: number;
  openMaintenanceCount: number;
  totalLeadsCount: number;
  occupancyRate: number; // e.g. 78%
}
