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

export const INITIAL_MOCK_ENERGY_ACCOUNTS: EnergyAccount[] = [];

export const energyService = {
  // Connections
  async getConnections(): Promise<EnergyConnection[]> {
    const saved = localStorage.getItem('locash_energy_connections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
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
    return [];
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
  },

  // Clear all energy data
  async clearAllData(): Promise<void> {
    localStorage.removeItem('locash_energy_connections');
    localStorage.removeItem('locash_energy_accounts');
    localStorage.removeItem('locash_inbox_documents');
  }
};
