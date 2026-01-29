-- Check current enum type and fix if needed
-- Run this in Supabase SQL Editor

-- Check if LeadStatus type exists
SELECT typname, typtype FROM pg_type WHERE typname = 'LeadStatus';

-- If lead_status exists but LeadStatus doesn't, rename it
ALTER TYPE lead_status RENAME TO "LeadStatus";

-- If both exist and lead_status has data, drop the duplicate
DROP TYPE IF EXISTS lead_status CASCADE;
