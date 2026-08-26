import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Types
// =====================================================

type VerificationAction =
  | "approve"
  | "reject"
  | "suspend"
  | "request_correction";

type CorrectionType =
  | "selfie_missing"
  | "selfie_unclear"
  | "location_incorrect"
  | "location_unavailable"
  | "identity_issue"
  | "phone_issue"
  | "other";

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

// =====================================================
// GET
//
// Admin Verification Details
//
// Returns:
// - Seller information
// - Phone verification
// - Identity verification
// - Live selfie
// - Location verification
// - Overall verification status
// - Correction request details
// =====================================================

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =================================================
    // Authentication
    // =================================================

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

    // =================================================
    // Admin Authorization
    // =================================================

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

    // =================================================
    // Params
    // =================================================

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

    // =================================================
    // Database
    // =================================================

    const client = await clientPromise;

    const db = client.db("dealup");

    const usersCollection =
      db.collection("users");

    // =================================================
    // Find Seller
    // =================================================

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

    // =================================================
    // Seller Verification
    // =================================================

    const verification =
      seller.sellerVerification ?? {};

    // =================================================
    // Verification Checks
    //
    // FOUR required checks:
    //
    // 1. Phone
    // 2. Identity
    // 3. Live Selfie
    // 4. Location
    // =================================================

    const phoneVerified =
      Boolean(
        verification.phoneVerified ??
          seller.isPhoneVerified ??
          false,
      );

    const identityVerified =
      Boolean(
        verification.identityVerified ??
          false,
      );

    const selfieVerified =
      Boolean(
        verification.selfieVerified ??
          false,
      );

    const locationVerified =
      Boolean(
        verification.locationVerified ??
          false,
      );

    // =================================================
    // Completed Checks
    // =================================================

    const completedChecks = [
      phoneVerified,
      identityVerified,
      selfieVerified,
      locationVerified,
    ].filter(Boolean).length;

    const totalChecks = 4;

    const progress =
      Math.round(
        (completedChecks /
          totalChecks) *
          100,
      );

    // =================================================
    // Selfie Details
    // =================================================

    const selfieUrl =
      verification.selfieUrl ??
      null;

    const selfiePublicId =
      verification.selfiePublicId ??
      null;

    const selfieVerifiedAt =
      verification.selfieVerifiedAt ??
      null;

    // =================================================
    // Location Details
    // =================================================

    const locationLatitude =
      verification.locationLatitude ??
      null;

    const locationLongitude =
      verification.locationLongitude ??
      null;

    const locationAccuracy =
      verification.locationVerificationAccuracy ??
      null;

    const locationMethod =
      verification.locationVerificationMethod ??
      null;

    const locationVerifiedAt =
      verification.locationVerifiedAt ??
      null;

    // =================================================
    // Correction Details
    // =================================================

    const correctionRequired =
      verification.correctionRequired ===
      true;

    const correctionType =
      verification.correctionType ??
      null;

    const correctionReason =
      verification.correctionReason ??
      null;

    const correctionMessage =
      verification.correctionMessage ??
      null;

    const correctionRequestedAt =
      verification.correctionRequestedAt ??
      null;

    const correctionRequestedBy =
      verification.correctionRequestedBy ??
      null;

    const correctionResolvedAt =
      verification.correctionResolvedAt ??
      null;

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        seller: {
          id: seller._id.toString(),

          name: seller.name ?? "",

          email: seller.email ?? "",

          phone: seller.phone ?? "",

          image: seller.image ?? null,
        },

        verification: {
          // -------------------------------------------
          // Overall Status
          // -------------------------------------------

          status:
            verification.status ??
            "unverified",

          verifiedAt:
            verification.verifiedAt ??
            null,

          rejectionReason:
            verification.rejectionReason ??
            null,

          suspendedAt:
            verification.suspendedAt ??
            null,

          suspensionReason:
            verification.suspensionReason ??
            null,

          // -------------------------------------------
          // Four Verification Checks
          // -------------------------------------------

          phoneVerified,

          identityVerified,

          selfieVerified,

          locationVerified,

          completedChecks,

          totalChecks,

          progress,

          // -------------------------------------------
          // Live Selfie
          // -------------------------------------------

          selfie: {
            verified:
              selfieVerified,

            url:
              selfieUrl,

            publicId:
              selfiePublicId,

            verifiedAt:
              selfieVerifiedAt,
          },

          // -------------------------------------------
          // Location
          // -------------------------------------------

          location: {
            verified:
              locationVerified,

            latitude:
              locationLatitude,

            longitude:
              locationLongitude,

            accuracy:
              locationAccuracy,

            method:
              locationMethod,

            verifiedAt:
              locationVerifiedAt,
          },

          // -------------------------------------------
          // Correction
          // -------------------------------------------

          correction: {
            required:
              correctionRequired,

            type:
              correctionType,

            reason:
              correctionReason,

            message:
              correctionMessage,

            requestedAt:
              correctionRequestedAt,

            requestedBy:
              correctionRequestedBy,

            resolvedAt:
              correctionResolvedAt,
          },
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN SELLER VERIFICATION GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load seller verification details.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// PATCH
//
// Actions:
//
// approve
// reject
// suspend
// request_correction
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =================================================
    // Authentication
    // =================================================

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

    // =================================================
    // Admin Authorization
    // =================================================

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Params
    // =================================================

    const { userId } = await context.params;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid seller ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Request Body
    // =================================================

    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Safe Body
    // =================================================

    const data =
      typeof body === "object" &&
      body !== null
        ? body as Record<
            string,
            unknown
          >
        : {};

    // =================================================
    // Action
    // =================================================

    const action =
      String(
        data.action ?? "",
      ) as VerificationAction;

    // =================================================
    // Reason
    // =================================================

    const reason =
      typeof data.reason ===
      "string"
        ? data.reason.trim()
        : "";

    // =================================================
    // Message
    // =================================================

    const correctionMessage =
      typeof data.message ===
      "string"
        ? data.message.trim()
        : "";

    // =================================================
    // Correction Type
    // =================================================

    const correctionType =
      typeof data.correctionType ===
      "string"
        ? data.correctionType.trim()
        : "";

    // =================================================
    // Allowed Actions
    // =================================================

    const allowedActions:
      VerificationAction[] = [
        "approve",
        "reject",
        "suspend",
        "request_correction",
      ];

    if (
      !allowedActions.includes(
        action,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification action.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate Reject / Suspend Reason
    // =================================================

    if (
      (
        action === "reject" ||
        action === "suspend"
      ) &&
      !reason
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A reason is required for rejection or suspension.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate Correction Request
    // =================================================

    if (
      action ===
      "request_correction"
    ) {
      if (!correctionType) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Correction type is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (!reason) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A correction reason is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (!correctionMessage) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A correction message is required.",
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Allowed Correction Types
      // -----------------------------------------------

      const allowedCorrectionTypes:
        CorrectionType[] = [
          "selfie_missing",
          "selfie_unclear",
          "location_incorrect",
          "location_unavailable",
          "identity_issue",
          "phone_issue",
          "other",
        ];

      if (
        !allowedCorrectionTypes.includes(
          correctionType as CorrectionType,
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

      // -----------------------------------------------
      // Length Protection
      // -----------------------------------------------

      if (
        reason.length > 300
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Correction reason cannot exceed 300 characters.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        correctionMessage.length >
        1000
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Correction message cannot exceed 1000 characters.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // =================================================
    // Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const usersCollection =
      db.collection("users");

    // =================================================
    // Find Seller
    // =================================================

    const seller =
      await usersCollection.findOne({
        _id:
          new ObjectId(userId),
      });

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Prevent Admin Self Verification
    // =================================================

    if (
      String(
        session.user.id,
      ) === userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot change your own seller verification.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Current Verification
    // =================================================

    const verification =
      seller.sellerVerification ??
      {
        status:
          "unverified",

        phoneVerified:
          seller.isPhoneVerified ??
          false,

        identityVerified:
          false,

        selfieVerified:
          false,

        locationVerified:
          false,
      };

    // =================================================
    // Verification Checks
    //
    // FOUR required checks:
    //
    // 1. Phone
    // 2. Identity
    // 3. Live Selfie
    // 4. Location
    // =================================================

    const phoneVerified =
      Boolean(
        verification.phoneVerified ??
          seller.isPhoneVerified ??
          false,
      );

    const identityVerified =
      Boolean(
        verification.identityVerified ??
          false,
      );

    const selfieVerified =
      Boolean(
        verification.selfieVerified ??
          false,
      );

    const locationVerified =
      Boolean(
        verification.locationVerified ??
          false,
      );

    // =================================================
    // Completed Checks
    // =================================================

    const completedChecks = [
      phoneVerified,
      identityVerified,
      selfieVerified,
      locationVerified,
    ].filter(Boolean).length;

    const totalChecks = 4;

    const fullyVerified =
      completedChecks ===
      totalChecks;

    // =================================================
    // Current Time
    // =================================================

    const now = new Date();

    // =================================================
    // REQUEST CORRECTION
    // =================================================

    if (
      action ===
      "request_correction"
    ) {
      // -----------------------------------------------
      // Reset the affected verification check
      //
      // This is important.
      //
      // Example:
      // Admin says selfie is unclear.
      //
      // The old selfie must NOT remain verified.
      // Otherwise seller could immediately become
      // approved without submitting a new selfie.
      // -----------------------------------------------

      const correctionReset: Record<
        string,
        unknown
      > = {};

      if (
        correctionType ===
          "selfie_missing" ||
        correctionType ===
          "selfie_unclear"
      ) {
        correctionReset[
          "sellerVerification.selfieVerified"
        ] = false;
      }

      if (
        correctionType ===
          "location_incorrect" ||
        correctionType ===
          "location_unavailable"
      ) {
        correctionReset[
          "sellerVerification.locationVerified"
        ] = false;
      }

      if (
        correctionType ===
        "identity_issue"
      ) {
        correctionReset[
          "sellerVerification.identityVerified"
        ] = false;
      }

      if (
        correctionType ===
        "phone_issue"
      ) {
        correctionReset[
          "sellerVerification.phoneVerified"
        ] = false;
      }

      // -----------------------------------------------
      // Correction Update
      // -----------------------------------------------

      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),
          },
          {
            $set: {
              // ---------------------------------------
              // Status
              // ---------------------------------------

              "sellerVerification.status":
                "action_required",

              // ---------------------------------------
              // Correction
              // ---------------------------------------

              "sellerVerification.correctionRequired":
                true,

              "sellerVerification.correctionType":
                correctionType,

              "sellerVerification.correctionReason":
                reason,

              "sellerVerification.correctionMessage":
                correctionMessage,

              "sellerVerification.correctionRequestedAt":
                now,

              "sellerVerification.correctionRequestedBy":
                String(
                  session.user.id,
                ),

              // ---------------------------------------
              // Remove final approval
              // ---------------------------------------

              "sellerVerification.verifiedAt":
                null,

              "sellerVerification.rejectionReason":
                null,

              "sellerVerification.suspendedAt":
                null,

              "sellerVerification.suspensionReason":
                null,

              updatedAt:
                now,

              // ---------------------------------------
              // Affected verification reset
              // ---------------------------------------

              ...correctionReset,
            },
          },
        );

      // -----------------------------------------------
      // Database Safety Check
      // -----------------------------------------------

      if (
        result.matchedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Seller verification was not updated.",
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Success
      // -----------------------------------------------

      return NextResponse.json(
        {
          success: true,

          action:
            "request_correction",

          status:
            "action_required",

          correction: {
            required: true,

            type:
              correctionType,

            reason,

            message:
              correctionMessage,

            requestedAt:
              now,

            requestedBy:
              String(
                session.user.id,
              ),
          },

          message:
            "Correction request has been sent to the seller successfully.",
        },
        {
          status: 200,
        },
      );
    }

    // =================================================
    // APPROVE
    //
    // ALL FOUR checks are mandatory.
    // =================================================

    if (
      action ===
      "approve"
    ) {
      // -----------------------------------------------
      // Phone
      // -----------------------------------------------

      if (!phoneVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller phone verification is not complete.",

            verification: {
              phoneVerified,
              identityVerified,
              selfieVerified,
              locationVerified,
              completedChecks,
              totalChecks,
            },
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Identity
      // -----------------------------------------------

      if (!identityVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller Aadhaar identity verification is not complete.",

            verification: {
              phoneVerified,
              identityVerified,
              selfieVerified,
              locationVerified,
              completedChecks,
              totalChecks,
            },
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Live Selfie
      // -----------------------------------------------

      if (!selfieVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller live selfie verification is not complete.",

            verification: {
              phoneVerified,
              identityVerified,
              selfieVerified,
              locationVerified,
              completedChecks,
              totalChecks,
            },
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Location
      // -----------------------------------------------

      if (!locationVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller location verification is not complete.",

            verification: {
              phoneVerified,
              identityVerified,
              selfieVerified,
              locationVerified,
              completedChecks,
              totalChecks,
            },
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Final Safety Check
      // -----------------------------------------------

      if (!fullyVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "All four verification checks must be completed before the seller can be verified.",

            verification: {
              phoneVerified,
              identityVerified,
              selfieVerified,
              locationVerified,
              completedChecks,
              totalChecks,
            },
          },
          {
            status: 400,
          },
        );
      }

      // -----------------------------------------------
      // Final Database Safety Check
      // -----------------------------------------------

      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),

            "sellerVerification.phoneVerified":
              true,

            "sellerVerification.identityVerified":
              true,

            "sellerVerification.selfieVerified":
              true,

            "sellerVerification.locationVerified":
              true,
          },
          {
            $set: {
              // ---------------------------------------
              // Verified Seller
              // ---------------------------------------

              "sellerVerification.status":
                "verified",

              "sellerVerification.verifiedAt":
                now,

              // ---------------------------------------
              // Clear old rejection/suspension
              // ---------------------------------------

              "sellerVerification.rejectionReason":
                null,

              "sellerVerification.suspendedAt":
                null,

              "sellerVerification.suspensionReason":
                null,

              // ---------------------------------------
              // Correction Resolved
              // ---------------------------------------

              "sellerVerification.correctionRequired":
                false,

              "sellerVerification.correctionResolvedAt":
                now,

              "sellerVerification.correctionType":
                null,

              "sellerVerification.correctionReason":
                null,

              "sellerVerification.correctionMessage":
                null,

              "sellerVerification.correctionRequestedAt":
                null,

              "sellerVerification.correctionRequestedBy":
                null,

              updatedAt:
                now,
            },
          },
        );

      // -----------------------------------------------
      // Database Safety Check
      // -----------------------------------------------

      if (
        result.matchedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller verification changed before approval. Please refresh and try again.",
          },
          {
            status: 409,
          },
        );
      }

      // -----------------------------------------------
      // Success
      // -----------------------------------------------

      return NextResponse.json(
        {
          success: true,

          action:
            "approve",

          status:
            "verified",

          verification: {
            phoneVerified:
              true,

            identityVerified:
              true,

            selfieVerified:
              true,

            locationVerified:
              true,

            completedChecks:
              4,

            totalChecks:
              4,

            progress:
              100,
          },

          message:
            "Seller has been fully verified successfully.",
        },
        {
          status: 200,
        },
      );
    }

    // =================================================
    // REJECT
    // =================================================

    if (
      action ===
      "reject"
    ) {
      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),
          },
          {
            $set: {
              "sellerVerification.status":
                "rejected",

              "sellerVerification.rejectionReason":
                reason,

              "sellerVerification.verifiedAt":
                null,

              "sellerVerification.suspendedAt":
                null,

              "sellerVerification.suspensionReason":
                null,

              // ---------------------------------------
              // Clear correction request
              // ---------------------------------------

              "sellerVerification.correctionRequired":
                false,

              "sellerVerification.correctionResolvedAt":
                null,

              "sellerVerification.correctionType":
                null,

              "sellerVerification.correctionReason":
                null,

              "sellerVerification.correctionMessage":
                null,

              "sellerVerification.correctionRequestedAt":
                null,

              "sellerVerification.correctionRequestedBy":
                null,

              updatedAt:
                now,
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
              "Seller verification was not updated.",
          },
          {
            status: 400,
          },
        );
      }

      return NextResponse.json(
        {
          success: true,

          action:
            "reject",

          status:
            "rejected",

          message:
            "Seller verification rejected successfully.",
        },
        {
          status: 200,
        },
      );
    }

    // =================================================
    // SUSPEND
    // =================================================

    if (
      action ===
      "suspend"
    ) {
      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),
          },
          {
            $set: {
              "sellerVerification.status":
                "suspended",

              "sellerVerification.suspendedAt":
                now,

              "sellerVerification.suspensionReason":
                reason,

              "sellerVerification.verifiedAt":
                null,

              // ---------------------------------------
              // Clear correction request
              // ---------------------------------------

              "sellerVerification.correctionRequired":
                false,

              "sellerVerification.correctionResolvedAt":
                null,

              "sellerVerification.correctionType":
                null,

              "sellerVerification.correctionReason":
                null,

              "sellerVerification.correctionMessage":
                null,

              "sellerVerification.correctionRequestedAt":
                null,

              "sellerVerification.correctionRequestedBy":
                null,

              updatedAt:
                now,
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
              "Seller verification was not updated.",
          },
          {
            status: 400,
          },
        );
      }

      return NextResponse.json(
        {
          success: true,

          action:
            "suspend",

          status:
            "suspended",

          message:
            "Seller has been suspended successfully.",
        },
        {
          status: 200,
        },
      );
    }

    // =================================================
    // Fallback
    // =================================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN SELLER VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update seller verification.",
      },
      {
        status: 500,
      },
    );
  }
}