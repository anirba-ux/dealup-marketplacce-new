import {
  NextRequest,
  NextResponse,
} from "next/server";

// =====================================================
// OpenStreetMap Nominatim Proxy
//
// Supports:
// 1. Address -> Coordinates
// 2. Coordinates -> Address
//
// Product location does NOT depend on:
// - mobile QR
// - seller verification
// - seller profile location
// =====================================================

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org";

const USER_AGENT =
  "DealUp Marketplace/1.0 (location service)";

// =====================================================
// Types
// =====================================================

interface NominatimResult {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: Record<string, string>;
}

// =====================================================
// Coordinate Validation
// =====================================================

function isValidCoordinate(
  latitude: number,
  longitude: number,
) {
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
// Nominatim Request
// =====================================================

async function searchNominatim(
  query: string,
) {
  const url = new URL(
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
    "5",
  );

  url.searchParams.set(
    "countrycodes",
    "in",
  );

  url.searchParams.set(
    "dedupe",
    "1",
  );

  url.searchParams.set(
    "q",
    query,
  );

  const response = await fetch(
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
    throw new Error(
      "Nominatim request failed.",
    );
  }

  const results =
    (await response.json()) as NominatimResult[];

  return Array.isArray(results)
    ? results
    : [];
}

// =====================================================
// Find Best Result
// =====================================================

function getValidResult(
  results: NominatimResult[],
) {
  for (const result of results) {
    const latitude =
      Number(result.lat);

    const longitude =
      Number(result.lon);

    if (
      isValidCoordinate(
        latitude,
        longitude,
      )
    ) {
      return {
        result,
        latitude,
        longitude,
      };
    }
  }

  return null;
}

// =====================================================
// Build Search Queries
//
// We try the complete address first.
// If that fails, progressively simpler queries
// are attempted.
// =====================================================

function buildSearchQueries(
  rawQuery: string,
) {
  const cleaned = rawQuery
    .replace(/\s+/g, " ")
    .replace(/,+/g, ",")
    .trim();

  const parts = cleaned
    .split(",")
    .map((part) =>
      part.trim(),
    )
    .filter(Boolean);

  const queries: string[] = [];

  // ---------------------------------------------------
  // 1. Exact/full query
  // ---------------------------------------------------

  if (cleaned) {
    queries.push(cleaned);
  }

  // ---------------------------------------------------
  // 2. Remove "India" duplicate
  // ---------------------------------------------------

  const withoutIndia =
    parts.filter(
      (part) =>
        part.toLowerCase() !==
        "india",
    );

  if (
    withoutIndia.length > 0
  ) {
    queries.push(
      withoutIndia.join(
        ", ",
      ) + ", India",
    );
  }

  // ---------------------------------------------------
  // 3. Keep locality + city + district + state
  //
  // Useful when a house/road name is not indexed.
  // ---------------------------------------------------

  if (
    withoutIndia.length >= 2
  ) {
    const fallbackParts =
      withoutIndia.slice(
        Math.max(
          0,
          withoutIndia.length - 4,
        ),
      );

    queries.push(
      fallbackParts.join(
        ", ",
      ) + ", India",
    );
  }

  // ---------------------------------------------------
  // Remove duplicate queries
  // ---------------------------------------------------

  return Array.from(
    new Set(
      queries.filter(Boolean),
    ),
  );
}

// =====================================================
// Forward Geocoding
//
// Address -> Coordinates
// =====================================================

async function forwardGeocode(
  query: string,
) {
  const queries =
    buildSearchQueries(
      query,
    );

  for (const searchQuery of queries) {
    try {
      const results =
        await searchNominatim(
          searchQuery,
        );

      const valid =
        getValidResult(
          results,
        );

      if (valid) {
        return {
          ...valid,
          searchedQuery:
            searchQuery,
        };
      }
    } catch (error) {
      console.error(
        "NOMINATIM SEARCH ERROR:",
        error,
      );
    }
  }

  return null;
}

// =====================================================
// GET
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const mode =
      searchParams.get(
        "mode",
      );

    // =================================================
    // FORWARD GEOCODING
    //
    // Address -> Coordinates
    // =================================================

    if (
      mode === "search"
    ) {
      const query =
        searchParams
          .get("q")
          ?.trim();

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

      if (
        query.length < 2
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Please enter a more complete address.",
          },
          {
            status: 400,
          },
        );
      }

      const result =
        await forwardGeocode(
          query,
        );

      if (!result) {
        return NextResponse.json(
          {
            success: false,

            message:
              "We could not find this address. Please enter a nearby city, locality, district or pincode and try again.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        success: true,

        latitude:
          result.latitude,

        longitude:
          result.longitude,

        displayName:
          result.result
            .display_name ??
          "",

        address:
          result.result.address ??
          {},

        searchedQuery:
          result.searchedQuery,
      });
    }

    // =================================================
    // REVERSE GEOCODING
    //
    // Coordinates -> Address
    // =================================================

    if (
      mode === "reverse"
    ) {
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
        !isValidCoordinate(
          latitude,
          longitude,
        )
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
        (await response.json()) as NominatimResult;

      return NextResponse.json({
        success: true,

        latitude,

        longitude,

        displayName:
          result.display_name ??
          "",

        address:
          result.address ??
          {},
      });
    }

    // =================================================
    // Invalid Mode
    // =================================================

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