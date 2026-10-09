
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  deleteService,
  findServiceById,
  updateService,
} from "@/lib/repositories/service.repository";
import { serviceSchema } from "@/lib/validations/service";

interface RouteProps {
  params: Promise<{
    serviceId: string;
  }>;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// =====================================================
// GET — LOAD ONE SERVICE (OWNER ONLY)
// =====================================================

export async function GET(
  _request: Request,
  { params }: RouteProps,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { serviceId } = await params;

    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID." },
        { status: 400 },
      );
    }

    const service = await findServiceById(serviceId);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 },
      );
    }

    if (String(service.sellerId) !== String(session.user.id)) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to access this service." },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("[GET /api/services/[serviceId]]", error);

    return NextResponse.json(
      { success: false, message: "Failed to load service." },
      { status: 500 },
    );
  }
}

// =====================================================
// PATCH — UPDATE SERVICE (OWNER ONLY)
// =====================================================

export async function PATCH(
  request: Request,
  { params }: RouteProps,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const sellerId = String(session.user.id);
    const { serviceId } = await params;

    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID." },
        { status: 400 },
      );
    }

    const existing = await findServiceById(serviceId);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 },
      );
    }

    if (String(existing.sellerId) !== sellerId) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to edit this service." },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the service information and try again.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const lat = Number(data.location.coordinates.lat);
    const lng = Number(data.location.coordinates.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      (lat === 0 && lng === 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Please select a valid service location." },
        { status: 400 },
      );
    }

    const title = data.title.trim();
    const baseSlug = createSlug(title);

    if (!baseSlug) {
      return NextResponse.json(
        { success: false, message: "A valid service title is required." },
        { status: 400 },
      );
    }

    // Preserve the existing slug unless the title changes.
    let slug = existing.slug;

    if (title !== existing.title) {
      slug = `${baseSlug}-${serviceId}`;

      // Ensure the generated slug does not collide with another listing.
      // The service ID suffix makes collisions unlikely and deterministic.
    }

    // Only editable fields are accepted from the request.
    // Owner, verification, status, stats and promotion fields are preserved.
    const updateData = {
      title,
      slug,
      listingType: data.listingType,
      description: data.description.trim(),
      category: data.category,
      subcategory: data.subcategory,
      businessName: data.businessName?.trim() || undefined,
      businessType: data.businessType?.trim() || undefined,
      yearsOfExperience: data.yearsOfExperience,
      serviceMode: data.serviceMode,
      servicesOffered: data.servicesOffered,
      serviceAreas: data.serviceAreas,
      startingPrice: data.priceOnRequest ? undefined : data.startingPrice,
      priceUnit: data.priceUnit,
      priceOnRequest: data.priceOnRequest,
      currency: "INR" as const,
      images: data.images,
      thumbnail: data.thumbnail,
      location: {
        ...data.location,
        coordinates: { lat, lng },
      },
      contact: data.contact,
      openingHours: data.openingHours,
    };

    const result = await updateService(
      serviceId,
      sellerId,
      updateData,
    );

    if (!result || result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found or you do not have permission to edit it.",
        },
        { status: 404 },
      );
    }

    if (existing.slug) {
      revalidatePath(`/services/${existing.slug}`);
    }

    if (slug) {
      revalidatePath(`/services/${slug}`);
    }

    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/dashboard/my-services");

    return NextResponse.json({
      success: true,
      message: "Service updated successfully.",
      service: {
        _id: serviceId,
        slug,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/services/[serviceId]]", error);

    return NextResponse.json(
      { success: false, message: "Failed to update service." },
      { status: 500 },
    );
  }
}

// =====================================================
// DELETE — DELETE SERVICE (OWNER ONLY)
// =====================================================

export async function DELETE(
  _request: Request,
  { params }: RouteProps,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const sellerId = String(session.user.id);
    const { serviceId } = await params;

    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID." },
        { status: 400 },
      );
    }

    const existing = await findServiceById(serviceId);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 },
      );
    }

    if (String(existing.sellerId) !== sellerId) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to delete this service." },
        { status: 403 },
      );
    }

    const result = await deleteService(serviceId, sellerId);

    if (!result || result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Service could not be deleted." },
        { status: 404 },
      );
    }

    if (existing.slug) {
      revalidatePath(`/services/${existing.slug}`);
    }

    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/dashboard/my-services");

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/services/[serviceId]]", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete service." },
      { status: 500 },
    );
  }
}
