-- Announcements / Social media posts system
-- Allows admin to write announcements and share them to social networks

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  image_url   TEXT,
  category    TEXT NOT NULL DEFAULT 'INFO'
              CHECK (category IN ('INFO', 'PROMO', 'ALERTE', 'TEMOIGNAGE', 'NOUVEAU_SERVICE')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Public read for published announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_public_read" ON announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "announcements_admin_all" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'agent'))
  );

-- Index for public feed
CREATE INDEX idx_announcements_published ON announcements (is_published, published_at DESC)
  WHERE is_published = true;
