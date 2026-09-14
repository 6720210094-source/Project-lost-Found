import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    `http://localhost:${process.env.PORT || 3000}`
  ).replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ไฟล์ไม่ถูกต้อง" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์ภาพ JPG, PNG, WEBP, GIF" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uploadDir = path.join(process.cwd(), "public", "uploads", "items");
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const relativePath = `/uploads/items/${safeName}`;
    const filePath = path.join(uploadDir, safeName);

    await writeFile(filePath, Buffer.from(bytes));

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${relativePath}`;

    return NextResponse.json({
      url,
      path: relativePath,
      fileName: safeName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดระหว่างอัปโหลดภาพ" }, { status: 500 });
  }
}
