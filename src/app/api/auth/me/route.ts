import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { verifySession } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 }
    );
  }

  const session = await verifySession(token);

  if (!session || typeof session.userId !== "string") {
    return NextResponse.json(
      {
        error: "Invalid or expired session",
      },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      location: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        error: "User not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      location: user.location,
    },
  });
}