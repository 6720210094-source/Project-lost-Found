-- ============================================================
-- Update handover proof as completed with signature and timestamp
-- ============================================================

UPDATE public.handover_proofs
SET
  status = 'completed',
  signature_url = COALESCE(signature_url, ''),
  completed_at = now()
WHERE id = 'REPLACE_WITH_HANDOVER_ID';

-- Example with explicit values:
-- UPDATE public.handover_proofs
-- SET
--   status = 'completed',
--   signature_url = 'https://xyz.supabase.co/storage/v1/object/public/signatures/signatures/abc.png',
--   completed_at = NOW()
-- WHERE id = 'your-handover-id';
