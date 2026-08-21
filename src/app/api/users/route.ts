import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
    },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const users = await prisma.user.findMany();

  return NextResponse.json(users);
}