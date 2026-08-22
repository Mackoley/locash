-- ==============================================================================
-- LOCASH - ESQUEMA DE BANCO DE DADOS EM NUVEM (SUPABASE POSTGRESQL + POSTGIS)
-- Execute este script no SQL Editor do seu Dashboard Supabase (https://supabase.com)
-- ==============================================================================

-- 1. Habilitar extensões geoespaciais e de criptografia
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('TENANT', 'LANDLORD', 'ADMIN')) DEFAULT 'TENANT',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Imóveis (Properties)
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'APARTAMENTO',
  rent_price NUMERIC(12, 2) NOT NULL,
  condom_price NUMERIC(12, 2) DEFAULT 0,
  iptu_price NUMERIC(12, 2) DEFAULT 0,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  suites INT DEFAULT 0,
  parking_spots INT DEFAULT 0,
  area_m2 NUMERIC(8, 2) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  public_address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'RENTED', 'RESERVED', 'MAINTENANCE')) DEFAULT 'AVAILABLE',
  is_boosted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice geoespacial para consultas no mapa ultrarrápidas
CREATE INDEX IF NOT EXISTS idx_properties_geom ON public.properties USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties (city);

-- Trigger para atualizar automaticamente o campo 'geom' a partir de lat/lng
CREATE OR REPLACE FUNCTION public.update_property_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_property_geom ON public.properties;
CREATE TRIGGER trg_update_property_geom
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_property_geom();

-- 4. Tabela de Favoritos (Favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- 5. Tabela de Contratos de Locação (Leases)
CREATE TABLE IF NOT EXISTS public.leases (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  rent_amount NUMERIC(12, 2) NOT NULL,
  condom_amount NUMERIC(12, 2) DEFAULT 0,
  iptu_amount NUMERIC(12, 2) DEFAULT 0,
  due_day INT NOT NULL DEFAULT 10,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_pdf_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PENDING_SIGNATURE', 'TERMINATED', 'EXPIRED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabela de Cobranças e Pagamentos (Payments)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  lease_id TEXT NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  month_reference TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE')) DEFAULT 'PENDING',
  payment_method TEXT,
  pix_code TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabela de Chamados de Manutenção (Maintenance Requests)
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  lease_id TEXT NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) DEFAULT 'MEDIUM',
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')) DEFAULT 'PENDING',
  category TEXT NOT NULL DEFAULT 'GERAL',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  cost NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tabela de Mensagens do Chat em Tempo Real (Chat Messages)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  property_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'TENANT',
  receiver_id TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Habilitar Realtime para Chat, Imóveis e Pagamentos
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;

-- 9. Políticas de Segurança em Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública para Imóveis no Mapa
CREATE POLICY "Imoveis sao visiveis publicamente no mapa" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Locadores podem criar imoveis" ON public.properties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Locadores podem atualizar seus proprios imoveis" ON public.properties
  FOR UPDATE USING (true);

CREATE POLICY "Locadores podem deletar seus proprios imoveis" ON public.properties
  FOR DELETE USING (true);

-- Políticas para Chat
CREATE POLICY "Mensagens sao visiveis para todos autenticados" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Qualquer usuario pode enviar mensagens no chat" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

-- Políticas para Pagamentos e Contratos
CREATE POLICY "Leitura publica de contratos" ON public.leases
  FOR SELECT USING (true);

CREATE POLICY "Leitura de pagamentos" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Atualizacao de pagamentos" ON public.payments
  FOR UPDATE USING (true);

-- 10. Inserir Dados Iniciais de Demonstração (Seed Data)
INSERT INTO public.properties (
  id, title, description, property_type, rent_price, condom_price, iptu_price,
  bedrooms, bathrooms, suites, parking_spots, area_m2, latitude, longitude,
  public_address, neighborhood, city, state, postal_code, images, amenities, status, is_boosted
) VALUES
(
  'prop-1',
  'Studio Cyberpunk High-Tech com Vista Panorâmica',
  'Espetacular studio totalmente mobiliado com automação residencial completa, fechadura biométrica e vista incrível para a skyline de São Paulo.',
  'STUDIO',
  3500.00, 650.00, 180.00,
  1, 1, 1, 1, 48.00,
  -23.5855, -46.6753,
  'Av. Brigadeiro Faria Lima, 3477', 'Itaim Bibi', 'São Paulo', 'SP', '04538-133',
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80'],
  ARRAY['Automação Residencial', 'Fechadura Biométrica', 'Ar Condicionado', 'Piscina Infinity', 'Academia 24h', 'Coworking'],
  'AVAILABLE', true
),
(
  'prop-2',
  'Apartamento Moderno 2 Quartos Brooklin',
  'Apartamento espaçoso e contemporâneo, a passos do metrô Brooklin. Varanda gourmet envidraçada e lazer completo.',
  'APARTAMENTO',
  4200.00, 850.00, 240.00,
  2, 2, 1, 2, 76.00,
  -23.6184, -46.6961,
  'Rua Flórida, 1750', 'Brooklin', 'São Paulo', 'SP', '04565-001',
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1502005229762-ee1b2b8c9735?w=1200&auto=format&fit=crop&q=80'],
  ARRAY['Varanda Gourmet', 'Churrasqueira', 'Pet Friendly', 'Carregador Carro Elétrico', 'Piscina Aquecida'],
  'AVAILABLE', true
),
(
  'prop-3',
  'Loft Industrial Jardins Decorado',
  'Loft com pé direito duplo, tijolinhos aparentes e design industrial assinado por arquitetos renomados.',
  'LOFT',
  5800.00, 980.00, 310.00,
  1, 2, 1, 1, 85.00,
  -23.5678, -46.6632,
  'Alameda Lorena, 1200', 'Jardins', 'São Paulo', 'SP', '01424-001',
  ARRAY['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop&q=80'],
  ARRAY['Pé Direito Duplo', 'Design Industrial', 'Jacuzzi Privativa', 'Segurança Armada 24h'],
  'AVAILABLE', false
),
(
  'prop-4',
  'Cobertura Duplex Vila Madalena com Rooftop',
  'Exclusiva cobertura duplex com piscina privativa, deck de madeira e vista 360 graus para o pôr do sol.',
  'COBERTURA',
  8900.00, 1400.00, 520.00,
  3, 4, 3, 3, 160.00,
  -23.5552, -46.6894,
  'Rua Girassol, 850', 'Vila Madalena', 'São Paulo', 'SP', '05433-001',
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80'],
  ARRAY['Piscina Privativa', 'Rooftop', 'Vista 360', 'Adega Climatizada', '3 Vagas Garagem'],
  'AVAILABLE', true
)
ON CONFLICT (id) DO NOTHING;
