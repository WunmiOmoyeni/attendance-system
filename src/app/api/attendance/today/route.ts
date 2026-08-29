import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        clockIn: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    if (!attendance) {
      return NextResponse.json({
        status: "NOT_CLOCKED_IN",
        attendance: null,
      });
    }

    if (!attendance.clockOut) {
      return NextResponse.json({
        status: "CLOCKED_IN",
        attendance,
      });
    }

    return NextResponse.json({
      status: "COMPLETED",
      attendance,
    });
  } catch (error) {
    console.error("Today's attendance error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}