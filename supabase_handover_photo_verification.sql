-- ============================================================
-- Lost & Found: Handover Process & Photo Verification Schema
-- รองรับ:
-- 1. ถ่ายรูปส่งมอบ (เปิดกล้องสด + ประทับตรา Watermark วันเวลา)
-- 2. เซ็นชื่อดิจิทัล (Digital Signature)
-- 3. บันทึกความยินยอม PDPA
-- 4. Storage Buckets: 'handover-photos' และ 'signatures'
-- Run this in Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1) เพิ่มคอลัมน์ใน handover_proofs ให้ครบถ้วน
-- ------------------------------------------------------------
ALTER TABLE public.handover_proofs
  ADD COLUMN IF NOT EXISTS proof_image_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS owner_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS receiver_name TEXT,
  ADD COLUMN IF NOT EXISTS receiver_student_id TEXT,
  ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS pdpa_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdpa_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_taken_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS photo_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- เพิ่มคอลัมน์ใน items เพื่อเก็บสถานะและลายเซ็นสรุป
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.handover_proofs.proof_image_url IS
  'URL รูปถ่ายตอนส่งมอบพร้อมลายน้ำ Watermark วันเวลา';
COMMENT ON COLUMN public.handover_proofs.signature_url IS
  'URL ลายมือชื่อดิจิทัลของผู้รับมอบ';
COMMENT ON COLUMN public.handover_proofs.pdpa_consent IS
  'สถานะการกดยินยอมข้อตกลง PDPA ก่อนส่งมอบ';

-- ------------------------------------------------------------
-- 2) สร้าง Storage Buckets สำหรับรูปถ่ายและลายเซ็น
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('handover-photos', 'handover-photos', true),
  ('signatures', 'signatures', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ------------------------------------------------------------
-- 3) Storage RLS Policies
-- ------------------------------------------------------------
-- Buckets: handover-photos
DROP POLICY IF EXISTS "Authenticated users can upload handover photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload handover photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'handover-photos'
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

DROP POLICY IF EXISTS "Anyone can view handover photos" ON storage.objects;
CREATE POLICY "Anyone can view handover photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'handover-photos');

-- Buckets: signatures
DROP POLICY IF EXISTS "Authenticated users can upload signatures" ON storage.objects;
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'signatures'
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

DROP POLICY IF EXISTS "Anyone can view signatures" ON storage.objects;
CREATE POLICY "Anyone can view signatures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'signatures');
