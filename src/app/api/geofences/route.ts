import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/geofences - List all geofences
export async function GET() {
  try {
    const geofences = await db.geofence.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ geofences });
  } catch (error) {
    console.error("Error fetching geofences:", error);
    return NextResponse.json({ error: "Failed to fetch geofences" }, { status: 500 });
  }
}

// POST /api/geofences - Create a new geofence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, type, centerLat, centerLng, radius, departmentId, polygon } = body;

    const company = await db.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company found. Please seed the database first." }, { status: 400 });
    }

    const geofence = await db.geofence.create({
      data: {
        name,
        address,
        type: type || "office",
        centerLat: parseFloat(centerLat),
        centerLng: parseFloat(centerLng),
        radius: parseFloat(radius) || 200,
        isActive: true,
        companyId: company.id,
        departmentId: departmentId || null,
        polygon: polygon || null,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ geofence }, { status: 201 });
  } catch (error) {
    console.error("Error creating geofence:", error);
    return NextResponse.json({ error: "Failed to create geofence" }, { status: 500 });
  }
}

// PUT /api/geofences - Update a geofence
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Geofence ID is required" }, { status: 400 });
    }

    const geofence = await db.geofence.update({
      where: { id },
      data: {
        ...data,
        centerLat: data.centerLat ? parseFloat(data.centerLat) : undefined,
        centerLng: data.centerLng ? parseFloat(data.centerLng) : undefined,
        radius: data.radius ? parseFloat(data.radius) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ geofence });
  } catch (error) {
    console.error("Error updating geofence:", error);
    return NextResponse.json({ error: "Failed to update geofence" }, { status: 500 });
  }
}

// DELETE /api/geofences?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Geofence ID is required" }, { status: 400 });
    }

    await db.geofence.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting geofence:", error);
    return NextResponse.json({ error: "Failed to delete geofence" }, { status: 500 });
  }
}
