import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { calculateDistance } from "@/src/lib/distance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    if (user.role !== "EMPLOYEE") {
      return NextResponse.json(
        {
          error: "Only employees can clock in",
        },
        { status: 403 }
      );
    }

    if (!user.locationId) {
      return NextResponse.json(
        {
          error: "You do not have an assigned location",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          error: "Valid latitude and longitude are required",
        },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({
      where: {
        id: user.locationId,
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          error: "Assigned location not found",
        },
        { status: 404 }
      );
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );

    if (distance > location.radius) {
      return NextResponse.json(
        {
          error: "You are outside the allowed attendance area",
          distance: Math.round(distance),
          allowedRadius: location.radius,
        },
        { status: 403 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        locationId: location.id,
        clockIn: new Date(),
        clockInLatitude: latitude,
        clockInLongitude: longitude,
      },
    });

    return NextResponse.json(
      {
        message: "Clock-in successful",
        attendance,
        distance: Math.round(distance),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}