import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

type CorrectionType =
  | "identity"
  | "selfie"
  | "location"
  | "multiple";

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================================
    // ADMIN AUTHORIZATION
    // =====================================================

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // PARAMS
    // =====================================================

    const { userId } = await context.params;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid seller ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // BODY
    // =====================================================

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const correctionType =
      String(
        body?.correctionType ?? "",
      ) as CorrectionType;

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    // =====================================================
    // VALIDATION
    // =====================================================

    const allowedTypes: CorrectionType[] = [
      "identity",
      "selfie",
      "location",
      "multiple",
    ];

    if (
      !allowedTypes.includes(
        correctionType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid correction type.",
        },
        {
          status: 400,
        },
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Correction message is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Correction message cannot exceed 2000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // DATABASE
    // =====================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const usersCollection =
      db.collection("users");

    // =====================================================
    // FIND SELLER
    // =====================================================

    const seller =
      await usersCollection.findOne({
        _id: new ObjectId(userId),
      });

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // PREVENT ADMIN SELF REQUEST
    // =====================================================

    if (
      String(session.user.id) ===
      userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot request correction from your own account.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // TIMESTAMP
    // =====================================================

    const now = new Date();

    // =====================================================
    // CORRECTION REQUEST
    // =====================================================

    const correctionRequest = {
      required: true,

      type: correctionType,

      message,

      requestedAt: now,

      requestedBy: {
        userId: String(
          session.user.id,
        ),

        name:
          session.user.name ??
          "DealUp Admin",

        email:
          session.user.email ??
          null,
      },

      sellerViewed: false,

      sellerViewedAt: null,

      resolved: false,

      resolvedAt: null,
    };

    // =====================================================
    // UPDATE SELLER
    //
    // IMPORTANT:
    // We do NOT change selfie/location data here.
    //
    // Only admin correction state is created.
    // =====================================================

    const result =
      await usersCollection.updateOne(
        {
          _id: new ObjectId(userId),
        },
        {
          $set: {
            "sellerVerification.status":
              "action_required",

            "sellerVerification.correctionRequest":
              correctionRequest,

            "sellerVerification.rejectionReason":
              null,

            updatedAt: now,
          },
        },
      );

    if (
      result.matchedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller verification could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Verification correction request sent successfully.",

        correctionRequest: {
          type: correctionType,
          message,
          requestedAt: now,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN VERIFICATION CORRECTION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send verification correction request.",
      },
      {
        status: 500,
      },
    );
  }
}