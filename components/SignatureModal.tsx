"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/lib/supabase";

const SIGNATURE_BUCKET = "signatures";

type SignatureModalProps = {
  isOpen: boolean;
  itemId?: string;
  onClose: () => void;
  onSuccess?: (signatureUrl: string) => void;
};

export default function SignatureModal({
  isOpen,
  itemId,
  onClose,
  onSuccess,
}: SignatureModalProps) {
  const sigPadRef = useRef<SignatureCanvas | null>(null);

  const [loading, setLoading] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [studentId, setStudentId] = useState("");

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // โหลดข้อมูลผู้รับเมื่อเปิด Modal
  useEffect(() => {
    if (!isOpen) return;

    setNotice(null);
    setLoading(false);
    setStudentId("");

    // ล้างลายเซ็นเดิม
    setTimeout(() => {
      sigPadRef.current?.clear();
    }, 0);

    const loadReceiverName = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("users")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Load receiver name failed:", error);
        }

        setReceiverName(
          data?.name ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            ""
        );
      } catch (error) {
        console.error("Load receiver failed:", error);
      }
    };

    void loadReceiverName();
  }, [isOpen]);

  // ล้างลายเซ็น
  const clearSignature = () => {
    sigPadRef.current?.clear();
    setNotice(null);
  };

  // ยืนยันการรับของ
  const handleConfirm = async () => {
    // ตรวจสอบ item
    if (!itemId) {
      setNotice({
        type: "error",
        text: "ไม่พบรายการของที่ต้องส่งมอบ",
      });
      return;
    }

    // ตรวจสอบชื่อผู้รับ
    if (!receiverName.trim()) {
      setNotice({
        type: "error",
        text: "กรุณากรอกชื่อผู้รับ",
      });
      return;
    }

    // ตรวจสอบรหัสนักศึกษา
    if (!studentId.trim()) {
      setNotice({
        type: "error",
        text: "กรุณากรอกรหัสนักศึกษา",
      });
      return;
    }

    // ตรวจสอบลายเซ็น
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      setNotice({
        type: "error",
        text: "กรุณาเซ็นชื่อก่อนยืนยัน",
      });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      // =====================================================
      // 1. ตรวจสอบผู้ใช้ที่ Login
      // =====================================================
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนยืนยันรับของ");
      }

      // =====================================================
      // 2. แปลงลายเซ็นเป็นไฟล์ PNG
      // =====================================================
      const dataUrl = sigPadRef.current.toDataURL("image/png");

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `signature-${itemId}-${Date.now()}.png`,
        {
          type: "image/png",
        }
      );

      // =====================================================
      // 3. Upload ลายเซ็นไป Supabase Storage
      // =====================================================
      const filePath = `signatures/${itemId}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from(SIGNATURE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/png",
        });

      if (uploadError) {
        console.error("Signature upload failed:", uploadError);

        if (
          uploadError.message?.toLowerCase().includes("bucket not found")
        ) {
          throw new Error(
            "ยังไม่มี Storage Bucket ชื่อ signatures ใน Supabase"
          );
        }

        throw new Error(
          uploadError.message ||
            "ไม่สามารถอัปโหลดลายเซ็นได้"
        );
      }

      // =====================================================
      // 4. สร้าง URL ของลายเซ็น
      // =====================================================
      const { data: publicUrlData } = supabase.storage
        .from(SIGNATURE_BUCKET)
        .getPublicUrl(filePath);

      const signatureUrl =
        publicUrlData?.publicUrl || "";

      if (!signatureUrl) {
        throw new Error(
          "ไม่สามารถสร้าง URL สำหรับลายเซ็นได้"
        );
      }

      // วันเวลาส่งมอบ
      const completedAt = new Date().toISOString();

      // =====================================================
      // 5. บันทึกข้อมูลการส่งมอบลง handover_proofs
      // =====================================================
      const { error: handoverError } = await supabase
        .from("handover_proofs")
        .upsert(
          {
            item_id: itemId,

            // ไม่มีผู้ส่ง
            giver_id: null,

            // ผู้รับคือผู้ใช้ที่ Login อยู่
            receiver_id: user.id,

            // ข้อมูลผู้รับ
            receiver_name: receiverName.trim(),
            receiver_student_id: studentId.trim(),

            // ลายเซ็น
            proof_image_url: signatureUrl,

            // ไม่ใช้ verification code
            verification_code: null,

            // สถานะการส่งมอบ
            status: "completed",

            // วันและเวลารับของ
            completed_at: completedAt,
          },
          {
            onConflict: "item_id",
            ignoreDuplicates: false,
          }
        );

      if (handoverError) {
        console.error(
          "handover_proofs save failed:",
          handoverError
        );

        throw new Error(
          handoverError.message ||
            "ไม่สามารถบันทึกข้อมูลการส่งมอบได้"
        );
      }

      // =====================================================
      // 6. เปลี่ยนสถานะรายการใน items
      //
      // สำคัญ:
      // ไม่ใส่ completed_at ตรงนี้
      // เพราะ items ไม่มี column completed_at
      // =====================================================
      const { error: itemUpdateError } = await supabase
        .from("items")
        .update({
          status: "RESOLVED",
        })
        .eq("id", itemId);

      if (itemUpdateError) {
        console.error(
          "items status update failed:",
          itemUpdateError
        );

        throw new Error(
          itemUpdateError.message ||
            "ไม่สามารถเปลี่ยนสถานะรายการเป็นส่งมอบแล้วได้"
        );
      }

      // =====================================================
      // 7. แจ้งว่าส่งมอบสำเร็จ
      // =====================================================
      setNotice({
        type: "success",
        text: "ส่งมอบของเรียบร้อยแล้ว",
      });

      // แจ้ง Component แม่ว่าการส่งมอบสำเร็จ
      onSuccess?.(signatureUrl);

      // ปิด Modal หลังจากแสดงข้อความสำเร็จ
      window.setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      // =====================================================
      // Error handling
      // =====================================================
      console.error(
        "Signature confirmation failed:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง";

      setNotice({
        type: "error",
        text: message,
      });
    } finally {
      // หยุด Loading ไม่ว่าจะสำเร็จหรือเกิด Error
      setLoading(false);
    }
  };

  // ถ้า Modal ไม่เปิด ไม่ต้องแสดง
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-500">
              Handover Confirmation
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              ยืนยันการรับของคืน
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              กรอกข้อมูลผู้รับและเซ็นชื่อเพื่อยืนยันการรับของ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            ปิด
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* ชื่อผู้รับ */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              ชื่อผู้รับ
            </label>

            <input
              value={receiverName}
              onChange={(e) =>
                setReceiverName(e.target.value)
              }
              placeholder="กรอกชื่อ-นามสกุล"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
            />
          </div>

          {/* รหัสนักศึกษา */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              รหัสนักศึกษา
            </label>

            <input
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
              placeholder="เช่น 6612345678"
              inputMode="numeric"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
            />
          </div>

          {/* ลายเซ็น */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="block text-sm font-semibold text-slate-700">
                ลายเซ็นผู้รับ
              </label>

              <span className="text-xs text-slate-400">
                เซ็นในช่องด้านล่าง
              </span>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-2">
              <SignatureCanvas
                ref={sigPadRef}
                canvasProps={{
                  className:
                    "h-[220px] w-full rounded-xl bg-white shadow-inner",
                }}
                backgroundColor="white"
                penColor="black"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={clearSignature}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            ล้าง / เซ็นใหม่
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading
              ? "กำลังบันทึก..."
              : "ยืนยันรับของ"}
          </button>
        </div>

        {/* Notice */}
        {notice && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
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