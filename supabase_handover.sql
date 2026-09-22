-- ============================================================
-- 1) เพิ่มคอลัมน์สำหรับ Digital Signature
-- ============================================================

ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.handover_proofs
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ถ้าใช้ชื่อ table อื่น เช่น handovers แทน handover_proofs
-- ให้เปลี่ยนเป็น:
-- ALTER TABLE IF EXISTS public.handovers
--   ADD COLUMN IF NOT EXISTS signature_url TEXT,
--   ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;-- ============================================================
-- 2) สร้าง Storage Bucket 'signatures' ถ้ายังไม่มี
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;-- ============================================================
-- 3) RLS Policy สำหรับ Storage Bucket 'signatures'
-- ให้เฉพาะผู้ใช้ที่เข้าสู่ระบบเท่านั้นสามารถอัปโหลดและดูรูปได้
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can upload signatures" ON storage.objects;
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'signatures'
  AND auth.role() = 'authenticated'
  AND owner = auth.uid()
);

DROP POLICY IF EXISTS "Authenticated users can view signatures" ON storage.objects;
CREATE POLICY "Authenticated users can view signatures"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'signatures'
  AND auth.role() = 'authenticated'
);-- ============================================================
-- หมายเหตุ: สำหรับ Flow ปัจจุบันที่ไม่ใช้ผู้ส่ง/verification code
-- ให้รันไฟล์ supabase_handover_simple.sql หลังจากตารางนี้ถูกสร้างแล้ว.
-- ============================================================
-- Proof of Delivery / Handover verification
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_status') THEN
    CREATE TYPE public.handover_status AS ENUM ('pending', 'completed', 'disputed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.handover_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  proof_image_url TEXT,
  verification_code CHAR(6) NOT NULL CHECK (verification_code ~ '^[0-9]{6}$'),

  status public.handover_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT handover_unique_item UNIQUE (item_id),
  CONSTRAINT handover_no_self_transfer CHECK (giver_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_handover_proofs_item_id
  ON public.handover_proofs (item_id);

CREATE INDEX IF NOT EXISTS idx_handover_proofs_giver_id
  ON public.handover_proofs (giver_id);

CREATE INDEX IF NOT EXISTS idx_handover_proofs_receiver_id
  ON public.handover_proofs (receiver_id);

CREATE INDEX IF NOT EXISTS idx_handover_proofs_status
  ON public.handover_proofs (status);

ALTER TABLE public.handover_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handover_select_participants"
ON public.handover_proofs
FOR SELECT
USING (
  auth.uid() = giver_id
  OR auth.uid() = receiver_id
);

CREATE POLICY "handover_insert_participants"
ON public.handover_proofs
FOR INSERT
WITH CHECK (
  auth.uid() = giver_id
  OR auth.uid() = receiver_id
);

CREATE POLICY "handover_update_participants"
ON public.handover_proofs
FOR UPDATE
USING (
  auth.uid() = giver_id
  OR auth.uid() = receiver_id
)
WITH CHECK (
  auth.uid() = giver_id
  OR auth.uid() = receiver_id
);
