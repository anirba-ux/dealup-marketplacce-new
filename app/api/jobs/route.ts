import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import {
  createJob,
} from "@/lib/repositories/job.repository";

import {
  jobSchema,
} from "@/lib/validations/job";

import {
  Job,
} from "@/lib/models/job";

// =====================================================
// Coordinate Validation
// =====================================================

function isValidCoordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

// =====================================================
// POST — Create Job
// =====================================================

export async function POST(
  request: NextRequest,
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
    // Employer ID
    // =================================================

    const employerId = String(
      session.user.id,
    );

    if (!ObjectId.isValid(employerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid employer account.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Request Body
    // =================================================

    const body = await request.json();

    // =================================================
    // Zod Validation
    // =================================================

    const validation =
      jobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please check the job information.",
          errors:
            validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = validation.data;

    // =================================================
    // Single / Multiple Validation
    // =================================================

    if (
      data.listingType === "single" &&
      data.jobs.length !== 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Single Job listing must contain exactly one job position.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      data.listingType === "multiple" &&
      data.jobs.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Multiple Jobs listing must contain at least two job positions.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Location
    // =================================================

    const latitude = Number(
      data.location.coordinates.lat,
    );

    const longitude = Number(
      data.location.coordinates.lng,
    );

    if (
      !isValidCoordinate(
        latitude,
        longitude,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid job location coordinates are required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Employer Name
    // =================================================

    const employerName =
      data.employer.companyName.trim();

    // =================================================
    // Thumbnail
    // =================================================
    //
    // The actual image is stored on Cloudinary.
    // MongoDB stores the Cloudinary publicId + URL.
    //
    // =================================================

    const thumbnail =
      data.thumbnail?.publicId &&
      data.thumbnail?.url
        ? {
            publicId:
              data.thumbnail.publicId.trim(),

            url:
              data.thumbnail.url.trim(),
          }
        : undefined;

    // =================================================
    // Create Job Document
    // =================================================

    const now = new Date();

    const job: Job = {
      listingType:
        data.listingType,

      status: "active",

      jobs: data.jobs,

      employer: {
        companyName:
          data.employer.companyName.trim(),

        contactPerson:
          data.employer.contactPerson.trim(),

        phone:
          data.employer.phone.trim(),

        email:
          data.employer.email?.trim() ||
          undefined,

        website:
          data.employer.website?.trim() ||
          undefined,
      },

      location: {
        country:
          data.location.country.trim(),

        state:
          data.location.state.trim(),

        district:
          data.location.district.trim(),

        city:
          data.location.city.trim(),

        pincode:
          data.location.pincode.trim(),

        address:
          data.location.address?.trim() ||
          undefined,

        coordinates: {
          lat: latitude,
          lng: longitude,
        },
      },

      // =================================================
      // Job Thumbnail
      // =================================================

      thumbnail,

      // =================================================
      // Legacy Infographic
      // =================================================
      //
      // If older form data still sends infographic,
      // preserve it for backward compatibility.
      //
      // New listings should use thumbnail.
      //

      infographic:
        data.infographic?.publicId &&
        data.infographic?.url
          ? {
              publicId:
                data.infographic.publicId.trim(),

              url:
                data.infographic.url.trim(),
            }
          : undefined,

      employerId,

      employerName,

      views: 0,

      applications: 0,

      isFeatured: false,

      isBoosted: false,

      createdAt: now,

      updatedAt: now,
    };

    // =================================================
    // Save To MongoDB
    // =================================================

    const result =
      await createJob(job);

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Job posted successfully.",

        jobId:
          result.insertedId.toString(),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "CREATE JOB ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create job listing.",
      },
      {
        status: 500,
      },
    );
  }
}