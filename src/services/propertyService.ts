import { supabase, isSupabaseConfigured } from './supabase';
import { Property } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockData';

export const propertyService = {
  // Fetch all properties from Supabase cloud
  async getAll(): Promise<Property[]> {
    if (!isSupabaseConfigured()) {
      return INITIAL_PROPERTIES;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar imóveis do Supabase, usando padrão:', error.message);
        return INITIAL_PROPERTIES;
      }

      if (!data || data.length === 0) {
        return INITIAL_PROPERTIES;
      }

      // Map Supabase columns to TypeScript Property model
      return data.map((item: any): Property => ({
        id: item.id,
        ownerId: item.owner_id || item.landlord_id || 'landlord-1',
        ownerName: item.owner_name || 'Locador LOCASH',
        ownerAvatar: item.owner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        title: item.title,
        description: item.description || '',
        propertyType: item.property_type || 'APARTAMENTO',
        status: item.status || 'DISPONÍVEL',
        rentPrice: Number(item.rent_price),
        condoFee: Number(item.condo_fee || item.condom_price || 0),
        propertyTax: Number(item.property_tax || item.iptu_price || 0),
        bedrooms: Number(item.bedrooms || 1),
        bathrooms: Number(item.bathrooms || 1),
        parkingSpaces: Number(item.parking_spaces || item.parking_spots || 0),
        area: Number(item.area || item.area_m2 || 50),
        furnished: Boolean(item.furnished),
        petsAllowed: item.pets_allowed !== undefined ? Boolean(item.pets_allowed) : true,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        publicAddress: item.public_address,
        privateAddress: item.private_address,
        neighborhood: item.neighborhood,
        city: item.city,
        state: item.state,
        featured: Boolean(item.featured || item.is_boosted),
        verified: item.verified !== undefined ? Boolean(item.verified) : true,
        viewsCount: Number(item.views_count || 1),
        favoritesCount: Number(item.favorites_count || 0),
        contactCount: Number(item.contact_count || 0),
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80'],
        demandScore: Number(item.demand_score || 85),
        pricePerSqm: Number(item.price_per_sqm || (item.area ? Math.round(item.rent_price / item.area) : 65)),
        createdAt: item.created_at || new Date().toISOString()
      }));
    } catch (err) {
      console.error('Falha na requisição de imóveis ao Supabase:', err);
      return INITIAL_PROPERTIES;
    }
  },

  // Save / Insert a new property into Supabase
  async create(property: Property): Promise<Property> {
    if (!isSupabaseConfigured()) {
      return property;
    }

    try {
      const payload = {
        id: property.id,
        owner_id: property.ownerId,
        owner_name: property.ownerName,
        owner_avatar: property.ownerAvatar,
        title: property.title,
        description: property.description,
        property_type: property.propertyType,
        status: property.status,
        rent_price: property.rentPrice,
        condo_fee: property.condoFee,
        property_tax: property.propertyTax,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spaces: property.parkingSpaces,
        area: property.area,
        furnished: property.furnished,
        pets_allowed: property.petsAllowed,
        latitude: property.latitude,
        longitude: property.longitude,
        public_address: property.publicAddress,
        private_address: property.privateAddress,
        neighborhood: property.neighborhood,
        city: property.city,
        state: property.state,
        featured: property.featured,
        verified: property.verified,
        images: property.images,
        demand_score: property.demandScore,
        price_per_sqm: property.pricePerSqm
      };

      await supabase
        .from('properties')
        .upsert([payload]);

      return property;
    } catch (err) {
      console.error('Erro ao cadastrar imóvel no Supabase:', err);
      return property;
    }
  },

  // Update existing property
  async update(id: string, updates: Partial<Property>): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.rentPrice !== undefined) payload.rent_price = updates.rentPrice;
      if (updates.condoFee !== undefined) payload.condo_fee = updates.condoFee;
      if (updates.propertyTax !== undefined) payload.property_tax = updates.propertyTax;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.images !== undefined) payload.images = updates.images;
      if (updates.bedrooms !== undefined) payload.bedrooms = updates.bedrooms;
      if (updates.bathrooms !== undefined) payload.bathrooms = updates.bathrooms;
      if (updates.parkingSpaces !== undefined) payload.parking_spaces = updates.parkingSpaces;
      if (updates.area !== undefined) payload.area = updates.area;

      await supabase
        .from('properties')
        .update(payload)
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar imóvel no Supabase:', err);
    }
  },

  // Delete property
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('properties')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao deletar imóvel no Supabase:', err);
    }
  },

  // Subscribe to real-time changes
  subscribeToChanges(onUpdate: () => void) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('public:properties')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
