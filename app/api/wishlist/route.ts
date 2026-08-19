import { NextResponse } from "next/server";
import { auth } from "@/auth";

import {
  addToWishlist,
  removeFromWishlist,
  isWishlisted,
} from "@/lib/repositories/wishlist.repository";

/* ===========================
   POST (Add / Remove Wishlist)
=========================== */

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const existing = await isWishlisted(userId, productId);

    if (existing) {
      await removeFromWishlist(userId, productId);

      return NextResponse.json({
        success: true,
        wishlisted: false,
      });
    }

    await addToWishlist(userId, productId);

    return NextResponse.json({
      success: true,
      wishlisted: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ===========================
   GET (Check Wishlist)
=========================== */

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({
        wishlisted: false,
      });
    }

    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const existing = await isWishlisted(
      userId,
      productId
    );

    return NextResponse.json({
      wishlisted: !!existing,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}