import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import cloudinary from "@/lib/cloudinary";

// =====================================================
// Route Params
// =====================================================

interface RouteContext {
  params: Promise<{
    submissionId: string;
  }>;
}

// =====================================================
// GET
//
// Admin-only identity document viewer.
//
// Current DealUp schema:
//
// documentPublicId
// documentUrl
// storageStatus
//
// Existing Cloudinary Aadhaar assets are PUBLIC.
//
// Future authenticated/private assets are also
// supported when delivery type is stored.
// =====================================================

export async function GET(request: NextRequest, context: RouteContext) {
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
          message: "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Submission ID
    // =================================================

    const { submissionId } = await context.params;

    const cleanSubmissionId =
      typeof submissionId === "string" ? submissionId.trim() : "";

    if (!cleanSubmissionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Identity submission ID is required.",
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

    const submissions = db.collection("identityVerificationSubmissions");

    // =================================================
    // Find Submission
    // =================================================

    const submission = await submissions.findOne({
      submissionId: cleanSubmissionId,
    });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Identity submission not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Storage Status
    // =================================================

    if (submission.storageStatus !== "stored") {
      return NextResponse.json(
        {
          success: false,
          message: "Secure identity document is not available.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Public ID
    // =================================================

    const documentPublicId =
      typeof submission.documentPublicId === "string"
        ? submission.documentPublicId.trim()
        : "";

    if (!documentPublicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Identity document public ID is missing.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Resource Type
    //
    // Current Aadhaar:
    // image
    //
    // Default = image
    // =================================================

    const resourceType =
      submission.documentResourceType === "raw" ? "raw" : "image";

    // =================================================
    // Delivery Type
    //
    // Existing Cloudinary asset:
    // public upload
    //
    // Future authenticated assets:
    // authenticated
    //
    // Default = upload
    // =================================================

    const deliveryType =
      submission.documentDeliveryType === "authenticated" ||
      submission.cloudinaryType === "authenticated"
        ? "authenticated"
        : "upload";

    // =================================================
    // Format
    // =================================================

    let format: string | undefined;

    if (
      typeof submission.documentFormat === "string" &&
      submission.documentFormat.trim()
    ) {
      format = submission.documentFormat.trim();
    } else if (
      typeof submission.cloudinaryFormat === "string" &&
      submission.cloudinaryFormat.trim()
    ) {
      format = submission.cloudinaryFormat.trim();
    } else if (typeof submission.mimeType === "string") {
      const mimeType = submission.mimeType.toLowerCase();

      if (mimeType === "application/pdf") {
        format = "pdf";
      } else if (mimeType === "image/png") {
        format = "png";
      } else if (mimeType === "image/webp") {
        format = "webp";
      } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
        format = "jpg";
      }
    }

    // =================================================
    // EXISTING PUBLIC DOCUMENT
    //
    // Your current Aadhaar asset is PUBLIC
    // according to Cloudinary Media Library.
    //
    // Therefore use the existing stored URL
    // whenever the delivery type is public/upload.
    // =================================================

    if (deliveryType === "upload") {
      const existingDocumentUrl =
        typeof submission.documentUrl === "string"
          ? submission.documentUrl.trim()
          : "";

      if (existingDocumentUrl) {
        return NextResponse.json(
          {
            success: true,

            url: existingDocumentUrl,

            submissionId: cleanSubmissionId,

            resourceType,

            deliveryType: "upload",
          },
          {
            status: 200,

            headers: {
              "Cache-Control": "private, no-store, max-age=0",
            },
          },
        );
      }

      // -----------------------------------------------
      // If documentUrl is missing,
      // generate Cloudinary public URL.
      // -----------------------------------------------

      try {
        const publicUrl = cloudinary.url(documentPublicId, {
          secure: true,

          resource_type: resourceType,

          type: "upload",

          ...(format ? { format } : {}),
        });

        return NextResponse.json(
          {
            success: true,

            url: publicUrl,

            submissionId: cleanSubmissionId,

            resourceType,

            deliveryType: "upload",
          },
          {
            status: 200,

            headers: {
              "Cache-Control": "private, no-store, max-age=0",
            },
          },
        );
      } catch (error) {
        console.error("CLOUDINARY PUBLIC URL ERROR:", error);

        return NextResponse.json(
          {
            success: false,

            message: "Unable to generate identity document URL.",
          },
          {
            status: 500,
          },
        );
      }
    }

    // =================================================
    // AUTHENTICATED DOCUMENT
    //
    // Used for future private identity documents.
    // =================================================

    try {
      const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;

      const secureFormat = format ?? "jpg";

      const secureUrl = cloudinary.utils.private_download_url(
        documentPublicId,

        secureFormat,

        {
          resource_type: resourceType,

          type: "authenticated",

          expires_at: expiresAt,
        },
      );

      return NextResponse.json(
        {
          success: true,

          url: secureUrl,

          expiresAt,

          submissionId: cleanSubmissionId,

          resourceType,

          deliveryType: "authenticated",
        },
        {
          status: 200,

          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        },
      );
    } catch (error) {
      console.error("CLOUDINARY AUTHENTICATED URL ERROR:", error);

      return NextResponse.json(
        {
          success: false,

          message: "Unable to generate secure identity document URL.",
        },
        {
          status: 500,
        },
      );
    }
  } catch (error) {
    console.error("ADMIN IDENTITY DOCUMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to open identity document.",
      },
      {
        status: 500,
      },
    );
  }
}
