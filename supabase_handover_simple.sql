-- ============================================================
-- Lost & Found: Simplified handover flow
-- ผู้รับ + รหัสนักศึกษา + วันเวลา + ลายเซ็น + สถานะ
-- ไม่ต้องมีผู้ส่งและไม่ต้องใช้ verification code
-- ============================================================

ALTER TABLE public.handover_proofs
  ALTER COLUMN giver_id DROP NOT NULL,
  ALTER COLUMN verification_code DROP NOT NULL;

ALTER TABLE public.handover_proofs
  ADD COLUMN IF NOT EXISTS receiver_name TEXT,
  ADD COLUMN IF NOT EXISTS receiver_student_id TEXT;

ALTER TABLE public.handover_proofs
  DROP CONSTRAINT IF EXISTS handover_no_self_transfer;

-- ให้ผู้รับที่ล็อกอินอยู่สามารถบันทึก/แก้ไขหลักฐานของตัวเองได้
DROP POLICY IF EXISTS "handover_select_participants" ON public.handover_proofs;
DROP POLICY IF EXISTS "handover_insert_participants" ON public.handover_proofs;
DROP POLICY IF EXISTS "handover_update_participants" ON public.handover_proofs;

CREATE POLICY "handover_select_receiver"
ON public.handover_proofs
FOR SELECT
USING (auth.uid() = receiver_id);

CREATE POLICY "handover_insert_receiver"
ON public.handover_proofs
FOR INSERT
WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "handover_update_receiver"
ON public.handover_proofs
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);
