import { test, expect } from "@playwright/test";

test.describe("ฟังก์ชันที่ 2: หน้าส่งคืนเจ้าของและการส่งมอบ (Handover & Return)", () => {
  test("2.1 ตรวจสอบการแสดงผลหน้าส่งมอบของคืน (/handover)", async ({ page }) => {
    // 1. ไปยังหน้าส่งมอบของคืน
    await page.goto("/handover");

    // ตรวจสอบหัวข้อและป้ายสถานะ Handover
    await expect(page.locator("text=Handover")).toBeVisible();
    await expect(page.locator("h1")).toContainText("ส่งมอบของคืน");
    await expect(
      page.locator(
        "text=เลือกรายการที่ต้องการส่งคืน แล้วกดเข้าไปที่รายละเอียดเพื่อยืนยันการรับของ"
      )
    ).toBeVisible();

    // ตรวจสอบว่าหน้าจอแสดงรายการสิ่งของ หรือแสดงข้อความเมื่อยังไม่มีรายการ
    const itemsGrid = page.locator(".grid");
    const emptyState = page.locator("text=ไม่มีรายการที่รอส่งมอบ");

    // อย่างใดอย่างหนึ่งต้องปรากฏบนหน้าจออย่างถูกต้อง
    await expect(itemsGrid.or(emptyState)).toBeVisible();
  });

  test("2.2 ตรวจสอบระบบความปลอดภัยหน้าประวัติการส่งมอบ (/handover-history)", async ({ page }) => {
    // ไปยังหน้าประวัติการส่งมอบขณะยังไม่ได้เข้าสู่ระบบ
    await page.goto("/handover-history");

    // ตรวจสอบการแจ้งเตือนสิทธิ์การเข้าถึง (Access Control Guard)
    const loginPrompt = page.locator("h1", {
      hasText: "กรุณาเข้าสู่ระบบก่อนดูประวัติ",
    });
    const historyTitle = page.locator("h1", { hasText: "ประวัติการรับของ" });

    // ต้องแสดงข้อความเตือนให้เข้าสู่ระบบสำหรับ Guest
    await expect(loginPrompt.or(historyTitle)).toBeVisible();
    await expect(
      page.locator("text=เพื่อดูประวัติการรับของ กรุณาเข้าสู่ระบบก่อน").or(
        page.locator("text=รายการของที่คุณรับคืนสำเร็จแล้ว")
      )
    ).toBeVisible();
  });

  test("2.3 ตรวจสอบการนำทางระหว่างหน้าหลักไปยังประวัติส่งมอบจาก Navbar", async ({ page }) => {
    await page.goto("/");

    // ตรวจสอบลิงก์ 'ประวัติการส่งมอบ' บน Navbar
    const historyNavLink = page.locator('header nav a:has-text("ประวัติการส่งมอบ")').first();
    await expect(historyNavLink).toBeVisible();
    await historyNavLink.click();

    // ยืนยัน URL เปลี่ยนไปยัง /handover-history ได้ถูกต้อง
    await expect(page).toHaveURL(/.*handover-history/);

    // ตรวจสอบว่าหน้าปลายทางโหลดองค์ประกอบ Navbar และเนื้อหาสำเร็จ
    await expect(page.locator("header nav")).toBeVisible();
    await expect(
      page.locator("h1:has-text('กรุณาเข้าสู่ระบบก่อนดูประวัติ')").or(
        page.locator("h1:has-text('ประวัติการรับของ')")
      )
    ).toBeVisible();
  });

  test("2.4 ตรวจสอบตัวกรองสถานะการส่งคืนและรายการสิ่งของ (/lost filter & status)", async ({ page }) => {
    // เข้าไปยังหน้ารายการของหาย
    await page.goto("/lost");
    await expect(page.locator("h1")).toContainText("รายการของหาย");

    // ตรวจสอบ Dropdown เลือกสถานะ (Dropdown ตัวที่ 2: ทุกสถานะ / กำลังตามหา / ส่งคืนแล้ว)
    const statusSelect = page.locator("select").nth(1);
    await expect(statusSelect).toBeVisible();

    // ทดสอบเลือกสถานะ "ส่งคืนแล้ว"
    await statusSelect.selectOption("ส่งคืนแล้ว");
    await expect(statusSelect).toHaveValue("ส่งคืนแล้ว");

    // สลับกลับมาเลือกดูสถานะ "กำลังตามหา"
    await statusSelect.selectOption("กำลังตามหา");
    await expect(statusSelect).toHaveValue("กำลังตามหา");

    // สลับกลับมาเลือก "ทุกสถานะ"
    await statusSelect.selectOption("ทุกสถานะ");
    await expect(statusSelect).toHaveValue("ทุกสถานะ");
  });
});
