import { requireAdmin } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, error } = await requireAdmin();

  if (error === "UNAUTHENTICATED") {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 }
    );
  }

  if (error === "FORBIDDEN") {
    return NextResponse.json(
      {
        error: "Admin access required",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Welcome, admin!",
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
    },
  });
}