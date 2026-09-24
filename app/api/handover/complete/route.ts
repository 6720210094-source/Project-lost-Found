import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    `http://localhost:${process.env.PORT || 3000}`
  ).replace(/\/$/, "");
}

async function uploadToSupabaseOrLocal(
  supabase: any,
  bucketName: string,
  fileName: string,
  fileBytes: ArrayBuffer,
  contentType: string
): Promise<string> {
  const buffer = Buffer.from(fileBytes);

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    } else {
      console.warn(
        `Supabase storage upload failed for bucket ${bucketName}, falling back to local storage:`,
        uploadError.message
      );
    }
  } catch (err) {
    console.warn(`Supabase storage exception for bucket ${bucketName}:`, err);
  }

  // Fallback to local storage (e.g. public/uploads/...)
  const uploadDir = path.join(process.cwd(), "public", "uploads", bucketName);
  await mkdir(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, buffer);

  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/${bucketName}/${safeName}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. ตรวจสอบ Session ผู้ใช้
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำรายการส่งมอบ" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const itemId = formData.get("itemId") as string;
    const receiverName = (formData.get("receiverName") as string)?.trim();
    const receiverStudentId = ((formData.get("receiverStudentId") || formData.get("receiverIdCard")) as string)?.trim() || null;
    const pdpaConsent = formData.get("pdpaConsent") === "true";
    const photoFile = formData.get("photo") as File | null;
    const signatureFile = formData.get("signature") as File | null;

    if (!itemId) {
      return NextResponse.json({ error: "ไม่พบรหัสสิ่งของ (itemId)" }, { status: 400 });
    }

    if (!receiverName) {
      return NextResponse.json({ error: "กรุณาระบุชื่อผู้รับมอบ" }, { status: 400 });
    }

    if (!photoFile) {
      return NextResponse.json({ error: "กรุณาแนบภาพถ่ายส่งมอบ" }, { status: 400 });
    }

    if (!signatureFile) {
      return NextResponse.json({ error: "กรุณาแนบลายมือชื่อผู้รับ" }, { status: 400 });
    }

    if (!pdpaConsent) {
      return NextResponse.json(
        { error: "จำเป็นต้องยินยอมเงื่อนไข PDPA ก่อนบันทึกข้อมูล" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const completedAt = new Date().toISOString();

    // 2. อัปโหลดรูปถ่ายหลักฐานส่งมอบ (มี Watermark)
    const photoBytes = await photoFile.arrayBuffer();
    const photoFileName = `${itemId}/handover-${timestamp}.jpg`;
    const photoUrl = await uploadToSupabaseOrLocal(
      supabase,
      "handover-photos",
      photoFileName,
      photoBytes,
      "image/jpeg"
    );

    // 3. อัปโหลดรูปลายเซ็นดิจิทัล
    const sigBytes = await signatureFile.arrayBuffer();
    const sigFileName = `${itemId}/signature-${timestamp}.png`;
    const signatureUrl = await uploadToSupabaseOrLocal(
      supabase,
      "signatures",
      sigFileName,
      sigBytes,
      "image/png"
    );

    // 4. บันทึกข้อมูลลงตาราง handover_proofs
    const handoverPayload = {
      item_id: itemId,
      receiver_id: user.id,
      receiver_name: receiverName,
      receiver_student_id: receiverStudentId,
      proof_image_url: photoUrl,
      signature_url: signatureUrl,
      status: "completed",
      completed_at: completedAt,
      pdpa_consent: true,
      pdpa_consent_at: completedAt,
    };

    const { error: handoverError } = await supabase
      .from("handover_proofs")
      .upsert(handoverPayload, { onConflict: "item_id" });

    if (handoverError) {
      console.error("handover_proofs upsert error:", handoverError);
      // ลอง fallback ในกรณีที่ column pdpa_consent ยังไม่ได้สร้างในตาราง
      const fallbackPayload = {
        item_id: itemId,
        receiver_id: user.id,
        receiver_name: receiverName,
        receiver_student_id: receiverStudentId,
        proof_image_url: photoUrl,
        signature_url: signatureUrl,
        status: "completed",
        completed_at: completedAt,
      };
      const { error: fallbackError } = await supabase
        .from("handover_proofs")
        .upsert(fallbackPayload, { onConflict: "item_id" });

      if (fallbackError) {
        throw fallbackError;
      }
    }

    // 5. อัปเดตสถานะของเคสในตาราง items เป็น 'RESOLVED'
    const { error: itemUpdateError } = await supabase
      .from("items")
      .update({
        status: "RESOLVED",
        signature_url: signatureUrl,
        completed_at: completedAt,
      })
      .eq("id", itemId);

    if (itemUpdateError) {
      console.error("items table status update error:", itemUpdateError);
      throw itemUpdateError;
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกการส่งมอบสิ่งของสำเร็จเรียบร้อย",
      data: {
        itemId,
        photoUrl,
        signatureUrl,
        completedAt,
        receiverName,
        receiverStudentId,
        userId: user.id,
      },
    });
  } catch (error: any) {
    console.error("Handover completion API error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการบันทึกการส่งมอบ" },
      { status: 500 }
    );
  }
}
