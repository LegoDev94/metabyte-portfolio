-- Fix LeadStatus enum type name
-- Run this in Supabase SQL Editor

-- Drop the old enum type and all dependent objects (columns, constraints, etc.)
DROP TYPE IF EXISTS lead_status CASCADE;

-- Create enum with correct case-sensitive name (LeadStatus)
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- Recreate the columns with the new enum type
ALTER TABLE leads ALTER COLUMN status TYPE "LeadStatus" USING status::text::"LeadStatus";
ALTER TABLE lead_status_history ALTER COLUMN from_status TYPE "LeadStatus" USING from_status::text::"LeadStatus";
ALTER TABLE lead_status_history ALTER COLUMN to_status TYPE "LeadStatus" USING to_status::text::"LeadStatus";
