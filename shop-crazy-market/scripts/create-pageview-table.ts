import { prisma } from "../lib/prisma";

async function createPageViewTable() {
  try {
    console.log("Creating PageView table...");
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PageView" (
        "id" TEXT NOT NULL,
        "date" DATE NOT NULL DEFAULT CURRENT_DATE,
        "path" TEXT NOT NULL,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        "userId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PageView_date_idx" ON "PageView"("date");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PageView_path_idx" ON "PageView"("path");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PageView_userId_idx" ON "PageView"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PageView_date_path_idx" ON "PageView"("date", "path");
    `);

    console.log("✅ PageView table created successfully!");
    
    // Verify the table exists
    const result = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PageView';`
    );
    
    if (result.length > 0) {
      console.log("✅ Verified: PageView table exists in database");
    } else {
      console.error("❌ Warning: Could not verify table creation");
    }
  } catch (error: any) {
    console.error("Error creating PageView table:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createPageViewTable();