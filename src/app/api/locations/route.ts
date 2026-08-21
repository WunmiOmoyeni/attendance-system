import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.name ||
      !body.address ||
      body.latitude === undefined ||
      body.longitude === undefined ||
      body.radius === undefined
    ) {
      return NextResponse.json(
        {
          error: "Name, address, latitude, longitude and radius are required",
        },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name: body.name,
        address: body.address,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        radius: Number(body.radius),
      },
    });

    return NextResponse.json(location, { status: 201 });
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
  try {
    const locations = await prisma.location.findMany();

    return NextResponse.json(locations);
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