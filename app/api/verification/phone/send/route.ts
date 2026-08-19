import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

import {
  createPhoneVerification,
  invalidatePhoneVerifications,
  countRecentPhoneVerificationRequests,
} from "@/lib/repositories/phoneVerification.repository";

// =====================================
// Configuration
// =====================================

const OTP_EXPIRY_MINUTES = 5;

const RESEND_COOLDOWN_SECONDS = 60;

const MAX_REQUESTS_PER_HOUR = 5;

// =====================================
// Generate OTP
// =====================================

function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// =====================================
// Hash OTP
// =====================================

function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

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
// POST — Send OTP
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
          error: "User ID not found",
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

    if (typeof rawPhone !== "string" || !rawPhone.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required",
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
    // Database
    // =====================================

    const client = await clientPromise;

    const db = client.db("dealup");

    const users = db.collection("users");

    // =====================================
    // Find Current User
    // =====================================

    const user = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================
    // Already Verified
    // =====================================

    if (user.isPhoneVerified === true) {
      return NextResponse.json(
        {
          success: false,
          error: "Your phone number is already verified.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Check if phone belongs to another user
    // =====================================

    const existingPhoneUser = await users.findOne({
      phone,
      isPhoneVerified: true,

      _id: {
        $ne: user._id,
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
    // 60 Second Resend Cooldown
    // =====================================

    const cooldownSince = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);

    const recentRequests = await countRecentPhoneVerificationRequests(
      userId,
      phone,
      cooldownSince,
    );

    if (recentRequests > 0) {
      return NextResponse.json(
        {
          success: false,

          error: "Please wait before requesting another OTP.",

          retryAfter: RESEND_COOLDOWN_SECONDS,
        },
        {
          status: 429,
        },
      );
    }

    // =====================================
    // Hourly Request Limit
    // =====================================

    const hourlySince = new Date(Date.now() - 60 * 60 * 1000);

    const hourlyRequests = await countRecentPhoneVerificationRequests(
      userId,
      phone,
      hourlySince,
    );

    if (hourlyRequests >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json(
        {
          success: false,

          error: "Too many OTP requests. Please try again later.",
        },
        {
          status: 429,
        },
      );
    }

    // =====================================
    // Generate OTP
    // =====================================

    const otp = generateOTP();

    // =====================================
    // Hash OTP
    // =====================================

    const otpHash = hashOTP(otp);

    // =====================================
    // Invalidate Old OTP
    // =====================================

    await invalidatePhoneVerifications(userId, phone);

    // =====================================
    // Expiry
    // =====================================

    const now = new Date();

    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // =====================================
    // Save OTP
    // =====================================

    await createPhoneVerification({
      userId,

      phone,

      otpHash,

      expiresAt,

      attempts: 0,

      verified: false,

      createdAt: now,

      updatedAt: now,
    });

    // =====================================
    // Development OTP
    // =====================================

    if (process.env.NODE_ENV !== "production") {
      console.log("====================================");

      console.log("DEALUP DEVELOPMENT OTP");

      console.log("User:", userId);

      console.log("Phone:", phone);

      console.log("OTP:", otp);

      console.log("Expires:", expiresAt.toISOString());

      console.log("====================================");
    }

    // =====================================
    // TODO — MSG91
    // =====================================

    /*
      Production:

      await sendOTPWithMSG91(
        phone,
        otp,
      );

      MSG91 will be added later.
    */

    return NextResponse.json(
      {
        success: true,

        message: "OTP generated successfully.",

        expiresIn: OTP_EXPIRY_MINUTES * 60,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("SEND PHONE OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Failed to send OTP.",
      },
      {
        status: 500,
      },
    );
  }
}
