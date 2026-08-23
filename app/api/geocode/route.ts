import {
  NextRequest,
  NextResponse,
} from "next/server";

// =====================================================
// OpenStreetMap Nominatim Proxy
//
// Used for:
// 1. Address -> Coordinates
// 2. Coordinates -> Address
//
// IMPORTANT:
// Requests are server-side so we can provide a proper
// application User-Agent and keep geocoding logic out
// of the browser.
// =====================================================

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org";

const USER_AGENT =
  "DealUp Marketplace/1.0 (location service)";

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const mode =
      searchParams.get("mode");

    // =================================================
    // Forward Geocoding
    //
    // Address -> Coordinates
    // =================================================

    if (mode === "search") {
      const query =
        searchParams.get("q")?.trim();

      if (!query) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Address is required.",
          },
          {
            status: 400,
          },
        );
      }

      const url =
        new URL(
          `${NOMINATIM_URL}/search`,
        );

      url.searchParams.set(
        "format",
        "jsonv2",
      );

      url.searchParams.set(
        "addressdetails",
        "1",
      );

      url.searchParams.set(
        "limit",
        "1",
      );

      url.searchParams.set(
        "countrycodes",
        "in",
      );

      url.searchParams.set(
        "q",
        query,
      );

      const response =
        await fetch(
          url.toString(),
          {
            headers: {
              "User-Agent":
                USER_AGENT,

              Accept:
                "application/json",
            },

            cache:
              "no-store",
          },
        );

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to find this address.",
          },
          {
            status: 502,
          },
        );
      }

      const results =
        await response.json();

      if (
        !Array.isArray(results) ||
        results.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "We could not find this address. Please enter a more complete address.",
          },
          {
            status: 404,
          },
        );
      }

      const result =
        results[0];

      return NextResponse.json({
        success: true,

        latitude:
          Number(result.lat),

        longitude:
          Number(result.lon),

        displayName:
          result.display_name ?? "",

        address:
          result.address ?? {},
      });
    }

    // =================================================
    // Reverse Geocoding
    //
    // Coordinates -> Address
    // =================================================

    if (mode === "reverse") {
      const latitude =
        Number(
          searchParams.get(
            "lat",
          ),
        );

      const longitude =
        Number(
          searchParams.get(
            "lng",
          ),
        );

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Valid coordinates are required.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid coordinates.",
          },
          {
            status: 400,
          },
        );
      }

      const url =
        new URL(
          `${NOMINATIM_URL}/reverse`,
        );

      url.searchParams.set(
        "format",
        "jsonv2",
      );

      url.searchParams.set(
        "addressdetails",
        "1",
      );

      url.searchParams.set(
        "zoom",
        "18",
      );

      url.searchParams.set(
        "lat",
        String(latitude),
      );

      url.searchParams.set(
        "lon",
        String(longitude),
      );

      const response =
        await fetch(
          url.toString(),
          {
            headers: {
              "User-Agent":
                USER_AGENT,

              Accept:
                "application/json",
            },

            cache:
              "no-store",
          },
        );

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to identify this location.",
          },
          {
            status: 502,
          },
        );
      }

      const result =
        await response.json();

      const address =
        result.address ?? {};

      return NextResponse.json({
        success: true,

        latitude,

        longitude,

        displayName:
          result.display_name ?? "",

        address,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid geocoding mode.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "GEOCODING API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process location.",
      },
      {
        status: 500,
      },
    );
  }
}