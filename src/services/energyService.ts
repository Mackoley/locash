import { supabase, isSupabaseConfigured } from './supabase';
import { EnergyProvider, EnergyConnection, EnergyAccount, InboxDocument } from '../types';

export const DEFAULT_ENERGY_PROVIDERS: EnergyProvider[] = [
  {
    id: 'prov-coelba',
    name: 'Neoenergia Coelba',
    code: 'COELBA',
    state: 'BA',
    active: true
  }
];

export const INITIAL_MOCK_ENERGY_ACCOUNTS: EnergyAccount[] = [
  {
    id: 'ea-ago-2026',
    userId: 'landlord-1',
    propertyId: 'prop-1',
    propertyTitle: 'Studio Cyberpunk Jardins',
    providerId: 'prov-coelba',
    providerName: 'Neoenergia Coelba',
    consumerUnit: '7023819402',
    holderName: 'ROBERTO SILVA',
    billingPeriod: 'Agosto/2026',
    dueDate: '2026-09-10',
    consumptionKwh: 247,
    previousReading: 1420,
    currentReading: 1667,
    nextReadingDate: '2026-10-01',
    billingDays: 30,
    amountTotal: 218.43,
    energyAmount: 157.27,
    taxAmount: 45.87,
    feeAmount: 15.29,
    invoiceNumber: 'FAT-2026-08912',
    barcode: '84670000002-1 21843010901-4 01090110000-8 70238194020-2',
    pixCode: '00020126580014br.gov.bcb.pix0136coelba-fatura-ago-2026',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    documentHash: 'hash-sha256-coelba-ago-2026-7023819402',
    source: 'email',
    processingStatus: 'confirmed',
    ocrConfidence: 99,
    historyComparison: {
      sixMonthAvgKwh: 219,
      variationPercentage: 12.8,
      isAnomaly: false
    },
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-03T10:05:00Z'
  },
  {
    id: 'ea-jul-2026',
    userId: 'landlord-1',
    propertyId: 'prop-1',
    propertyTitle: 'Studio Cyberpunk Jardins',
    providerId: 'prov-coelba',
    providerName: 'Neoenergia Coelba',
    consumerUnit: '7023819402',
    holderName: 'ROBERTO SILVA',
    billingPeriod: 'Julho/2026',
    dueDate: '2026-08-10',
    consumptionKwh: 221,
    previousReading: 1199,
    currentReading: 1420,
    nextReadingDate: '2026-09-01',
    billingDays: 30,
    amountTotal: 197.20,
    energyAmount: 142.00,
    taxAmount: 41.40,
    feeAmount: 13.80,
    invoiceNumber: 'FAT-2026-07821',
    barcode: '84670000002-1 19720010901-4 01090110000-8 70238194020-2',
    pixCode: '00020126580014br.gov.bcb.pix0136coelba-fatura-jul-2026',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    documentHash: 'hash-sha256-coelba-jul-2026-7023819402',
    source: 'whatsapp',
    processingStatus: 'confirmed',
    ocrConfidence: 98,
    historyComparison: {
      sixMonthAvgKwh: 215,
      variationPercentage: 2.8,
      isAnomaly: false
    },
    createdAt: '2026-07-03T11:20:00Z',
    updatedAt: '2026-07-03T11:25:00Z'
  },
  {
    id: 'ea-jun-2026',
    userId: 'landlord-1',
    propertyId: 'prop-1',
    propertyTitle: 'Studio Cyberpunk Jardins',
    providerId: 'prov-coelba',
    providerName: 'Neoenergia Coelba',
    consumerUnit: '7023819402',
    holderName: 'ROBERTO SILVA',
    billingPeriod: 'Junho/2026',
    dueDate: '2026-07-10',
    consumptionKwh: 205,
    previousReading: 994,
    currentReading: 1199,
    nextReadingDate: '2026-08-01',
    billingDays: 30,
    amountTotal: 184.60,
    energyAmount: 132.90,
    taxAmount: 38.70,
    feeAmount: 13.00,
    invoiceNumber: 'FAT-2026-06714',
    barcode: '84670000002-1 18460010901-4 01090110000-8 70238194020-2',
    pixCode: '00020126580014br.gov.bcb.pix0136coelba-fatura-jun-2026',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    documentHash: 'hash-sha256-coelba-jun-2026-7023819402',
    source: 'email',
    processingStatus: 'confirmed',
    ocrConfidence: 99,
    historyComparison: {
      sixMonthAvgKwh: 210,
      variationPercentage: -2.4,
      isAnomaly: false
    },
    createdAt: '2026-06-03T09:15:00Z',
    updatedAt: '2026-06-03T09:20:00Z'
  },
  {
    id: 'ea-mai-2026',
    userId: 'landlord-1',
    propertyId: 'prop-1',
    propertyTitle: 'Studio Cyberpunk Jardins',
    providerId: 'prov-coelba',
    providerName: 'Neoenergia Coelba',
    consumerUnit: '7023819402',
    holderName: 'ROBERTO SILVA',
    billingPeriod: 'Maio/2026',
    dueDate: '2026-06-10',
    consumptionKwh: 198,
    previousReading: 796,
    currentReading: 994,
    nextReadingDate: '2026-07-01',
    billingDays: 30,
    amountTotal: 179.10,
    energyAmount: 128.95,
    taxAmount: 37.61,
    feeAmount: 12.54,
    invoiceNumber: 'FAT-2026-05602',
    barcode: '84670000002-1 17910010901-4 01090110000-8 70238194020-2',
    pixCode: '00020126580014br.gov.bcb.pix0136coelba-fatura-mai-2026',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    documentHash: 'hash-sha256-coelba-mai-2026-7023819402',
    source: 'email',
    processingStatus: 'confirmed',
    ocrConfidence: 99,
    historyComparison: {
      sixMonthAvgKwh: 205,
      variationPercentage: -3.4,
      isAnomaly: false
    },
    createdAt: '2026-05-03T10:00:00Z',
    updatedAt: '2026-05-03T10:05:00Z'
  }
];

