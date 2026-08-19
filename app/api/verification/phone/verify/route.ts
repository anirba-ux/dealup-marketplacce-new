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
// POST — Verify MSG91 OTP
// =====================================

export async function POST(request: NextRequest) {
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

    const userId = (session.user as any).id;

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

    const body = await request.json();

    const rawPhone = body?.phone;

    const accessToken = body?.accessToken;

    // =====================================
    // Validate Phone
    // =====================================

    if (typeof rawPhone !== "string" || !rawPhone.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Validate MSG91 Access Token
    // =====================================

    if (typeof accessToken !== "string" || !accessToken.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "MSG91 verification token is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Normalize Phone
    // =====================================

    const phone = normalizePhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid Indian mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // MSG91 Auth Key
    // =====================================

    const authKey = process.env.MSG91_AUTH_KEY;

    if (!authKey) {
      console.error("MSG91_AUTH_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "MSG91 server configuration is missing.",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================
    // Verify Access Token with MSG91
    // =====================================

    const msg91Response = await fetch(
      "https://control.msg91.com/api/v5/widget/verifyAccessToken",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify({
          authkey: authKey,

          "access-token": accessToken,
        }),
      },
    );

    const msg91Data = await msg91Response.json();

    console.log("MSG91 SERVER VERIFICATION:", msg91Data);

    // =====================================
    // MSG91 Verification Failed
    // =====================================

    if (!msg91Response.ok) {
      console.error("MSG91 ACCESS TOKEN VERIFICATION FAILED:", msg91Data);

      return NextResponse.json(
        {
          success: false,
          error: "MSG91 OTP verification failed.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Check MSG91 Response
    // =====================================

    if (msg91Data?.type !== "success") {
      console.error("MSG91 did not return success:", msg91Data);

      return NextResponse.json(
        {
          success: false,
          error: "Phone verification could not be completed.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Database
    // =====================================

    const client = await clientPromise;

    const db = client.db("dealup");

    const users = db.collection("users");

    // =====================================
    // User ObjectId
    // =====================================

    let userObjectId: ObjectId;

    try {
      userObjectId = new ObjectId(userId);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Check Phone Already Used
    // =====================================

    const existingPhoneUser = await users.findOne({
      phone,
      isPhoneVerified: true,

      _id: {
        $ne: userObjectId,
      },
    });

    if (existingPhoneUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This phone number is already verified with another DealUp account.",
        },
        {
          status: 409,
        },
      );
    }

    // =====================================
    // Update User
    // =====================================

    const updateResult = await users.updateOne(
      {
        _id: userObjectId,
      },

      {
        $set: {
          phone,

          isPhoneVerified: true,

          "sellerVerification.phoneVerified": true,

          updatedAt: new Date(),
        },
      },
    );

    // =====================================
    // User Not Found
    // =====================================

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================
    // Success
    // =====================================

    return NextResponse.json(
      {
        success: true,

        message: "Phone number verified successfully.",

        phone,

        phoneVerified: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("VERIFY PHONE OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Failed to verify phone number.",
      },
      {
        status: 500,
      },
    );
  }
}
