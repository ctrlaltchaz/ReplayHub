-- ============================================================================
-- DOCS MODULE MIGRATION
-- Two-tier documentation system: Global docs (super admin) + Org docs (tenant)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DOC CATEGORIES
-- Supports both global (organization_id IS NULL) and org-scoped categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS doc_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50), -- Emoji or icon identifier
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Ensure slug is unique per organization (NULL for global)
UNIQUE NULLS NOT DISTINCT (organization_id, slug) );

-- Index for filtering by org and active status
CREATE INDEX idx_doc_categories_org ON doc_categories (organisation_id)
WHERE
    organisation_id IS NOT NULL;

CREATE INDEX idx_doc_categories_global ON doc_categories (organisation_id)
WHERE
    organisation_id IS NULL;

CREATE INDEX idx_doc_categories_active ON doc_categories (is_active, sort_order);

-- ============================================================================
-- DOCS
-- Documentation content with markdown support
-- ============================================================================
CREATE TYPE doc_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE doc_author_type AS ENUM ('global_user', 'org_user');

CREATE TABLE IF NOT EXISTS docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES doc_categories(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    excerpt TEXT, -- Short description/summary
    status doc_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE, -- Pin to top
    view_count INT DEFAULT 0,
    estimated_read_time INT DEFAULT 5, -- In minutes
    author_type doc_author_type NOT NULL,
    author_id UUID NOT NULL, -- References global_users or org_users depending on author_type
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Ensure slug is unique per organization (NULL for global)
UNIQUE NULLS NOT DISTINCT (organization_id, slug) );

-- Indexes for performance
CREATE INDEX idx_docs_org ON docs (organisation_id)
WHERE
    organisation_id IS NOT NULL;

CREATE INDEX idx_docs_global ON docs (organisation_id)
WHERE
    organisation_id IS NULL;

CREATE INDEX idx_docs_category ON docs (category_id);

CREATE INDEX idx_docs_status ON docs (status, published_at DESC);

CREATE INDEX idx_docs_featured ON docs (
    is_featured,
    published_at DESC
)
WHERE
    is_featured = TRUE;

CREATE INDEX idx_docs_author ON docs (author_type, author_id);

CREATE INDEX idx_docs_search ON docs USING gin (
    to_tsvector (
        'english',
        title || ' ' || COALESCE(excerpt, '') || ' ' || content
    )
);

-- ============================================================================
-- DOC COMPLETIONS
-- Track user progress through tutorials (org-scoped only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS doc_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    doc_id UUID NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES org_users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT, -- Optional user notes

-- Each user can only complete a doc once per org
UNIQUE(organisation_id, doc_id, user_id) );

-- Indexes for performance
CREATE INDEX idx_doc_completions_org ON doc_completions (organisation_id);

CREATE INDEX idx_doc_completions_user ON doc_completions (user_id, completed_at DESC);

CREATE INDEX idx_doc_completions_doc ON doc_completions (doc_id);

-- ============================================================================
-- DOC ATTACHMENTS
-- Optional file attachments for documentation
-- ============================================================================
CREATE TABLE IF NOT EXISTS doc_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    doc_id UUID NOT NULL REFERENCES docs (id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL, -- In bytes
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL, -- Could be global_user or org_user
    uploader_type doc_author_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for doc attachments
CREATE INDEX idx_doc_attachments_doc ON doc_attachments (doc_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE doc_categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

ALTER TABLE doc_completions ENABLE ROW LEVEL SECURITY;

ALTER TABLE doc_attachments ENABLE ROW LEVEL SECURITY;

-- Doc Categories RLS Policies
-- Global categories (organisation_id IS NULL) are visible to everyone
-- Org categories follow standard tenant isolation
CREATE POLICY tenant_isolation_doc_categories ON doc_categories
    FOR ALL
    USING (
        organisation_id IS NULL OR 
        organisation_id = current_setting('app.current_tenant_id', TRUE)::uuid
    );

-- Docs RLS Policies
-- Global docs (organisation_id IS NULL) are visible to everyone
-- Org docs follow standard tenant isolation
CREATE POLICY tenant_isolation_docs ON docs
    FOR ALL
    USING (
        organisation_id IS NULL OR 
        organisation_id = current_setting('app.current_tenant_id', TRUE)::uuid
    );

-- Doc Completions RLS Policies
-- Standard tenant isolation (completions are org-scoped)
CREATE POLICY tenant_isolation_doc_completions ON doc_completions
    FOR ALL
    USING (organisation_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Doc Attachments RLS Policies
-- Follow the parent doc's visibility
CREATE POLICY tenant_isolation_doc_attachments ON doc_attachments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM docs 
            WHERE docs.id = doc_attachments.doc_id
            AND (
                docs.organisation_id IS NULL OR 
                docs.organisation_id = current_setting('app.current_tenant_id', TRUE)::uuid
            )
        )
    );

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_docs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_doc_categories_updated_at
    BEFORE UPDATE ON doc_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_docs_updated_at();

CREATE TRIGGER update_docs_updated_at
    BEFORE UPDATE ON docs
    FOR EACH ROW
    EXECUTE FUNCTION update_docs_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_doc_view_count(doc_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE docs 
    SET view_count = view_count + 1 
    WHERE id = doc_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get doc completion stats
CREATE OR REPLACE FUNCTION get_doc_completion_stats(doc_uuid UUID, org_uuid UUID)
RETURNS TABLE(
    total_users BIGINT,
    completed_users BIGINT,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ou.id)::BIGINT as total_users,
        COUNT(DISTINCT dc.user_id)::BIGINT as completed_users,
        CASE 
            WHEN COUNT(DISTINCT ou.id) > 0 
            THEN ROUND((COUNT(DISTINCT dc.user_id)::NUMERIC / COUNT(DISTINCT ou.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_percentage
    FROM org_users ou
    LEFT JOIN doc_completions dc ON dc.user_id = ou.id AND dc.doc_id = doc_uuid
    WHERE ou.organisation_id = org_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON
TABLE doc_categories IS 'Documentation categories supporting both global (NULL org_id) and org-scoped categories';

COMMENT ON
TABLE docs IS 'Documentation content with markdown. Global docs (NULL org_id) visible to all organizations';

COMMENT ON
TABLE doc_completions IS 'Track user progress through tutorials (org-scoped only)';

COMMENT ON
TABLE doc_attachments IS 'File attachments for documentation';

COMMENT ON COLUMN docs.organisation_id IS 'NULL for global docs managed by super admins, UUID for org-specific docs';

COMMENT ON COLUMN docs.author_type IS 'Indicates whether author is a global_user or org_user';

COMMENT ON COLUMN docs.estimated_read_time IS 'Estimated reading time in minutes';

COMMENT ON COLUMN docs.view_count IS 'Number of times doc has been viewed across all orgs';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================