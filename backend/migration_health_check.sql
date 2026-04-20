-- Migration: Add health check columns to links table
-- Run this in the Supabase SQL Editor

ALTER TABLE links ADD COLUMN IF NOT EXISTS is_broken BOOLEAN DEFAULT false;
ALTER TABLE links ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE links ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'unchecked';
