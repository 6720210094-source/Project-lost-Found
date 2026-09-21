"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/lib/supabase";

const SIGNATURE_BUCKET = "signatures";

type Notice = {
  type: "success" | "error";
  text: string;
};

type DigitalSignatureModalProps = {
  isOpen: boolean;
  handoverId: string;
  onClose: () => void;
  onSuccess?: (signatureUrl: string) => void;
};

export default function DigitalSignatureModal({
  isOpen,
  handoverId,
  onClose,
  onSuccess,
}: DigitalSignatureModalProps) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNotice(null);
    }
  }, [isOpen]);

  const clearSignature = () => {
    signatureRef.current?.clear();
    setNotice(null);
  };

  const confirmSignature = async () => {
    if (!signatureRef.current) {
      const errorText = "ระบบลายเซ็นยังไม่พร้อมใช้งาน";
      setNotice({ type: "error", text: errorText });
      window.alert(errorText);
      return;
    }

    if (signatureRef.current.isEmpty()) {
      const errorText = "กรุณาเซ็นชื่อก่อนยืนยันรับของ";
      setNotice({ type: "error", text: errorText });
      window.alert(errorText);
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const dataUrl = signatureRef.current.toDataURL("image/png");
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `signature-${Date.now()}.png`, { type: "image/png" });

      const storagePath = `handover/${handoverId}/${file.name}`;
      const uploadResult = await supabase.storage.from(SIGNATURE_BUCKET).upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/png",
      });

      if (uploadResult.error) {
        if (uploadResult.error.message?.includes("Bucket not found")) {
          throw new Error("Bucket 'signatures' ยังไม่มีใน Supabase โปรดสร้าง bucket ชื่อ 'signatures' ก่อนใช้งาน");
        }
        throw uploadResult.error;
      }

      const publicUrlResult = supabase.storage.from(SIGNATURE_BUCKET).getPublicUrl(storagePath);
      const signatureUrl = publicUrlResult.data?.publicUrl;

      if (!signatureUrl) {
        throw new Error("ไม่สามารถสร้าง Public URL ของลายเซ็นได้");
      }

      const { error: updateError } = await supabase
        .from("handover_proofs")
        .update({
          status: "completed",
          signature_url: signatureUrl,
          completed_at: new Date().toISOString(),
        })
        .eq("id", handoverId);

      if (updateError) {
        throw updateError;
      }

      const successText = "ยืนยันรับของสำเร็จแล้ว";
      setNotice({ type: "success", text: successText });
      window.alert(successText);
      onSuccess?.(signatureUrl);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดระหว่างยืนยันรับของ";

      setNotice({ type: "error", text: message });
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Digital Signature</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">เซ็นชื่อรับของคืน</h2>
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
            ref={signatureRef}
            canvasProps={{
              className: "min-h-[220px] w-full rounded-xl bg-white shadow-inner",
            }}
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
            onClick={confirmSignature}
            disabled={isSubmitting}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(244,63,94,0.25)] transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "กำลังยืนยัน..." : "ยืนยันรับของ"}
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
