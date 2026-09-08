
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: body.email,
        NOT: {
          id,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Another user already has this email",
        },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        email: body.email,
        location: body.locationId
          ? {
              connect: {
                id: body.locationId,
              },
            }
          : {
              disconnect: true,
            },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        location: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update employee error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

