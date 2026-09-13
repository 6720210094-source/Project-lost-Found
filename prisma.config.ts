import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // โหลดตัวแปรจากไฟล์ .env เข้า process.env

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
});