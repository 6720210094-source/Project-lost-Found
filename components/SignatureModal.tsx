"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Camera, CheckCircle2, RefreshCw, X, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SignatureModalProps = {
  isOpen: boolean;
  itemId?: string;
  itemTitle?: string;
  handoverId?: string;
  onClose: () => void;
  onSuccess?: (signatureUrl: string) => void;
};

export default function SignatureModal({
  isOpen,
  itemId,
  itemTitle,
  onClose,
  onSuccess,
}: SignatureModalProps) {
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [watermarkedPhotoBlob, setWatermarkedPhotoBlob] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setNotice(null);
    setLoading(false);
    setPdpaConsent(false);
    setWatermarkedPhotoBlob(null);
    setPhotoPreviewUrl(null);
    sigPadRef.current?.clear();

    const loadReceiverName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      setReceiverName(data?.name || user.user_metadata?.name || "");
    };

    void loadReceiverName();
  }, [isOpen]);

  // ฟังก์ชันประทับตรา Watermark วันเวลาและข้อความลงบนรูปถ่ายสด
  const applyWatermark = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context is null"));

        canvas.width = img.width;
        canvas.height = img.height;

        // วาดภาพที่ถ่ายได้
        ctx.drawImage(img, 0, 0);

        // คำนวณสเกลตัวอักษรและแถบข้อความตามความละเอียดของภาพ
        const fontSize = Math.max(22, Math.floor(canvas.width * 0.028));
        const padding = fontSize * 0.8;
        const bannerHeight = fontSize * 3.2;

        // วาดแถบลายน้ำโปร่งแสงสีดำด้านล่าง
        ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        // วันที่และเวลาปัจจุบัน (ประทับตรา Timestamp)
        const now = new Date();
        const dateStr = now.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const timeStr = now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // ข้อความหัวเรื่อง
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, sans-serif`;
        const titleText = `📸 หลักฐานส่งมอบของ: ${itemTitle || itemId || "Lost & Found"}`;
        ctx.fillText(titleText, padding, canvas.height - bannerHeight + fontSize * 1.2);

        // ข้อความ Timestamp & Verification
        ctx.fillStyle = "#fbbf24"; // สีเหลืองตัดกับพื้นดำ
        ctx.font = `${Math.floor(fontSize * 0.85)}px "Segoe UI", Roboto, sans-serif`;
        const subText = `🕒 ประทับเวลา: ${dateStr} ${timeStr} น. | ยืนยันตัวตนผู้รับมอบ`;
        ctx.fillText(subText, padding, canvas.height - bannerHeight + fontSize * 2.3);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("แปลงไฟล์รูปภาพไม่สำเร็จ"));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("ไม่สามารถเปิดอ่านไฟล์รูปภาพได้"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setNotice(null);
      const processedBlob = await applyWatermark(file);
      setWatermarkedPhotoBlob(processedBlob);
      setPhotoPreviewUrl(URL.createObjectURL(processedBlob));
    } catch (err: any) {
      console.error("Watermark error:", err);
      setNotice({ type: "error", text: "ไม่สามารถประมวลผลรูปถ่ายและใส่ลายน้ำได้" });
    }
  };

  const clearSignature = () => {
    sigPadRef.current?.clear();
    setNotice(null);
  };

  const handleConfirm = async () => {
    if (!itemId) {
      setNotice({ type: "error", text: "ไม่พบรหัสรายการสิ่งของที่ต้องส่งมอบ" });
      return;
    }

    if (!receiverName.trim()) {
      setNotice({ type: "error", text: "กรุณากรอกชื่อ-นามสกุลผู้รับ" });
      return;
    }

    if (!studentId.trim()) {
      setNotice({ type: "error", text: "กรุณากรอกรหัสนักศึกษา / เลขบัตรประชาชน" });
      return;
    }

    if (!watermarkedPhotoBlob) {
      setNotice({ type: "error", text: "กรุณากด 'ถ่ายรูปส่งมอบ' เพื่อบันทึกรูปภาพสดก่อนยืนยัน" });
      return;
    }

    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      setNotice({ type: "error", text: "กรุณาให้ผู้รับเซ็นชื่อในช่องลายเซ็นก่อนยืนยัน" });
      return;
    }

    if (!pdpaConsent) {
      setNotice({ type: "error", text: "กรุณาทำเครื่องหมายยินยอมเงื่อนไข PDPA ก่อนบันทึก" });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      // 1. ดึงภาพลายเซ็นจาก Canvas
      const sigDataUrl = sigPadRef.current.toDataURL("image/png");
      const sigBlob = await (await fetch(sigDataUrl)).blob();

      // 2. ส่งข้อมูลผ่าน Backend API /api/handover/complete
      const formData = new FormData();
      formData.append("itemId", itemId);
      formData.append("receiverName", receiverName.trim());
      formData.append("receiverStudentId", studentId.trim());
      formData.append("pdpaConsent", "true");
      formData.append("photo", watermarkedPhotoBlob, `handover-${itemId}.jpg`);
      formData.append("signature", sigBlob, `signature-${itemId}.png`);

      const res = await fetch("/api/handover/complete", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setNotice({ type: "success", text: "ส่งมอบของและบันทึกหลักฐานเรียบร้อยแล้ว!" });
      onSuccess?.(result.data?.signatureUrl || "");

      window.setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("Signature confirmation failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง";

      setNotice({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 my-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500">
              Handover Process
            </p>
            <h3 className="mt-0.5 text-xl font-black text-slate-900">
              ยืนยันการส่งมอบสิ่งของ
            </h3>
            <p className="text-xs text-slate-500">
              ถ่ายรูปสดพร้อมลายน้ำ + เซ็นชื่อรับของ + ยินยอม PDPA
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* ข้อมูลผู้รับ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                ชื่อ-นามสกุล ผู้รับ <span className="text-rose-500">*</span>
              </label>
              <input
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                รหัสนักศึกษา / เลขบัตร <span className="text-rose-500">*</span>
              </label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="เช่น 6612345678"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>
          </div>

          {/* 1. ปุ่มถ่ายรูปส่งมอบ (บังคับเปิดกล้องสด capture="environment") */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                1. ถ่ายรูปส่งมอบ (สิ่งของ + ผู้รับ) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-amber-600">
                ประทับตราเวลา (Watermark) อัตโนมัติ
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {!photoPreviewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 py-5 text-rose-600 transition hover:bg-rose-50 active:scale-[0.99]"
              >
                <div className="rounded-full bg-rose-100 p-3 text-rose-600 mb-1.5 shadow-sm">
                  <Camera size={26} />
                </div>
                <span className="text-sm font-bold">กดเพื่อเปิดกล้องสดถ่ายรูปส่งมอบ</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  (ระบบจะเปิดกล้องหลังสดทันที ไม่อนุญาตให้เลือกภาพจาก Gallery)
                </span>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-inner bg-slate-900">
                <img
                  src={photoPreviewUrl}
                  alt="Watermarked Handover"
                  className="h-44 w-full object-contain sm:object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-slate-900"
                >
                  <RefreshCw size={13} /> ถ่ายใหม่
                </button>
              </div>
            )}
          </div>

          {/* 2. หน้าจอ Canvas สำหรับเซ็นชื่อดิจิทัล */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                2. ลายมือชื่อดิจิทัลของผู้รับ (Digital Signature) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline"
              >
                ล้าง / เซ็นใหม่
              </button>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-1.5">
              <SignatureCanvas
                ref={sigPadRef}
                canvasProps={{
                  className: "h-32 w-full rounded-xl bg-white shadow-inner cursor-crosshair",
                }}
                backgroundColor="white"
                penColor="#0f172a"
              />
            </div>
          </div>

          {/* 3. กล่องข้อความยินยอมเงื่อนไข PDPA */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold text-blue-900">
                  การให้ความยินยอมข้อมูลส่วนบุคคล (PDPA Consent)
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  ข้าพเจ้ายินยอมให้บันทึกภาพถ่าย ลายมือชื่อ และข้อมูลประจำตัว เพื่อใช้เป็นหลักฐานยืนยันการรับมอบสิ่งของตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 โดยข้อมูลจะถูกเก็บเป็นความลับเพื่อใช้ในการตรวจสอบความถูกต้องเท่านั้น
                </p>
                <label className="flex items-center gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdpaConsent}
                    onChange={(e) => setPdpaConsent(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                  />
                  <span>ข้าพเจ้าได้ตรวจสอบและยินยอมตามเงื่อนไข PDPA ทั้งหมด</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {notice && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-xs font-medium ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-400 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span>กำลังบันทึกข้อมูล...</span>
            ) : (
              <>
                <CheckCircle2 size={16} /> ยืนยันการส่งมอบ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
