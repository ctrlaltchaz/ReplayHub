-- Add Quick Login PIN fields to global_users table
ALTER TABLE global_users
ADD COLUMN IF NOT EXISTS quick_login_pin_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS quick_login_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quick_login_device_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_global_users_quick_login_device ON global_users (quick_login_device_id)
WHERE
    quick_login_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN global_users.quick_login_pin_hash IS 'Hashed PIN for quick login feature';

COMMENT ON COLUMN global_users.quick_login_enabled IS 'Whether quick login with PIN is enabled for this user';

COMMENT ON COLUMN global_users.quick_login_device_id IS 'Device-specific identifier for quick login security';