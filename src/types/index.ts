export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export type MapTheme = 'CYBER_DARK' | 'CYBER_LIGHT' | 'SATELLITE';

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

// ==============================================================================
// LOCASH AutoBills — Tipos e Modelos de Dados de Energia e Faturas
// ==============================================================================

export interface EnergyProvider {
  id: string;
  name: string; // 'Neoenergia Coelba'
  code: string; // 'COELBA'
  state: string; // 'BA'
  active: boolean;
}

export type EnergyConnectionStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'ERROR';

export interface EnergyConnection {
  id: string;
  userId: string;
  propertyId: string;
  propertyTitle: string;
  providerId: string;
  providerName: string;
  consumerUnit: string; // Unidade Consumidora (UC / Conta Contrato)
  holderName: string; // Nome do Titular da Conta
  holderDocumentMasked?: string; // CPF/CNPJ Mascarado (ex: ***.456.789-**)
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  automaticRegistration: boolean; // Registro automático de despesa se confiança >= 95%
  inboxEmailAddress?: string; // Endereço de e-mail exclusivo (ex: energia+uc123@inbox.locash.app)
  status: EnergyConnectionStatus;
  lastReceivedAt?: string;
  lastProcessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type EnergyProcessingStatus = 
  | 'received'
  | 'processing'
  | 'processed'
  | 'pending_confirmation'
  | 'confirmed'
  | 'duplicate'
  | 'invalid'
  | 'error';

export type EnergyDocumentSource = 'email' | 'whatsapp' | 'manual_upload';

export interface EnergyAccount {
  id: string;
  userId: string;
  propertyId: string;
  propertyTitle: string;
  providerId: string;
  providerName: string;
  connectionId?: string;
  consumerUnit: string; // Unidade Consumidora (UC)
  holderName?: string;
  billingPeriod: string; // 'Agosto/2026' ou '08/2026'
  issueDate?: string;
  dueDate: string; // '2026-09-10'
  consumptionKwh: number; // ex: 247 kWh
  previousReading?: number;
  currentReading?: number;
  nextReadingDate?: string;
  billingDays?: number;
  amountTotal: number; // R$ 218.43
  energyAmount?: number;
  taxAmount?: number; // ICMS, PIS, COFINS
  feeAmount?: number; // CIP / Iluminação Pública
  fineAmount?: number;
  interestAmount?: number;
  discountAmount?: number;
  invoiceNumber?: string;
  barcode?: string;
  pixCode?: string;
  documentUrl?: string;
  documentHash: string; // SHA-256 anti-duplicidade
  source: EnergyDocumentSource;
  processingStatus: EnergyProcessingStatus;
  ocrConfidence: number; // 0 a 100%
  editedManually?: boolean;
  historyComparison?: {
    sixMonthAvgKwh: number;
    variationPercentage: number; // ex: +12.8%
    isAnomaly: boolean; // true se variação > 25%
  };
  createdAt: string;
  updatedAt: string;
}

export interface InboxDocument {
  id: string;
  userId: string;
  channel: EnergyDocumentSource;
  sender: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  documentHash: string;
  status: EnergyProcessingStatus;
  extractedData?: Partial<EnergyAccount>;
  errorMessage?: string;
  createdAt: string;
}
