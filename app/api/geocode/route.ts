import { NextResponse } from "next/server";

// =====================================================
// GET /api/geocode?q=Chuchura
// =====================================================

export async function GET(request: Request) {
  try {
    // =================================================
    // Query
    // =================================================

    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim();

    // =================================================
    // Validation
    // =================================================

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Location search query is required.",
          results: [],
        },
        { status: 400 },
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter at least 2 characters.",
          results: [],
        },
        { status: 400 },
      );
    }

    // =================================================
    // Nominatim
    // =================================================

    const nominatimUrl = new URL(
      "https://nominatim.openstreetmap.org/search",
    );

    nominatimUrl.searchParams.set("q", query);
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("limit", "8");
    nominatimUrl.searchParams.set("countrycodes", "in");

    // =================================================
    // Fetch
    // =================================================

    const response = await fetch(nominatimUrl.toString(), {
      method: "GET",

      headers: {
        Accept: "application/json",

        "User-Agent":
          "DealUp Marketplace/1.0 (location search)",
      },

      cache: "no-store",
    });

    // =================================================
    // Nominatim Error
    // =================================================

    if (!response.ok) {
      console.error(
        "NOMINATIM ERROR:",
        response.status,
        response.statusText,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Location search service is temporarily unavailable.",
          results: [],
        },
        { status: 502 },
      );
    }

    // =================================================
    // Parse
    // =================================================

    const data: unknown = await response.json();

    // =================================================
    // Normalize
    // =================================================

    const results = Array.isArray(data)
      ? data
          .map((item: any) => {
            // -----------------------------------------
            // IMPORTANT
            // Nominatim returns:
            //
            // lat -> string
            // lon -> string
            // -----------------------------------------

            const latitude = Number(item?.lat);
            const longitude = Number(item?.lon);

            // -----------------------------------------
            // NEVER allow NaN
            // -----------------------------------------

            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude)
            ) {
              return null;
            }

            // -----------------------------------------
            // Coordinate range validation
            // -----------------------------------------

            if (
              latitude < -90 ||
              latitude > 90 ||
              longitude < -180 ||
              longitude > 180
            ) {
              return null;
            }

            return {
              placeId: String(item?.place_id ?? ""),

              displayName: String(
                item?.display_name ?? "",
              ),

              latitude,

              longitude,

              type: String(item?.type ?? ""),

              category: String(
                item?.category ?? "",
              ),

              address:
                item?.address &&
                typeof item.address === "object"
                  ? item.address
                  : {},
            };
          })
          .filter(
            (
              item,
            ): item is NonNullable<typeof item> =>
              item !== null,
          )
      : [];

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,
        results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "GEOCODE API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search location.",
        results: [],
      },
      { status: 500 },
    );
  }
}