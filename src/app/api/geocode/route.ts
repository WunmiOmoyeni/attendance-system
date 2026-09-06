
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://nominatim.openstreetmap.org/search"
    );

    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "ng");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "AttendanceManagementSystem/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Nominatim response:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        { error: "Address search service failed" },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding error:", error);

    return NextResponse.json(
      { error: "Failed to search for address" },
      { status: 500 }
    );
  }
}

