import { NextRequest, NextResponse } from "next/server";

import crypto from "crypto";

import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    const type = (formData.get("type") as string) || "product";

    // =====================================================
    // Validate File
    // =====================================================

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // IMAGE UPLOAD
    // =====================================================

    if (
      type === "product" ||
      type === "profile" ||
      type === "chat" ||
      type === "verification"
    ) {
      // ===================================================
      // Supported Image MIME Types
      // ===================================================

      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
        "image/bmp",
        "image/svg+xml",
        "image/tiff",
        "image/x-icon",
        "image/vnd.microsoft.icon",
      ];

      // ===================================================
      // Validate MIME Type
      // ===================================================

      if (!allowedImageTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unsupported image format. Please upload a valid image file.",
          },
          {
            status: 400,
          },
        );
      }

      // ===================================================
      // Maximum Image Size
      // ===================================================

      const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: "Image size must be less than 10 MB.",
          },
          {
            status: 400,
          },
        );
      }

      // ===================================================
      // File -> Buffer
      // ===================================================

      const bytes = await file.arrayBuffer();

      const buffer = Buffer.from(bytes);

      // ===================================================
      // Exact Image Fingerprint
      //
      // SHA-256 identifies the exact uploaded file.
      // This will later be used by the Trust Engine
      // to detect image reuse across product listings.
      // ===================================================

      const imageHash = crypto
        .createHash("sha256")
        .update(buffer)
        .digest("hex");

      // ===================================================
      // Image Folder
      // ===================================================

      const folder =
        type === "profile"
          ? "dealup/profile"
          : type === "chat"
            ? "dealup/chat"
            : type === "verification"
              ? "dealup/verification"
              : "dealup/products";

      // ===================================================
      // Cloudinary Image Upload
      // ===================================================

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,

              resource_type: "image",

              // Keep original upload format.
              // Cloudinary can process the image
              // and generate optimized versions later.

              use_filename: true,

              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          )
          .end(buffer);
      });

      // ===================================================
      // Return Image Result
      // ===================================================

      return NextResponse.json({
        success: true,

        type: "image",
        image: {
          publicId: uploadResult.public_id,

          url: uploadResult.secure_url,

          imageHash,

          width: uploadResult.width,

          height: uploadResult.height,

          format: uploadResult.format,

          resourceType: uploadResult.resource_type,

          originalFilename: file.name,

          originalMimeType: file.type,

          size: file.size,
        },
      });
    }

    // =====================================================
    // DOCUMENT UPLOAD
    // =====================================================

    if (type === "document") {
      const allowedDocumentTypes = [
        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/zip",

        "application/x-zip-compressed",
      ];

      // ===================================================
      // Validate MIME Type
      // ===================================================

      if (!allowedDocumentTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,

            message: "Only PDF, DOC, DOCX and ZIP files are allowed.",
          },
          {
            status: 400,
          },
        );
      }

      // ===================================================
      // Maximum Document Size
      // ===================================================

      const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

      if (file.size > MAX_DOCUMENT_SIZE) {
        return NextResponse.json(
          {
            success: false,

            message: "Document size must be less than 20 MB.",
          },
          {
            status: 400,
          },
        );
      }

      // ===================================================
      // File -> Buffer
      // ===================================================

      const bytes = await file.arrayBuffer();

      const buffer = Buffer.from(bytes);

      // ===================================================
      // Cloudinary Document Upload
      // ===================================================

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "dealup/chat",

              resource_type: "raw",

              use_filename: true,

              unique_filename: true,
            },

            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          )
          .end(buffer);
      });

      return NextResponse.json({
        success: true,

        type: "document",

        document: {
          publicId: uploadResult.public_id,

          url: uploadResult.secure_url,

          name: file.name,

          size: file.size,

          mimeType: file.type,
        },
      });
    }

    // =====================================================
    // VIDEO UPLOAD
    // =====================================================

    if (type === "video") {
      const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];

      // ===================================================
      // Validate MIME Type
      // ===================================================

      if (!allowedVideoTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,

            message: "Only MP4, MOV and WEBM videos are allowed.",
          },
          {
            status: 400,
          },
        );
      }

      // ===================================================
      // Maximum Video Size
      // ===================================================

      const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          {
            success: false,

            message: "Video size must be less than 50 MB.",
          },
          {
            status: 400,
          },
        );
      }

      // ===================================================
      // File -> Buffer
      // ===================================================

      const bytes = await file.arrayBuffer();

      const buffer = Buffer.from(bytes);

      // ===================================================
      // Cloudinary Video Upload
      // ===================================================

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "dealup/chat",

              resource_type: "video",

              use_filename: true,

              unique_filename: true,
            },

            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          )
          .end(buffer);
      });

      // ===================================================
      // Return Video Upload Result
      // ===================================================

      return NextResponse.json({
        success: true,

        type: "video",

        video: {
          publicId: uploadResult.public_id,

          url: uploadResult.secure_url,

          name: file.name,

          size: file.size,

          mimeType: file.type,

          width: uploadResult.width,

          height: uploadResult.height,

          duration: uploadResult.duration,
        },
      });
    }

    // =====================================================
    // Unsupported Upload Type
    // =====================================================

    return NextResponse.json(
      {
        success: false,

        message: "Unsupported upload type.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "File upload failed.",
      },
      {
        status: 500,
      },
    );
  }
}
