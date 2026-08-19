import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import cloudinary from "@/lib/cloudinary";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const USERS_COLLECTION = "users";

const SUBMISSIONS_COLLECTION =
  "identityVerificationSubmissions";

// =====================================================
// Cloudinary Upload Helper
// =====================================================

function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "dealup/identity-verification",

            resource_type:
              "auto",

            public_id:
              `${randomUUID()}-${fileName
                .replace(
                  /\.[^/.]+$/,
                  "",
                )
                .replace(
                  /[^a-zA-Z0-9-_]/g,
                  "-",
                )}`,
          },

          (
            error,
            result,
          ) => {
            if (error) {
              reject(error);

              return;
            }

            if (
              !result?.secure_url ||
              !result?.public_id
            ) {
              reject(
                new Error(
                  "Cloudinary upload did not return a valid result.",
                ),
              );

              return;
            }

            resolve({
              secure_url:
                result.secure_url,

              public_id:
                result.public_id,
            });
          },
        );

      uploadStream.end(buffer);
    },
  );
}

// =====================================================
// PUT
// =====================================================

export async function PUT(
  request: Request,
) {
  try {
    // ===================================================
    // Authentication
    // ===================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const userId =
      session.user.id;

    // ===================================================
    // Validate User ID
    // ===================================================

    if (
      !ObjectId.isValid(userId)
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

    const userObjectId =
      new ObjectId(userId);

    // ===================================================
    // Read FormData
    // ===================================================

    const formData =
      await request.formData();

    const documentType =
      formData.get(
        "documentType",
      );

    const document =
      formData.get(
        "document",
      );

    // ===================================================
    // Document Type
    // ===================================================

    if (
      documentType !==
      "aadhaar"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only Aadhaar verification is supported.",
        },
        {
          status: 400,
        },
      );
    }

    // ===================================================
    // Document Validation
    // ===================================================

    if (
      !document ||
      !(document instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please upload your Aadhaar document.",
        },
        {
          status: 400,
        },
      );
    }

    // ===================================================
    // Allowed File Types
    // ===================================================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        document.type,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WEBP or PDF files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    // ===================================================
    // Maximum File Size
    // ===================================================

    const MAX_FILE_SIZE =
      5 * 1024 * 1024;

    if (
      document.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aadhaar document must be 5 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    // ===================================================
    // Database
    // ===================================================

    const client =
      await clientPromise;

    const db =
      client.db(
        DATABASE_NAME,
      );

    const users =
      db.collection(
        USERS_COLLECTION,
      );

    const submissions =
      db.collection(
        SUBMISSIONS_COLLECTION,
      );

    // ===================================================
    // Find User
    // ===================================================

    const user =
      await users.findOne({
        _id: userObjectId,
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ===================================================
    // Current Verification
    // ===================================================

    const verification =
      user.sellerVerification;

    // ===================================================
    // Already Verified
    // ===================================================

    if (
      verification?.identityVerified ===
      true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your identity is already verified.",
        },
        {
          status: 400,
        },
      );
    }

    // ===================================================
    // Already Pending
    // ===================================================

    if (
      verification?.status ===
      "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your identity verification is already under review.",
        },
        {
          status: 400,
        },
      );
    }

    // ===================================================
    // Convert File → Buffer
    // ===================================================

    const arrayBuffer =
      await document.arrayBuffer();

    const buffer =
      Buffer.from(
        arrayBuffer,
      );

    // ===================================================
    // Upload Aadhaar to Cloudinary
    // ===================================================

    console.log(
      "Uploading Aadhaar document to Cloudinary...",
    );

    const cloudinaryResult =
      await uploadToCloudinary(
        buffer,
        document.name,
        document.type,
      );

    console.log(
      "Aadhaar uploaded successfully:",
      cloudinaryResult.public_id,
    );

    // ===================================================
    // Submission ID
    // ===================================================

    const submissionId =
      randomUUID();

    const now =
      new Date();

    // ===================================================
    // Create Submission
    // ===================================================

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

      // ===============================================
      // Cloudinary
      // ===============================================

      storageStatus:
        "stored",

      documentUrl:
        cloudinaryResult.secure_url,

      documentPublicId:
        cloudinaryResult.public_id,

      // ===============================================
      // Review
      // ===============================================

      reviewStatus:
        "pending",

      submittedAt:
        now,

      reviewedAt:
        null,

      reviewedBy:
        null,

      rejectionReason:
        null,

      createdAt:
        now,

      updatedAt:
        now,
    });

    // ===================================================
    // Update User Verification
    // ===================================================

    await users.updateOne(
      {
        _id:
          userObjectId,
      },
      {
        $set: {
          "sellerVerification.status":
            "pending",

          "sellerVerification.identityVerified":
            false,

          "sellerVerification.identityDocumentType":
            "aadhaar",

          "sellerVerification.identitySubmissionId":
            submissionId,

          "sellerVerification.identitySubmittedAt":
            now,

          "sellerVerification.identityReviewedAt":
            null,

          "sellerVerification.identityRejectionReason":
            null,

          updatedAt:
            now,
        },
      },
    );

    // ===================================================
    // Success
    // ===================================================

    return NextResponse.json(
      {
        success: true,

        status:
          "pending",

        submissionId,

        documentUrl:
          cloudinaryResult.secure_url,

        message:
          "Your Aadhaar verification has been submitted successfully and is now under review.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    // ===================================================
    // Error
    // ===================================================

    console.error(
      "IDENTITY VERIFICATION API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to submit identity verification.",
      },
      {
        status: 500,
      },
    );
  }
}