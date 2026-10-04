import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  deleteJob,
  findJobById,
  updateJob,
} from "@/lib/repositories/job.repository";

import {
  jobSchema,
} from "@/lib/validations/job";


// =====================================================
// TYPES
// =====================================================

interface Props {
  params: Promise<{
    id: string;
  }>;
}


// =====================================================
// GET — SINGLE JOB
// =====================================================

export async function GET(
  request: Request,
  { params }: Props,
) {
  try {
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

    const { id } = await params;

    const job = await findJobById(id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // Ownership check
    // -------------------------------------------------

    if (
      String(job.employerId) !==
      String(session.user.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to access this job.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(
      "GET SINGLE JOB API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load job.",
      },
      {
        status: 500,
      },
    );
  }
}


// =====================================================
// PATCH — UPDATE JOB
// =====================================================

export async function PATCH(
  request: Request,
  { params }: Props,
) {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Params
    // -------------------------------------------------

    const { id } = await params;

    const employerId = String(
      session.user.id,
    );

    // -------------------------------------------------
    // Check existing job
    // -------------------------------------------------

    const existingJob =
      await findJobById(id);

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // Ownership protection
    // -------------------------------------------------

    if (
      String(existingJob.employerId) !==
      employerId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to edit this job.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Request body
    // -------------------------------------------------

    const body = await request.json();

    // -------------------------------------------------
    // Validate with existing Job schema
    // -------------------------------------------------

    const parsed =
      jobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please check the job information and try again.",
          errors: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = parsed.data;

    // -------------------------------------------------
    // Coordinates validation
    // -------------------------------------------------

    const lat = Number(
      data.location.coordinates.lat,
    );

    const lng = Number(
      data.location.coordinates.lng,
    );

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat === 0 ||
      lng === 0 ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid job location on the map.",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------------------------
    // Employer validation
    // -------------------------------------------------

    const companyName =
      data.employer.companyName
        ?.trim();

    if (!companyName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Company name is required.",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------------------------
    // Clean thumbnail
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Clean infographic
    // -------------------------------------------------

    const infographic =
      data.infographic?.publicId &&
      data.infographic?.url
        ? {
            publicId:
              data.infographic.publicId.trim(),
            url:
              data.infographic.url.trim(),
          }
        : undefined;

    // -------------------------------------------------
    // Update only editable fields
    // -------------------------------------------------

    const updateData = {
      listingType:
        data.listingType,

      employer: {
        ...data.employer,
        companyName,
      },

      employerName:
        companyName,

      jobs: data.jobs,

      location: {
        ...data.location,
        coordinates: {
          lat,
          lng,
        },
      },

      thumbnail,

      infographic,
    };

    // -------------------------------------------------
    // Update database
    // -------------------------------------------------

    const result =
      await updateJob(
        id,
        employerId,
        updateData,
      );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to update job.",
        },
        {
          status: 400,
        },
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Job not found or you do not have permission to edit it.",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Job updated successfully.",
    });
  } catch (error) {
    console.error(
      "PATCH JOB API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update job.",
      },
      {
        status: 500,
      },
    );
  }
}


// =====================================================
// DELETE — DELETE JOB
// =====================================================

export async function DELETE(
  request: Request,
  { params }: Props,
) {
  try {
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

    const { id } = await params;

    const employerId =
      String(session.user.id);

    const result =
      await deleteJob(
        id,
        employerId,
      );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to delete job.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      result.deletedCount === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Job not found or you do not have permission to delete it.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Job deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE JOB API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete job.",
      },
      {
        status: 500,
      },
    );
  }
}