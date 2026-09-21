"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/lib/supabase";

const SIGNATURE_BUCKET = "signatures";

type SignatureModalProps = {
  isOpen: boolean;
  handoverId?: string;
  itemId?: string;
  giverId?: string;
  receiverId?: string;
  onClose: () => void;
  onSuccess?: (signatureUrl: string) => void;
};

export default function SignatureModal({
  isOpen,
  handoverId,
  itemId,
  giverId,
  receiverId,
  onClose,
  onSuccess,
}: SignatureModalProps) {
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const clearSignature = () => {
    sigPadRef.current?.clear();
    setNotice(null);
  };

  const handleConfirm = async () => {
    if (!sigPadRef.current) {
      const message = "Canvas ยังไม่พร้อมใช้งาน";
      setNotice({ type: "error", text: message });
      window.alert(message);
      return;
    }

    if (sigPadRef.current.isEmpty()) {
      const message = "กรุณาเซ็นชื่อก่อนยืนยันรับของ";
      setNotice({ type: "error", text: message });
      window.alert(message);
      return;
    }

    if (!itemId && (!handoverId || handoverId === "demo-handover-id")) {
      const message = "กรุณาเปิดฟังก์ชันนี้จากหน้ารายการจริงก่อนยืนยันรับของ";
      setNotice({ type: "error", text: message });
      window.alert(message);
      return;
    }

    if (!giverId || !receiverId || giverId === receiverId) {
      const message = "ข้อมูลผู้ส่ง/ผู้รับไม่ครบถ้วนหรือซ้ำกัน กรุณาตรวจสอบข้อมูลก่อนยืนยัน";
      setNotice({ type: "error", text: message });
      window.alert(message);
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const dataUrl = sigPadRef.current.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `signature-${Date.now()}.png`, { type: "image/png" });

      const storageKey = itemId || handoverId || "signature";
      const filePath = `signatures/${storageKey}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(SIGNATURE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/png",
        });

      if (uploadError) {
        console.error("Signature upload failed:", uploadError);
        if (uploadError.message?.includes("Bucket not found")) {
          throw new Error("Bucket 'signatures' ยังไม่มีใน Supabase โปรดสร้าง bucket ชื่อ 'signatures' ก่อนใช้งาน");
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(SIGNATURE_BUCKET)
        .getPublicUrl(filePath);

      let signatureUrl = publicUrlData?.publicUrl ?? "";

      if (!signatureUrl) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(SIGNATURE_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24);

        if (signedError) {
          console.error("Signature signed URL failed:", signedError);
          throw signedError;
        }

        signatureUrl = signedData?.signedUrl ?? "";
      }

      if (!signatureUrl) {
        throw new Error("ไม่สามารถสร้าง Public URL ของลายเซ็นได้");
      }

      const completedAt = new Date().toISOString();
      const verificationCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");

      if (handoverId && handoverId !== "demo-handover-id") {
        const { error: handoverInsertError } = await supabase.from("handover_proofs").upsert(
          {
            id: handoverId,
            item_id: itemId ?? "",
            giver_id: giverId,
            receiver_id: receiverId,
            proof_image_url: signatureUrl,
            verification_code: verificationCode,
            status: "completed",
            completed_at: completedAt,
          },
          { onConflict: "id", ignoreDuplicates: false }
        );

        if (handoverInsertError) {
          console.error("handover_proofs upsert failed:", handoverInsertError);
          throw handoverInsertError;
        }
      }

      if (itemId) {
        const { error: itemUpdateError } = await supabase
          .from("items")
          .update({
            status: "RESOLVED",
            signature_url: signatureUrl,
            completed_at: completedAt,
          })
          .eq("id", itemId);

        if (itemUpdateError) {
          console.error("item update failed:", itemUpdateError);
          throw itemUpdateError;
        }
      }

      const successMessage = `ยืนยันรับของสำเร็จแล้ว รหัสยืนยัน: ${verificationCode}`;
      setNotice({ type: "success", text: successMessage });
      window.alert(successMessage);
      onSuccess?.(signatureUrl);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      console.error("Signature confirmation failed:", error);
      setNotice({ type: "error", text: message });
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-500">Digital Signature</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">เซ็นชื่อรับของคืน</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ปิด
          </button>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-2">
          <SignatureCanvas
            ref={sigPadRef}
            canvasProps={{
              className: "min-h-[220px] w-full rounded-xl bg-white shadow-inner",
            }}
            backgroundColor="white"
            penColor="black"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={clearSignature}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            ล้าง / เซ็นใหม่
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(244,63,94,0.25)] transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "กำลังยืนยัน..." : "ยืนยันรับของ"}
          </button>
        </div>

        {notice && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        )}
      </div>
    </div>
  );
}
