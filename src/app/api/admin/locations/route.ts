import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    const locations = await prisma.location.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            users: true,
            attendances: true,
          },
        },
      },
    });

    return NextResponse.json({
      locations,
    });
  } catch (error) {
    console.error("Admin locations error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      address,
      latitude,
      longitude,
      radius,
    } = body;

    if (
      !name ||
      !address ||
      latitude === undefined ||
      longitude === undefined ||
      radius === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Name, address, latitude, longitude, and radius are required",
        },
        { status: 400 }
      );
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      typeof radius !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Latitude, longitude, and radius must be numbers",
        },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: "Invalid latitude" },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Invalid longitude" },
        { status: 400 }
      );
    }

    if (radius <= 0) {
      return NextResponse.json(
        { error: "Radius must be greater than 0" },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        address,
        latitude,
        longitude,
        radius,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Create location error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}