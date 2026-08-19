import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { getWishlistProductIds } from "@/lib/repositories/wishlist.repository";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({
        productIds: [],
      });
    }

    const userId = (session.user as any).id;

    const productIds = await getWishlistProductIds(userId);

    return NextResponse.json({
      productIds,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}