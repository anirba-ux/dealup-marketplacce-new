import { NextRequest, NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

// =====================================
// Normalize Phone
// =====================================

function normalizePhone(phone: string): string | null {
  const cleaned = phone
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/[()]/g, "");

  // =====================================
  // India — 10 digit
  // =====================================

  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // =====================================
  // India — +91
  // =====================================

  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  // =====================================
  // India — 91 without +
  // =====================================

  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

// =====================================
// POST — Check Phone Before OTP
// =====================================

export async function POST(
  request: NextRequest,
) {
  // =====================================
  // Authentication
  // =====================================

  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    // =====================================
    // User ID
    // =====================================

    const userId =
      (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID not found.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================
    // Request Body
    // =====================================

    const body =
      await request.json();

    const rawPhone =
      body?.phone;

    if (
      typeof rawPhone !== "string" ||
      !rawPhone.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Phone number is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Normalize Phone
    // =====================================

    const phone =
      normalizePhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid Indian mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Database
    // =====================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const users =
      db.collection("users");

    // =====================================
    // Current User
    // =====================================

    let userObjectId: ObjectId;

    try {
      userObjectId =
        new ObjectId(userId);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Check Already Verified Phone
    // =====================================

    const existingPhoneUser =
      await users.findOne({
        phone,

        isPhoneVerified: true,

        _id: {
          $ne: userObjectId,
        },
      });

    // =====================================
    // Phone Already Verified
    // =====================================

    if (existingPhoneUser) {
      return NextResponse.json(
        {
          success: false,

          alreadyVerified: true,

          error:
            "This phone number is already verified with another DealUp account.",
        },
        {
          status: 409,
        },
      );
    }

    // =====================================
    // Phone Available
    // =====================================

    return NextResponse.json(
      {
        success: true,

        alreadyVerified: false,

        phone,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "CHECK PHONE VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Failed to check phone number.",
      },
      {
        status: 500,
      },
    );
  }
}