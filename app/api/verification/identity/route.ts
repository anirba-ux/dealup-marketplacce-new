import {
  NextRequest,
  NextResponse,
} from "next/server";

import { randomUUID } from "crypto";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

import cloudinary from "@/lib/cloudinary";

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE =
  10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// =====================================================
// POST
//
// Seller Aadhaar Identity Verification Submission
//
// Flow:
//
// Seller
//   ↓
// Authentication
//   ↓
// Validate Aadhaar file
//   ↓
// Create pending submission
//   ↓
// Upload to Cloudinary authenticated storage
//   ↓
// Save Cloudinary metadata
//   ↓
// storageStatus = stored
//   ↓
// reviewStatus = pending
//   ↓
// Admin Review
// =====================================================

export async function POST(
  request: NextRequest,
) {
  let submissionId = "";

  try {
    // =================================================
    // Authentication
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in before submitting identity verification.",
        },
        {
          status: 401,
        },
      );
    }

    const userId = String(
      session.user.id,
    );

    // =================================================
    // Read FormData
    // =================================================

    const formData =
      await request.formData();

    const documentType =
      String(
        formData.get(
          "documentType",
        ) ?? "",
      ).trim();

    const document =
      formData.get("document");

    // =================================================
    // Validate Document Type
    // =================================================

    if (
      documentType !==
      "aadhaar"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only Aadhaar identity verification is currently supported.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate File
    // =================================================

    if (
      !document ||
      !(document instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select an Aadhaar document.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      document.size <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected Aadhaar document is empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      document.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aadhaar document must be 10 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        document.type,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WEBP or PDF Aadhaar documents are supported.",
        },
        {
          status: 400,
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
      db.collection("users");

    const submissions =
      db.collection(
        "identityVerificationSubmissions",
      );

    // =================================================
    // Seller
    // =================================================

    if (
      !ObjectId.isValid(
        userId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user account.",
        },
        {
          status: 400,
        },
      );
    }

    const seller =
      await users.findOne({
        _id:
          new ObjectId(
            userId,
          ),
      });

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Prevent Duplicate Pending Submission
    // =================================================

    const existingSubmission =
      await submissions.findOne({
        userId,

        documentType:
          "aadhaar",

        reviewStatus:
          "pending",

        storageStatus:
          "stored",
      });

    if (existingSubmission) {
      return NextResponse.json(
        {
          success: false,

          message:
            "You already have an Aadhaar identity verification awaiting admin review.",

          submissionId:
            existingSubmission.submissionId,
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Submission ID
    // =================================================

    submissionId =
      randomUUID();

    const now =
      new Date();

    // =================================================
    // Create Initial Submission
    //
    // We create it first so that even if Cloudinary
    // fails we can record the failure state.
    // =================================================

    await submissions.insertOne({
      submissionId,

      userId,

      documentType:
        "aadhaar",

      fileName:
        document.name,

      mimeType:
        document.type,

      fileSize:
        document.size,

      // -----------------------------------------------
      // Storage
      // -----------------------------------------------

      storageStatus:
        "uploading",

      cloudinaryPublicId:
        null,

      cloudinaryResourceType:
        null,

      cloudinaryVersion:
        null,

      cloudinaryFormat:
        null,

      // -----------------------------------------------
      // Review
      // -----------------------------------------------

      reviewStatus:
        "pending",

      reviewedAt:
        null,

      reviewedBy:
        null,

      rejectionReason:
        null,

      // -----------------------------------------------
      // Dates
      // -----------------------------------------------

      submittedAt:
        now,

      createdAt:
        now,

      updatedAt:
        now,
    });

    // =================================================
    // Convert File → Buffer
    // =================================================

    const arrayBuffer =
      await document.arrayBuffer();

    const buffer =
      Buffer.from(
        arrayBuffer,
      );

    // =================================================
    // Cloudinary Resource Type
    // =================================================

    const resourceType =
      document.type ===
      "application/pdf"
        ? "raw"
        : "image";

    // =================================================
    // Cloudinary Public ID
    //
    // Keep Aadhaar documents inside a private/
    // authenticated folder.
    // =================================================

    const publicId =
      `dealup/identity/${userId}/${submissionId}`;

    // =================================================
    // Upload Promise
    // =================================================

    const uploadResult =
      await new Promise<any>(
        (
          resolve,
          reject,
        ) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                public_id:
                  publicId,

                folder: undefined,

                resource_type:
                  resourceType,

                type:
                  "authenticated",

                overwrite:
                  false,

                invalidate:
                  false,
              },

              (
                error,
                result,
              ) => {
                if (error) {
                  reject(
                    error,
                  );

                  return;
                }

                if (
                  !result
                ) {
                  reject(
                    new Error(
                      "Cloudinary returned no upload result.",
                    ),
                  );

                  return;
                }

                resolve(
                  result,
                );
              },
            );

          uploadStream.end(
            buffer,
          );
        },
      );

    // =================================================
    // Validate Cloudinary Result
    // =================================================

    if (
      !uploadResult.public_id
    ) {
      throw new Error(
        "Cloudinary upload completed without a public ID.",
      );
    }

    // =================================================
    // Update Submission
    //
    // IMPORTANT:
    //
    // Only now do we mark storage as "stored".
    // =================================================

    const updateResult =
      await submissions.updateOne(
        {
          submissionId,
        },
        {
          $set: {
            storageStatus:
              "stored",

            cloudinaryPublicId:
              String(
                uploadResult.public_id,
              ),

            cloudinaryResourceType:
              String(
                uploadResult.resource_type ??
                  resourceType,
              ),

            cloudinaryVersion:
              uploadResult.version
                ? Number(
                    uploadResult.version,
                  )
                : null,

            cloudinaryFormat:
              uploadResult.format
                ? String(
                    uploadResult.format,
                  )
                : null,

            // -----------------------------------------
            // Review remains pending
            // -----------------------------------------

            reviewStatus:
              "pending",

            updatedAt:
              new Date(),
          },
        },
      );

    // =================================================
    // Verify Database Update
    // =================================================

    if (
      updateResult.matchedCount ===
        0 ||
      updateResult.modifiedCount ===
        0
    ) {
      // -----------------------------------------------
      // Cloudinary succeeded but DB update failed.
      // -----------------------------------------------

      console.error(
        "IDENTITY SUBMISSION DB UPDATE FAILED AFTER CLOUDINARY UPLOAD",
        {
          submissionId,
          publicId:
            uploadResult.public_id,
        },
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Identity document was uploaded but the verification record could not be completed. Please contact support.",

          submissionId,
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Update Seller Verification
    //
    // IMPORTANT:
    //
    // Identity submission DOES NOT automatically
    // make seller verified.
    //
    // Admin approval is required.
    // =================================================

    await users.updateOne(
      {
        _id:
          new ObjectId(
            userId,
          ),
      },
      {
        $set: {
          "sellerVerification.identityDocumentType":
            "aadhaar",

          "sellerVerification.identitySubmissionId":
            submissionId,

          "sellerVerification.identitySubmittedAt":
            now,

          "sellerVerification.identityRejectionReason":
            null,

          updatedAt:
            new Date(),
        },
      },
    );

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Your Aadhaar identity verification has been submitted successfully and is now under admin review.",

        submissionId,

        status:
          "pending",

        storageStatus:
          "stored",

        reviewStatus:
          "pending",

        cloudinary: {
          uploaded:
            true,

          resourceType:
            String(
              uploadResult.resource_type ??
                resourceType,
            ),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "IDENTITY VERIFICATION SUBMISSION ERROR:",
      error,
    );

    // =================================================
    // Mark Failed Upload
    // =================================================

    if (submissionId) {
      try {
        const client =
          await clientPromise;

        const db =
          client.db("dealup");

        await db
          .collection(
            "identityVerificationSubmissions",
          )
          .updateOne(
            {
              submissionId,
            },
            {
              $set: {
                storageStatus:
                  "failed",

                updatedAt:
                  new Date(),
              },
            },
          );
      } catch (
        databaseError
      ) {
        console.error(
          "FAILED TO MARK IDENTITY SUBMISSION AS FAILED:",
          databaseError,
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to upload the identity document. Please try again.",

        submissionId:
          submissionId ||
          null,
      },
      {
        status: 500,
      },
    );
  }
}