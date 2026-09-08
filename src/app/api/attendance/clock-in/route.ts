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

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error: "Valid latitude and longitude are required",
        },
        { status: 400 }
      );
  }
    const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      clockIn: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });



  if (existingAttendance) {
    return NextResponse.json(
      {
        error: "You have already clocked in today",
        clockIn: existingAttendance.clockIn,
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

  if (!location.isActive) {
    return NextResponse.json(
      {
        error: "Your assigned location is currently inactive",
      },
      { status: 403 }
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