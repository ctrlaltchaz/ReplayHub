-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick token lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset_tokens(token);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON public.password_reset_tokens(email);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON public.password_reset_tokens(expires_at);

-- RLS Policies for password_reset_tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Backend service has full access (adjust role name based on your setup)
-- In production with Supabase: use service_role
-- For standard PostgreSQL: policies are managed at application level
-- No policies needed here since this is a backend-only table
