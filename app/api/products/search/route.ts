import { NextRequest, NextResponse } from "next/server";

import { searchProducts } from "@/lib/repositories/product.repository";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json([]);
    }

    const products = await searchProducts(q, 5);

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search products.",
      },
      {
        status: 500,
      }
    );
  }
}