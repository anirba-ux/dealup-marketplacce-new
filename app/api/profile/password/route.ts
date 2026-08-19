import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    // =========================
    // Validation
    // =========================

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "All password fields are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Get User From Database
    // =========================

    const client = await clientPromise;
    const db = client.db("dealup");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // =========================
    // Verify Current Password
    // =========================

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password as string
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Hash New Password
    // =========================

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // =========================
    // Update Password
    // =========================

    await db.collection("users").updateOne(
      {
        _id: new ObjectId(session.user.id),
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Password Change Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}