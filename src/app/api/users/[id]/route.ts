import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
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
      include: {
        location: true,
      },
    });

    return NextResponse.json(user);
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