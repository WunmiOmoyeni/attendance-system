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

    const attendance = await prisma.attendance.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    return NextResponse.json({
      attendance,
    });
  } catch (error) {
    console.error("Attendance history error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}