export const energyService = {
  // Connections
  async getConnections(): Promise<EnergyConnection[]> {
    const saved = localStorage.getItem('locash_energy_connections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'conn-1',
        userId: 'landlord-1',
        propertyId: 'prop-1',
        propertyTitle: 'Studio Cyberpunk Jardins',
        providerId: 'prov-coelba',
        providerName: 'Neoenergia Coelba',
        consumerUnit: '7023819402',
        holderName: 'ROBERTO SILVA',
        holderDocumentMasked: '***.456.789-**',
        emailEnabled: true,
        whatsappEnabled: true,
        automaticRegistration: true,
        inboxEmailAddress: 'energia+7023819402@inbox.locash.app',
        status: 'ACTIVE',
        lastReceivedAt: '2026-08-03T10:00:00Z',
        lastProcessedAt: '2026-08-03T10:05:00Z',
        createdAt: '2026-05-01T08:00:00Z',
        updatedAt: '2026-08-03T10:05:00Z'
      }
    ];
  },

  async saveConnections(connections: EnergyConnection[]): Promise<void> {
    localStorage.setItem('locash_energy_connections', JSON.stringify(connections));
  },

  // Accounts / Processed Invoices
  async getAccounts(): Promise<EnergyAccount[]> {
    const saved = localStorage.getItem('locash_energy_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_MOCK_ENERGY_ACCOUNTS;
  },

  async saveAccounts(accounts: EnergyAccount[]): Promise<void> {
    localStorage.setItem('locash_energy_accounts', JSON.stringify(accounts));
  },

  // Inbox
  async getInboxDocuments(): Promise<InboxDocument[]> {
    const saved = localStorage.getItem('locash_inbox_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  },

  async saveInboxDocuments(docs: InboxDocument[]): Promise<void> {
    localStorage.setItem('locash_inbox_documents', JSON.stringify(docs));
  }
};
