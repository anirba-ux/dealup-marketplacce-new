import { setLocale } from "@/lib/locale";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

// =========================
// GET PROFILE
// =========================

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const client = await clientPromise;
    const db = client.db("dealup");

    const user = await db.collection("users").findOne(
      {
        _id: new ObjectId(session.user.id),
      },
      {
        projection: {
          password: 0,
        },
      },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

// =========================
// UPDATE PROFILE
// =========================

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      name,
      phone,
      image,
      state,
      district,
      city,
      language,
    } = body;

    const client = await clientPromise;
    const db = client.db("dealup");

    const userId = new ObjectId(session.user.id);

    // =====================================
    // Get Existing User
    // =====================================

    const existingUser = await db.collection("users").findOne(
      {
        _id: userId,
      },
      {
        projection: {
          phone: 1,
          isPhoneVerified: 1,
          sellerVerification: 1,
        },
      },
    );

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    // =====================================
    // Normalize Profile Fields
    // =====================================

    const safeName =
      typeof name === "string" ? name.trim() : "";

    const safeState =
      typeof state === "string" ? state.trim() : "";

    const safeDistrict =
      typeof district === "string"
        ? district.trim()
        : "";

    const safeCity =
      typeof city === "string" ? city.trim() : "";

    const safeLanguage =
      typeof language === "string" && language.trim()
        ? language.trim()
        : "en";

    // =====================================
    // Normalize Phone
    // =====================================

    const oldPhone =
      typeof existingUser.phone === "string"
        ? existingUser.phone.trim()
        : "";

    const newPhone =
      typeof phone === "string" ? phone.trim() : "";

    // =====================================
    // Detect Phone Change
    // =====================================

    const phoneChanged = oldPhone !== newPhone;

    // =====================================
    // Profile Update
    // =====================================

    const updateData: Record<string, any> = {
      name: safeName,

      phone: newPhone,

      image: image ?? "",

      language: safeLanguage,

      address: {
        state: safeState,

        district: safeDistrict,

        city: safeCity,
      },

      updatedAt: new Date(),
    };

    // =====================================
    // Phone Changed
    // =====================================

    if (phoneChanged) {
      updateData.isPhoneVerified = false;

      updateData.sellerVerification = {
        ...(existingUser.sellerVerification ?? {
          status: "unverified",

          identityVerified: false,
        }),

        status: "unverified",

        phoneVerified: false,

        identityVerified:
          existingUser.sellerVerification?.identityVerified ??
          false,

        submittedAt: undefined,

        verifiedAt: undefined,

        rejectionReason: undefined,
      };
    }

    // =====================================
    // Update User
    // =====================================

    const result = await db.collection("users").updateOne(
      {
        _id: userId,
      },
      {
        $set: updateData,
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    await setLocale(safeLanguage);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}