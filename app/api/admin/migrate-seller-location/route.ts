import { NextResponse } from "next/server";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

import { ObjectId } from "mongodb";

// =====================================================
// GET
//
// One-time migration for previously verified sellers.
//
// It copies:
//
// locationVerificationSessions.mobileLocation
//
// into:
//
// users.sellerVerification
//
// =====================================================

export async function GET() {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session =
      await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // IMPORTANT
    //
    // Only admin should run this migration.
    //
    // Adjust this check if your project uses a
    // different admin role field.
    // =================================================

    const userRole =
      (session.user as {
        role?: string;
      }).role;

    if (
      userRole !== "admin"
    ) {
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
    // Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const users =
      db.collection(
        "users",
      );

    const sessions =
      db.collection(
        "locationVerificationSessions",
      );

    // =================================================
    // Find Sellers
    //
    // Only sellers who are already location verified
    // but don't have the new coordinates.
    // =================================================

    const sellers =
      await users
        .find(
          {
            "sellerVerification.locationVerified":
              true,

            $or: [
              {
                "sellerVerification.locationLatitude":
                  {
                    $exists:
                      false,
                  },
              },

              {
                "sellerVerification.locationLongitude":
                  {
                    $exists:
                      false,
                  },
              },
            ],
          },
          {
            projection: {
              sellerVerification:
                1,
            },
          },
        )
        .toArray();

    // =================================================
    // Counters
    // =================================================

    let migrated =
      0;

    let skipped =
      0;

    let failed =
      0;

    const details: Array<{
      userId: string;
      status:
        | "migrated"
        | "skipped"
        | "failed";
      reason?: string;
    }> = [];

    // =================================================
    // Process Sellers
    // =================================================

    for (
      const seller of sellers
    ) {
      try {
        const userId =
          seller._id.toString();

        // ---------------------------------------------
        // Find latest successful location session
        // ---------------------------------------------

        const verification =
          await sessions.findOne(
            {
              userId,

              locationVerified:
                true,

              "mobileLocation.latitude":
                {
                  $type:
                    "number",
                },

              "mobileLocation.longitude":
                {
                  $type:
                    "number",
                },
            },
            {
              sort: {
                locationVerifiedAt:
                  -1,

                createdAt:
                  -1,
              },
            },
          );

        // ---------------------------------------------
        // No usable session
        // ---------------------------------------------

        if (
          !verification?.mobileLocation
        ) {
          skipped++;

          details.push({
            userId,

            status:
              "skipped",

            reason:
              "No verified mobile location session found.",
          });

          continue;
        }

        // ---------------------------------------------
        // Extract GPS
        // ---------------------------------------------

        const latitude =
          Number(
            verification
              .mobileLocation
              .latitude,
          );

        const longitude =
          Number(
            verification
              .mobileLocation
              .longitude,
          );

        const accuracy =
          Number(
            verification
              .mobileLocation
              .accuracy,
          );

        // ---------------------------------------------
        // Validate GPS
        // ---------------------------------------------

        if (
          !Number.isFinite(
            latitude,
          ) ||
          !Number.isFinite(
            longitude,
          ) ||
          !Number.isFinite(
            accuracy,
          ) ||
          accuracy <= 0
        ) {
          skipped++;

          details.push({
            userId,

            status:
              "skipped",

            reason:
              "Invalid GPS data in verification session.",
          });

          continue;
        }

        // ---------------------------------------------
        // Save into seller
        // ---------------------------------------------

        const result =
          await users.updateOne(
            {
              _id:
                seller._id,
            },
            {
              $set: {
                "sellerVerification.locationLatitude":
                  latitude,

                "sellerVerification.locationLongitude":
                  longitude,

                "sellerVerification.locationVerificationAccuracy":
                  accuracy,

                "sellerVerification.locationVerificationMethod":
                  "mobile-gps",

                "sellerVerification.locationVerifiedAt":
                  verification.locationVerifiedAt ??
                  verification
                    .mobileLocation
                    .capturedAt ??
                  new Date(),

                updatedAt:
                  new Date(),
              },
            },
          );

        // ---------------------------------------------
        // Result
        // ---------------------------------------------

        if (
          result.modifiedCount >
          0
        ) {
          migrated++;

          details.push({
            userId,

            status:
              "migrated",
          });
        } else {
          skipped++;

          details.push({
            userId,

            status:
              "skipped",

            reason:
              "Seller document was not modified.",
          });
        }
      } catch (error) {
        console.error(
          "SELLER LOCATION MIGRATION ERROR:",
          seller._id,
          error,
        );

        failed++;

        details.push({
          userId:
            seller._id.toString(),

          status:
            "failed",

          reason:
            "Unexpected migration error.",
        });
      }
    }

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Seller location migration completed.",

        totalFound:
          sellers.length,

        migrated,

        skipped,

        failed,

        details,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "MIGRATE SELLER LOCATIONS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Seller location migration failed.",
      },
      {
        status: 500,
      },
    );
  }
}