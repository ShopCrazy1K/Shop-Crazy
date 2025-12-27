import { NextResponse } from "next/server";
import { getHolidayTheme } from "@/lib/holidayTheme";
import { getMonthlyTheme } from "@/lib/theme";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const today = new Date();
  const holiday = getHolidayTheme();
  const monthly = getMonthlyTheme();
  
  return NextResponse.json({
    date: {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
      fullDate: today.toISOString(),
    },
    holidayTheme: holiday,
    activeTheme: monthly,
    shouldBeWinter: today.getMonth() + 1 === 12 && today.getDate() >= 26 && today.getDate() < 31,
  });
}

