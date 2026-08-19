import { NextResponse } from "next/server";

import { auth } from "@/auth";

import { findProductsBySeller } from "@/lib/repositories/product.repository";

export async function GET() {
  try {
    // ===============================
    // Authentication
    // ===============================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ===============================
    // Get User Products
    // ===============================

    console.log("Session User ID:", session.user.id);

    const products = await findProductsBySeller(
      session.user.id
    );

    // ===============================
    // Response
    // ===============================

    return NextResponse.json(
      {
        success: true,
        products,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load your products.",
      },
      {
        status: 500,
      }
    );
  }
}