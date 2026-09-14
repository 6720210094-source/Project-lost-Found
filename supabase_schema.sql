-- ============================================================
-- SQL Script for Supabase Table Creation (Lost & Found System)
-- คัดลอกโค้ดทั้งหมดนี้ไปวางใน Supabase Dashboard > SQL Editor > แล้วกด Run
-- ============================================================

-- ⚡ QUICK FIX: แก้ไขปัญหา Foreign Key (รันบรรทัดนี้ใน SQL Editor เพื่อแก้ Error ทันที)
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_user_id_fkey;
ALTER TABLE public.items ADD CONSTRAINT items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1. Create Custom Types / Enums
DO $$ BEGIN
    CREATE TYPE item_type AS ENUM ('LOST', 'FOUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('PENDING', 'RESOLVED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Users Table (Optional Sync)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NULL,
  name TEXT,
  phone TEXT,
  role user_role DEFAULT 'USER'::user_role,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Supabase Auth is the source of truth for passwords.
-- The custom users table should not require a password hash during sign-up.
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Create Items Table (Lost & Found Items)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  type item_type NOT NULL,
  status item_status DEFAULT 'PENDING'::item_status,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to items" ON public.items;
CREATE POLICY "Allow all access to items" ON public.items FOR ALL USING (true);
