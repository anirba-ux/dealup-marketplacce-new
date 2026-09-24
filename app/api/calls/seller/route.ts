import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

const EDESY_API_URL =
  "https://voice-api.edesy.in/v1/masking/calls";

/**
 * Normalize an Indian mobile number to exactly 10 digits.
 *
 * Supported examples:
 * 9876543210
 * +91 9876543210
 * 919876543210
 */
function normalizeIndianPhone(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return digits;
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    // =========================================================
    // 1. AUTHENTICATION
    // =========================================================

    const session = await auth();

    const buyerId = String(
      (session?.user as { id?: string } | undefined)?.id ?? "",
    ).trim();

    if (!buyerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to call the seller.",
        },
        { status: 401 },
      );
    }

    // Buyer ID must be a valid MongoDB ObjectId
    if (!ObjectId.isValid(buyerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid buyer account ID.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 2. REQUEST BODY
    // =========================================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const productId = String(
      (body as { productId?: unknown } | null)?.productId ?? "",
    ).trim();

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 3. EDESY API KEY
    // =========================================================

    const apiKey = process.env.EDESY_API_KEY;

    if (!apiKey) {
      console.error("EDESY_API_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          message:
            "Secure calling service is not configured.",
        },
        { status: 500 },
      );
    }

    // =========================================================
    // 4. DATABASE
    // =========================================================

    const client = await clientPromise;
    const db = client.db("dealup");

    const products = db.collection("products");
    const users = db.collection("users");
    const callLogs = db.collection("callLogs");

    // =========================================================
    // 5. FIND PRODUCT
    // =========================================================

    const productObjectId = new ObjectId(productId);

    const product = await products.findOne({
      _id: productObjectId,
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 },
      );
    }

    // =========================================================
    // 6. FIND SELLER
    // =========================================================

    const sellerId = String(
      product.sellerId ?? "",
    ).trim();

    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller information is unavailable.",
        },
        { status: 404 },
      );
    }

    // Seller ID must also be a valid MongoDB ObjectId
    if (!ObjectId.isValid(sellerId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid seller account information.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 7. PREVENT SELF-CALL
    // =========================================================

    if (buyerId === sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot call yourself.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 8. FIND BUYER + SELLER
    //
    // IMPORTANT:
    // MongoDB _id is treated as ObjectId.
    // No string/ObjectId union query is used.
    // =========================================================

    const buyerObjectId = new ObjectId(buyerId);
    const sellerObjectId = new ObjectId(sellerId);

    const [buyer, seller] = await Promise.all([
      users.findOne({
        _id: buyerObjectId,
      }),

      users.findOne({
        _id: sellerObjectId,
      }),
    ]);

    // =========================================================
    // 9. VERIFY BUYER ACCOUNT
    // =========================================================

    if (!buyer) {
      return NextResponse.json(
        {
          success: false,
          message: "Buyer account not found.",
        },
        { status: 404 },
      );
    }

    // =========================================================
    // 10. VERIFY SELLER ACCOUNT
    // =========================================================

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller account not found.",
        },
        { status: 404 },
      );
    }

    // =========================================================
    // 11. PHONE NUMBERS
    //
    // IMPORTANT:
    // These numbers remain SERVER-SIDE ONLY.
    //
    // They are never returned to the browser.
    // =========================================================

    const buyerPhone = normalizeIndianPhone(
      buyer.phone ?? buyer.mobile,
    );

    const sellerPhone = normalizeIndianPhone(
      seller.phone ?? seller.mobile,
    );

    // =========================================================
    // 12. BUYER PHONE AVAILABLE?
    // =========================================================

    if (!buyerPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your verified phone number is not available.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 13. SELLER PHONE AVAILABLE?
    // =========================================================

    if (!sellerPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller phone number is not available.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 14. PREVENT SAME PHONE NUMBER
    // =========================================================

    if (buyerPhone === sellerPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Buyer and seller numbers cannot be the same.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 15. BUYER PHONE VERIFICATION
    // =========================================================

    const buyerPhoneVerified = Boolean(
      buyer.sellerVerification?.phoneVerified ??
        buyer.isPhoneVerified ??
        false,
    );

    if (!buyerPhoneVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete phone verification before calling a seller.",
        },
        { status: 403 },
      );
    }

    // =========================================================
    // 16. SELLER PHONE VERIFICATION
    // =========================================================

    const sellerPhoneVerified = Boolean(
      seller.sellerVerification?.phoneVerified ??
        seller.isPhoneVerified ??
        false,
    );

    if (!sellerPhoneVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller phone verification is not complete.",
        },
        { status: 403 },
      );
    }

    // =========================================================
    // 17. SIMPLE RATE LIMIT
    //
    // Same buyer + seller + product:
    // maximum one call request per minute.
    // =========================================================

    const oneMinuteAgo = new Date(
      Date.now() - 60 * 1000,
    );

    const recentCall = await callLogs.findOne({
      buyerId,
      sellerId,
      productId,
      createdAt: {
        $gte: oneMinuteAgo,
      },
    });

    if (recentCall) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please wait a moment before requesting another call.",
        },
        { status: 429 },
      );
    }

    // =========================================================
    // 18. EDesy SECURE NUMBER MASKING
    // =========================================================

    const edesyResponse = await fetch(
      EDESY_API_URL,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          party_a: buyerPhone,
          party_b: sellerPhone,

          // Maximum bridged call duration:
          // 15 minutes
          max_duration_sec: 900,
        }),

        cache: "no-store",
      },
    );

    // =========================================================
    // 19. READ EDESY RESPONSE
    // =========================================================

    let edesyData: any = null;

    try {
      edesyData = await edesyResponse.json();
    } catch {
      edesyData = null;
    }

    // =========================================================
    // 20. EDESY ERROR
    // =========================================================

    if (!edesyResponse.ok) {
      /**
       * IMPORTANT:
       * Do not log the complete Edesy response here.
       * The provider response may contain sensitive
       * phone-related information.
       */

      console.error(
        "Edesy call failed with status:",
        edesyResponse.status,
      );

      const providerMessage =
        typeof edesyData?.error?.message === "string"
          ? edesyData.error.message
          : "Unable to start the secure call.";

      // Edesy insufficient balance
      if (edesyResponse.status === 402) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Secure calling service currently has insufficient balance.",
          },
          { status: 402 },
        );
      }

      // Edesy rate limit
      if (edesyResponse.status === 429) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Too many call requests. Please try again shortly.",
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: providerMessage,
        },
        { status: 502 },
      );
    }

    // =========================================================
    // 21. EXTRACT CALL SID
    // =========================================================

    const callSid =
      typeof edesyData?.data?.call_sid === "string"
        ? edesyData.data.call_sid
        : "";

    if (!callSid) {
      console.error(
        "Edesy response did not contain call_sid.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Secure call could not be started.",
        },
        { status: 502 },
      );
    }

    // =========================================================
    // 22. CALL STATUS
    // =========================================================

    const callStatus =
      typeof edesyData?.data?.status === "string"
        ? edesyData.data.status
        : "initiated";

    // =========================================================
    // 23. SAVE CALL LOG
    //
    // IMPORTANT:
    // We DO NOT store buyerPhone or sellerPhone.
    // =========================================================

    await callLogs.insertOne({
      buyerId,
      sellerId,
      productId,

      callSid,

      provider: "edesy",

      status: callStatus,

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // =========================================================
    // 24. SAFE RESPONSE TO BROWSER
    //
    // IMPORTANT:
    // Never send:
    // - buyer phone
    // - seller phone
    // - masked number
    // - complete Edesy response
    // =========================================================

    return NextResponse.json({
      success: true,

      message:
        "Secure call initiated. Please answer your phone.",

      status: callStatus,
    });
  } catch (error) {
    // =========================================================
    // 25. UNEXPECTED SERVER ERROR
    // =========================================================

    console.error(
      "Secure seller call error:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while starting the secure call.",
      },
      { status: 500 },
    );
  }
}