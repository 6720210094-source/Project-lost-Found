"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

const SIGNATURE_BUCKET = "signatures";

interface Item {
  id: string;
  title: string;
  type: string;
  status: string;
  image_url?: string | null;
  signature_url?: string | null;
  completed_at?: string | null;
  user_id: string;
  location?: string | null;
  description?: string | null;
  created_at: string;
}

interface UserRecord {
  id: string;
  email?: string | null;
  name?: string | null;
}

export default function HandoverPage() {
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user);
    };

    const loadItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, title, type, status, image_url, signature_url, completed_at, user_id, location, description, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(data as Item[]);
        if (data[0]) {
          setSelectedItemId(data[0].id);
        }
      }
    };

    const loadUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, email, name");
      if (!error && data) {
        setUsers(data as UserRecord[]);
      }
    };

    void loadUser();
    void loadItems();
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedItem || !user) return;

    const defaultReceiver = users.find(
      (person) => person.id !== user.id && person.id !== selectedItem.user_id
    );

    setReceiverId(defaultReceiver?.id ?? user.id);
  }, [selectedItem, user, users]);

  const clearSignature = () => {
    sigPadRef.current?.clear();
    setError("");
  };

  const generateVerificationCode = () => {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
  };

  const handleConfirmSignature = async () => {
    if (!selectedItem) {
      setError("กรุณาเลือกรายการที่ต้องยืนยันก่อน");
      return;
    }

    if (!user) {
      setError("กรุณาเข้าสู่ระบบก่อนยืนยันการส่งมอบ");
      return;
    }

    if (!receiverId || receiverId === user.id || receiverId === selectedItem.user_id) {
      setError("กรุณาเลือกผู้รับที่ถูกต้องก่อนยืนยันการส่งมอบ");
      return;
    }

    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      setError("กรุณาเซ็นชื่อก่อนยืนยันรับส่งของคืน");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const dataUrl = sigPadRef.current.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File(
        [blob],
        `handover-signature-${selectedItem.id}-${Date.now()}.png`,
        { type: "image/png" }
      );

      const filePath = `signatures/${selectedItem.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from(SIGNATURE_BUCKET).upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/png",
      });

      if (uploadError) {
        console.error("Storage upload failed:", uploadError);
        if (uploadError.message?.includes("Bucket not found")) {
          throw new Error("Bucket 'signatures' ยังไม่มีใน Supabase โปรดสร้าง bucket ชื่อ 'signatures' ก่อนใช้งาน");
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from(SIGNATURE_BUCKET).getPublicUrl(filePath);
      let signatureUrl = publicUrlData?.publicUrl ?? "";

      if (!signatureUrl) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(SIGNATURE_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24);

        if (signedError) {
          console.error("Signed URL generation failed:", signedError);
          throw signedError;
        }

        signatureUrl = signedData?.signedUrl ?? "";
      }

      if (!signatureUrl) {
        throw new Error("ไม่สามารถสร้าง URL สำหรับลายเซ็นได้");
      }

      const completedAt = new Date().toISOString();
      const verificationCode = generateVerificationCode();
      const handoverPayload = {
        item_id: selectedItem.id,
        giver_id: selectedItem.user_id,
        receiver_id: receiverId,
        proof_image_url: signatureUrl,
        verification_code: verificationCode,
        status: "completed",
        completed_at: completedAt,
      };

      console.log("Submitting handover proof payload:", handoverPayload);

      const { error: handoverInsertError } = await supabase
        .from("handover_proofs")
        .upsert(handoverPayload, { onConflict: "item_id", ignoreDuplicates: false });

      if (handoverInsertError) {
        console.error("handover_proofs insert/upsert failed:", handoverInsertError);
        throw handoverInsertError;
      }

      const { error: itemUpdateError } = await supabase
        .from("items")
        .update({
          status: "RESOLVED",
          signature_url: signatureUrl,
          completed_at: completedAt,
        })
        .eq("id", selectedItem.id);

      if (itemUpdateError) {
        console.error("items update failed:", itemUpdateError);
        throw itemUpdateError;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, status: "RESOLVED", signature_url: signatureUrl, completed_at: completedAt }
            : item
        )
      );

      setProofImageUrl(signatureUrl);
      setMessage(`ยืนยันการรับส่งของคืนสำเร็จแล้ว รหัสยืนยัน: ${verificationCode}`);
      sigPadRef.current?.clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      console.error("Handover confirmation failed:", err);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🔒</div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">กรุณาเข้าสู่ระบบก่อนใช้งาน</h1>
            <p className="mt-2 text-slate-600">เพื่อยืนยันการรับส่งของคืนต้องเข้าสู่ระบบก่อน</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-500">Handover Confirmation</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              ยืนยันการรับส่งของคืน
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              ตรวจสอบรายการที่ต้องส่งคืน ยืนยันผู้รับ และบันทึกลายเซ็นดิจิทัลเพื่อเป็นหลักฐานการส่งคืนที่ชัดเจน
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">รายการที่ต้องยืนยัน</h2>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
                Active
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                กำลังโหลดรายการ…
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                ยังไม่มีรายการที่รอการยืนยันส่งคืน
              </div>
            ) : (
              <>
                <label className="mb-2 block text-sm font-medium text-slate-700">เลือกสิ่งของ</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-rose-400 focus:bg-white"
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.type === "LOST" ? "ของหาย" : "ของพบ"})
                    </option>
                  ))}
                </select>

                {selectedItem && (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="grid md:grid-cols-[180px_1fr]">
                      <div className="h-44 bg-slate-100">
                        {selectedItem.image_url ? (
                          <img src={selectedItem.image_url} alt={selectedItem.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl">📦</div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                            {selectedItem.type === "LOST" ? "ของหาย" : "ของพบ"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                              selectedItem.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {selectedItem.status === "completed" ? "ส่งคืนแล้ว" : "รอการยืนยัน"}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-bold text-slate-900">{selectedItem.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">📍 {selectedItem.location || "ไม่ระบุตำแหน่ง"}</p>
                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {selectedItem.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                        </p>

                        {selectedItem.signature_url && (
                          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                              Signature Proof
                            </p>
                            <img
                              src={selectedItem.signature_url}
                              alt="signature proof"
                              className="mt-3 h-24 w-full rounded-xl border border-emerald-200 bg-white object-contain p-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-500">Digital Signature</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">ยืนยันลายเซ็นรับของคืน</h2>
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

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearSignature}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                ล้าง / เซ็นใหม่
              </button>

              <button
                type="button"
                onClick={handleConfirmSignature}
                disabled={uploading || !selectedItem}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {uploading ? "กำลังบันทึก..." : "ยืนยัน"}
              </button>
            </div>

            {selectedItem && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">ผู้ส่ง</span>
                  <span>{selectedItem.user_id}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">ผู้รับ</span>
                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-2/3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-rose-400"
                  >
                    {users
                      .filter((person) => person.id !== user.id && person.id !== selectedItem.user_id)
                      .map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name || person.email || person.id}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {proofImageUrl && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  หลักฐานปัจจุบัน
                </p>
                <img
                  src={proofImageUrl}
                  alt="current signature proof"
                  className="mt-3 h-28 w-full rounded-xl border border-emerald-200 bg-white object-contain p-2"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
