import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL is not set" },
        { status: 500 }
      );
    }

    // Simple DB ping
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ ok: true, message: "DB connection OK" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
