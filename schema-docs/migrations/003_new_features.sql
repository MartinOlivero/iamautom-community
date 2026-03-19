-- ============================================================
-- IamAutom Community Platform — V2 Features Migration
-- ============================================================

-- ── PROFILES THEME ─────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'light';

-- ── MODULE COVERS ──────────────────────────────────────────
ALTER TABLE modules ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- ── SITE SETTINGS ─────────────────────────────────────────
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Iamautom LAB',
    logo_url TEXT,
    favicon_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one row exists (Singleton) by constraining it or just relying on a specific ID.
-- We'll insert a default row if empty.
INSERT INTO site_settings (title) VALUES ('Iamautom LAB');

-- Site settings are public to read, but only admins can update
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by everyone"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update settings"
    ON site_settings FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ── STORAGE BUCKETS ────────────────────────────────────────
-- Create public buckets for the new media features if they don't exist

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('module_covers', 'module_covers', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('post_attachments', 'post_attachments', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site_assets', 'site_assets', true) 
ON CONFLICT (id) DO NOTHING;

-- ── STORAGE POLICIES ───────────────────────────────────────

-- Avatars: Everyone can read, authenticated users can insert/update their own
CREATE POLICY "Avatar images are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatars" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Module Covers: Everyone can read, admins can upload
CREATE POLICY "Module covers are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'module_covers');

CREATE POLICY "Admins can manage module covers" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'module_covers' AND auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Post Attachments: Authenticated users can read and upload
CREATE POLICY "Post attachments are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'post_attachments');

CREATE POLICY "Users can upload post attachments" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'post_attachments' AND auth.role() = 'authenticated');

-- Site Assets (Logo/Favicon): Everyone can read, admins can upload
CREATE POLICY "Site assets are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'site_assets');

CREATE POLICY "Admins can manage site assets" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'site_assets' AND auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

