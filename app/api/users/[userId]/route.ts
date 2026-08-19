import { NextRequest, NextResponse } from "next/server";

import clientPromise from "@/lib/db/mongodb";
import { findUserById } from "@/lib/repositories/user.repository";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    // ==========================
    // User
    // ==========================

    const user = await findUserById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================
    // Seller Products
    // ==========================

    const client = await clientPromise;
    const db = client.db("dealup");

    const products = await db
      .collection("products")
      .find({
        sellerId: userId,
        status: "active",
      })
      .project({
        title: 1,
        slug: 1,
        thumbnail: 1,
        price: 1,
        category: 1,
        location: 1,
        createdAt: 1,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    // ==========================
    // Response
    // ==========================

    return NextResponse.json({
      success: true,
      user,
      products,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);

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
