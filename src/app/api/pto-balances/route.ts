import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/pto-balances?userId=xxx&year=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (userId) {
      const balance = await db.pTOBalance.findUnique({
        where: { employeeId_year: { employeeId: userId, year } },
      });
      return NextResponse.json({ balance });
    }

    const balances = await db.pTOBalance.findMany({
      where: { year },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      },
    });

    return NextResponse.json({ balances });
  } catch (error) {
    console.error("Error fetching PTO balances:", error);
    return NextResponse.json({ error: "Failed to fetch PTO balances" }, { status: 500 });
  }
}
