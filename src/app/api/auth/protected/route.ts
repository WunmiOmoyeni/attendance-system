import { getCurrentUser } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "You can access this protected route",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}