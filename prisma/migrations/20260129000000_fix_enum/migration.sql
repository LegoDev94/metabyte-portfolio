-- Fix LeadStatus enum type name
-- Run this in Supabase SQL Editor to rename the enum type from lead_status to LeadStatus

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS lead_status;

-- Create enum with correct case-sensitive name (LeadStatus)
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');
