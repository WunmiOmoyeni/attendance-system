import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          error: "Name and email are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json(user, { status: 201 });
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

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      location: true,
    },
  });

  return NextResponse.json(users);
}

