import { NextRequest, NextResponse } from "next/server";

import { findNearbyProducts } from "@/lib/repositories/product.repository";

/* =======================================
   GET Nearby Products
======================================= */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    const radius = Number(searchParams.get("radius") ?? "25");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          success: false,
          message: "Latitude and Longitude are required.",
        },
        {
          status: 400,
        },
      );
    }

    const products = await findNearbyProducts(
      lat,
      lng,
      radius,
    );

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}