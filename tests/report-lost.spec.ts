import { test, expect } from "@playwright/test";

test.describe("ฟังก์ชันที่ 1: หน้าแจ้งของหาย (Report Lost Item)", () => {
  test.beforeEach(async ({ page }) => {
    // ไปที่หน้าแจ้งของหาย
    await page.goto("/report-lost");
  });

  test("1.1 ตรวจสอบการแสดงผลองค์ประกอบหลักของหน้าแจ้งของหาย", async ({ page }) => {
    // ตรวจสอบหัวข้อหน้าและข้อความต้อนรับ
    await expect(page.locator("h1")).toContainText("แจ้งของหาย");
    await expect(page.locator("text=Report Lost Item")).toBeVisible();
    await expect(
      page.locator("text=กรอกข้อมูลสิ่งของที่หาย เพื่อให้ผู้ที่พบสามารถติดต่อคุณได้")
    ).toBeVisible();

    // ตรวจสอบฟิลด์กรอกข้อมูล
    const titleInput = page.locator('input[placeholder="เช่น iPhone 15 สีดำ"]');
    await expect(titleInput).toBeVisible();

    const categorySelect = page.locator("select");
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toHaveValue("อุปกรณ์อิเล็กทรอนิกส์");

    const locationInput = page.locator(
      'input[placeholder="เช่น ห้องสมุด อาคารเรียนรวม โรงอาหาร"]'
    );
    await expect(locationInput).toBeVisible();

    const descriptionInput = page.locator(
      'textarea[placeholder="ระบุสี ยี่ห้อ ลักษณะ หรือข้อมูลที่ช่วยระบุสิ่งของ..."]'
    );
    await expect(descriptionInput).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // ตรวจสอบปุ่มดำเนินการ
    const submitBtn = page.locator('button[type="submit"]', { hasText: "ส่งแจ้งของหาย" });
    await expect(submitBtn).toBeVisible();

    const cancelBtn = page.locator('a[href="/lost"]', { hasText: "ยกเลิก" });
    await expect(cancelBtn).toBeVisible();
  });

  test("1.2 ตรวจสอบตัวเลือกหมวดหมู่สิ่งของ (Category Dropdown)", async ({ page }) => {
    const categorySelect = page.locator("select");
    const categories = [
      "อุปกรณ์อิเล็กทรอนิกส์",
      "กระเป๋า",
      "เอกสาร",
      "เสื้อผ้า",
      "ของใช้ส่วนตัว",
      "อื่น ๆ",
    ];

    for (const category of categories) {
      await categorySelect.selectOption(category);
      await expect(categorySelect).toHaveValue(category);
    }
  });

  test("1.3 ตรวจสอบการกรอกข้อมูลในฟอร์มแจ้งของหาย", async ({ page }) => {
    const titleInput = page.locator('input[placeholder="เช่น iPhone 15 สีดำ"]');
    const locationInput = page.locator(
      'input[placeholder="เช่น ห้องสมุด อาคารเรียนรวม โรงอาหาร"]'
    );
    const descInput = page.locator(
      'textarea[placeholder="ระบุสี ยี่ห้อ ลักษณะ หรือข้อมูลที่ช่วยระบุสิ่งของ..."]'
    );
    const categorySelect = page.locator("select");

    // กรอกข้อมูลทดสอบ
    await titleInput.fill("หูฟัง AirPods Pro 2");
    await categorySelect.selectOption("อุปกรณ์อิเล็กทรอนิกส์");
    await locationInput.fill("อาคารบรรณสาร ชั้น 3");
    await descInput.fill("เคสสีขาว มีสติกเกอร์รูปแมวสีส้มติดอยู่ด้านหลัง");

    // ตรวจสอบค่าที่กรอก
    await expect(titleInput).toHaveValue("หูฟัง AirPods Pro 2");
    await expect(locationInput).toHaveValue("อาคารบรรณสาร ชั้น 3");
    await expect(descInput).toHaveValue(
      "เคสสีขาว มีสติกเกอร์รูปแมวสีส้มติดอยู่ด้านหลัง"
    );
  });

  test("1.4 ตรวจสอบระบบรักษาความปลอดภัย: เตือนเมื่อยังไม่ได้เข้าสู่ระบบก่อนแจ้ง", async ({ page }) => {
    // กรอกข้อมูลแบบครบถ้วนขณะยังไม่ได้เข้าสู่ระบบ (Guest / Not logged in)
    await page.locator('input[placeholder="เช่น iPhone 15 สีดำ"]').fill("กระเป๋าสตางค์สีน้ำตาล");
    await page.locator('input[placeholder="เช่น ห้องสมุด อาคารเรียนรวม โรงอาหาร"]').fill("โรงอาหารกลาง");
    await page.locator('textarea[placeholder="ระบุสี ยี่ห้อ ลักษณะ หรือข้อมูลที่ช่วยระบุสิ่งของ..."]').fill("มีบัตรประชาชนและบัตรนักศึกษา");

    // กดปุ่มส่งข้อมูล
    const submitBtn = page.locator('button[type="submit"]', { hasText: "ส่งแจ้งของหาย" });
    await submitBtn.click();

    // ระบบต้องแสดงข้อความเตือนให้เข้าสู่ระบบ
    const errorAlert = page.locator("text=กรุณาเข้าสู่ระบบก่อนทำการแจ้งรายการ");
    await expect(errorAlert).toBeVisible();
  });
});
