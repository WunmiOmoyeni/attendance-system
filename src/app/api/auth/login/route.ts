import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import { createSession } from "@/src/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.email || !body.password) {
            return NextResponse.json(
                {
                    error: "Email and password are required",
                },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                {
                    error: "Your account has been deactivated",
                },
                { status: 403 }
            );
        }

        const passwordMatches = await bcrypt.compare(
            body.password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    error: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        const token = await createSession({
            id: user.id,
            role: user.role,
        });

        const response = NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                locationId: user.locationId,
            },
        });

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        return response;
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