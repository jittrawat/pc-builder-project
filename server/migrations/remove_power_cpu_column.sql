-- Migration: Remove Power_CPU column from cooler table
-- This removes the TDP/Power rating field that is no longer needed

ALTER TABLE cooler DROP COLUMN Power_CPU;









