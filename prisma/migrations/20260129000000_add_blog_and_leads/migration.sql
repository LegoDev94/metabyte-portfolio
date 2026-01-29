-- Migration for Blog and Leads CRM
-- Run this in Supabase SQL Editor
-- IMPORTANT: Run all statements in order

-- ============================================
-- BLOG TABLES
-- ============================================

-- Posts (create first, before translations)
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY DEFAULT ('post_' || substr(md5(random()::text), 0, 9)),
    slug TEXT NOT NULL UNIQUE,
    cover_image TEXT,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Categories
CREATE TABLE IF NOT EXISTS post_categories (
    id TEXT PRIMARY KEY DEFAULT ('cat_' || substr(md5(random()::text), 0, 9)),
    slug TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Tags
CREATE TABLE IF NOT EXISTS post_tags (
    id TEXT PRIMARY KEY DEFAULT ('tag_' || substr(md5(random()::text), 0, 9)),
    slug TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Translations (after posts)
CREATE TABLE IF NOT EXISTS post_translations (
    id TEXT PRIMARY KEY DEFAULT ('pt_' || substr(md5(random()::text), 0, 9)),
    post_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, locale)
);

-- Add foreign key after both tables exist
ALTER TABLE post_translations DROP CONSTRAINT IF EXISTS fk_post_translations_post;
ALTER TABLE post_translations ADD CONSTRAINT fk_post_translations_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Post Categories Junction (after posts and categories)
CREATE TABLE IF NOT EXISTS _post_categories (
    A TEXT NOT NULL,
    B TEXT NOT NULL
);

ALTER TABLE _post_categories DROP CONSTRAINT IF EXISTS _post_categories_A_fkey;
ALTER TABLE _post_categories DROP CONSTRAINT IF EXISTS _post_categories_B_fkey;
ALTER TABLE _post_categories ADD CONSTRAINT _post_categories_A_fkey FOREIGN KEY (A) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE _post_categories ADD CONSTRAINT _post_categories_B_fkey FOREIGN KEY (B) REFERENCES post_categories(id) ON DELETE CASCADE;

-- Post Tags Junction (after posts and tags)
CREATE TABLE IF NOT EXISTS _post_tags (
    A TEXT NOT NULL,
    B TEXT NOT NULL
);

ALTER TABLE _post_tags DROP CONSTRAINT IF EXISTS _post_tags_A_fkey;
ALTER TABLE _post_tags DROP CONSTRAINT IF EXISTS _post_tags_B_fkey;
ALTER TABLE _post_tags ADD CONSTRAINT _post_tags_A_fkey FOREIGN KEY (A) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE _post_tags ADD CONSTRAINT _post_tags_B_fkey FOREIGN KEY (B) REFERENCES post_tags(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_post_translations_locale ON post_translations(locale);
CREATE INDEX IF NOT EXISTS idx_post_categories_slug ON post_categories(slug);
CREATE INDEX IF NOT EXISTS idx_post_tags_slug ON post_tags(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_categories_a_b ON _post_categories(A, B);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_tags_a_b ON _post_tags(A, B);

-- ============================================
-- LEADS CRM TABLES
-- ============================================

-- Lead Status Enum type (must match Prisma schema name)
DO $$ BEGIN
    CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT ('lead_' || substr(md5(random()::text), 0, 9)),
    name TEXT,
    email TEXT,
    telegram TEXT,
    phone TEXT,
    budget TEXT,
    source TEXT NOT NULL DEFAULT 'website',
    project_type TEXT,
    message TEXT NOT NULL,
    status "LeadStatus" NOT NULL DEFAULT 'NEW',
    priority INTEGER NOT NULL DEFAULT 0,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Notes
CREATE TABLE IF NOT EXISTS lead_notes (
    id TEXT PRIMARY KEY DEFAULT ('ln_' || substr(md5(random()::text), 0, 9)),
    lead_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lead_notes DROP CONSTRAINT IF EXISTS fk_lead_notes_lead;
ALTER TABLE lead_notes ADD CONSTRAINT fk_lead_notes_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

-- Lead Status History
CREATE TABLE IF NOT EXISTS lead_status_history (
    id TEXT PRIMARY KEY DEFAULT ('lsh_' || substr(md5(random()::text), 0, 9)),
    lead_id TEXT NOT NULL,
    from_status "LeadStatus",
    to_status "LeadStatus" NOT NULL,
    changed_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lead_status_history DROP CONSTRAINT IF EXISTS fk_lead_status_history_lead;
ALTER TABLE lead_status_history ADD CONSTRAINT fk_lead_status_history_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON lead_status_history(lead_id);

-- ============================================
-- SAMPLE DATA (optional)
-- ============================================

-- Insert sample categories
INSERT INTO post_categories (slug, "order") VALUES
    ('development', 1),
    ('design', 2),
    ('technology', 3),
    ('tutorials', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO post_tags (slug, color) VALUES
    ('react', '#61dafb'),
    ('nextjs', '#000000'),
    ('typescript', '#3178c6'),
    ('ui-design', '#6366f1'),
    ('webdev', '#38bdf8')
ON CONFLICT (slug) DO NOTHING;
