import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    // =========================
    // Validation
    // =========================

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("dealup");

    // =========================
    // Check Existing User
    // =========================

    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists.",
        },
        { status: 409 },
      );
    }

    // =========================
    // Hash Password
    // =========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // Create User
    // =========================

    const result = await db.collection("users").insertOne({
      name: name.trim(),

      email: email.toLowerCase().trim(),

      password: hashedPassword,

      role: "user",

      provider: "credentials",

      image: "",

      phone: "",

      language: "en",

      // =====================================
      // Existing Verification
      // =====================================

      isVerified: false,

      isPhoneVerified: false,

      // =====================================
      // Seller Verification
      // =====================================

      sellerVerification: {
        status: "unverified",

        phoneVerified: false,

        identityVerified: false,
      },

      // =====================================
      // Trust & Risk
      // =====================================

      trustScore: 0,

      riskScore: 0,

      // =====================================
      // Existing
      // =====================================

      badges: [],

      address: {
        state: "",

        district: "",

        city: "",
      },

      createdAt: new Date(),

      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",

        userId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
