import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/settings - Return current company settings (create default if none exists)
export async function GET() {
  try {
    // Find the first company
    const company = await db.company.findFirst();

    if (!company) {
      return NextResponse.json(
        { error: "No company found. Please seed the database first." },
        { status: 404 }
      );
    }

    // Find or create settings
    let settings = await db.companySettings.findUnique({
      where: { companyId: company.id },
    });

    if (!settings) {
      settings = await db.companySettings.create({
        data: {
          companyId: company.id,
          companyName: company.name,
          companyAddress: company.address ?? "",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings (accept partial updates)
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Find the first company
    const company = await db.company.findFirst();

    if (!company) {
      return NextResponse.json(
        { error: "No company found. Please seed the database first." },
        { status: 404 }
      );
    }

    // Find or create settings
    let settings = await db.companySettings.findUnique({
      where: { companyId: company.id },
    });

    if (!settings) {
      settings = await db.companySettings.create({
        data: {
          companyId: company.id,
          companyName: company.name,
          companyAddress: company.address ?? "",
          ...body,
        },
      });
    } else {
      // Update only provided fields
      settings = await db.companySettings.update({
        where: { companyId: company.id },
        data: body,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: String(error) },
      { status: 500 }
    );
  }
}
