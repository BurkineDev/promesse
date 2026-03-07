-- PromessTrack - Initial Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES (linked to Supabase Auth users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CLIENTS
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PACKAGES
-- =============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  description TEXT,
  weight DECIMAL(10, 2),
  destination TEXT NOT NULL,
  origin TEXT DEFAULT 'Montréal',
  status TEXT NOT NULL DEFAULT 'RECU' CHECK (status IN ('RECU', 'ENTREPOT', 'EXPEDIE', 'EN_TRANSIT', 'ARRIVE', 'LIVRE')),
  photo_url TEXT,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRACKING EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('RECU', 'ENTREPOT', 'EXPEDIE', 'EN_TRANSIT', 'ARRIVE', 'LIVRE')),
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT DEFAULT 'CASH' CHECK (method IN ('CASH', 'VIREMENT', 'CARTE', 'MOBILE')),
  status TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (status IN ('EN_ATTENTE', 'PAYE', 'REMBOURSE')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRACKING NUMBER SEQUENCE
-- =============================================
CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 1;

-- Function to generate tracking number: IMP-YYYY-XXXX
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  seq_val INTEGER;
  year_val TEXT;
BEGIN
  seq_val := nextval('tracking_number_seq');
  year_val := EXTRACT(YEAR FROM NOW())::TEXT;
  RETURN 'IMP-' || year_val || '-' || LPAD(seq_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can see their own, admins see all
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Clients: admins and agents can manage, public read for tracking
CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Packages: staff can manage, public can read by tracking number
CREATE POLICY "packages_select_staff" ON packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "packages_insert" ON packages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "packages_update" ON packages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "packages_delete" ON packages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Tracking events: staff can manage, public can read
CREATE POLICY "tracking_events_select" ON tracking_events
  FOR SELECT USING (true);

CREATE POLICY "tracking_events_insert" ON tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

-- Payments: admins and agents can manage
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "payments_update" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

-- =============================================
-- PUBLIC TRACKING FUNCTION (no auth required)
-- =============================================
CREATE OR REPLACE FUNCTION get_package_by_tracking(p_tracking_number TEXT)
RETURNS TABLE (
  id UUID,
  tracking_number TEXT,
  description TEXT,
  weight DECIMAL,
  destination TEXT,
  origin TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  client_name TEXT
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    pkg.id,
    pkg.tracking_number,
    pkg.description,
    pkg.weight,
    pkg.destination,
    pkg.origin,
    pkg.status,
    pkg.created_at,
    c.name AS client_name
  FROM packages pkg
  LEFT JOIN clients c ON c.id = pkg.client_id
  WHERE pkg.tracking_number = p_tracking_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DASHBOARD STATS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON SECURITY DEFINER AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'packages_today', (
      SELECT COUNT(*) FROM packages
      WHERE created_at >= CURRENT_DATE
    ),
    'packages_in_transit', (
      SELECT COUNT(*) FROM packages
      WHERE status IN ('EXPEDIE', 'EN_TRANSIT')
    ),
    'packages_delivered', (
      SELECT COUNT(*) FROM packages
      WHERE status = 'LIVRE'
    ),
    'packages_total', (
      SELECT COUNT(*) FROM packages
    ),
    'clients_total', (
      SELECT COUNT(*) FROM clients
    ),
    'revenue_total', (
      SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PAYE'
    ),
    'revenue_pending', (
      SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'EN_ATTENTE'
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL ADMIN USER (run after creating user in Auth)
-- Replace 'your-user-uuid' with actual UUID from auth.users
-- =============================================
-- INSERT INTO profiles (id, name, role) VALUES ('your-user-uuid', 'Administrateur', 'admin');
