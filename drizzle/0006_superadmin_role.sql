-- Migration 0006: Add superadmin role
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'superadmin';
