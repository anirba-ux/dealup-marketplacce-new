import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import clientPromise from "@/lib/db/mongodb";

const DB_NAME = "dealup";

// =====================================================
// VERIFY EDESY WEBHOOK SIGNATURE
// =====================================================

function verifyEdesySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) {
    return false;
  }

  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const expectedWithPrefix = `sha256=${expectedHash}`;

  const receivedSignature = signature.trim();

  let receivedHash = receivedSignature;

  if (receivedSignature.startsWith("sha256=")) {
    receivedHash = receivedSignature.slice(
      "sha256=".length,
    );
  }

  if (
    receivedHash.length !==
    expectedHash.length
  ) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, "utf8"),
      Buffer.from(expectedHash, "utf8"),
    );
  } catch {
    return false;
  }
}

// =====================================================
// MAP EDESY EVENT → DEALUP STATUS
// =====================================================

function mapEdesyEventToStatus(
  event: string,
): string | null {
  switch (event) {
    case "session.created":
      return "initiated";

    case "call.incoming":
      return "ringing";

    case "call.connected":
      return "answered";

    case "call.ended":
      return "completed";

    case "call.missed":
      return "missed";

    case "session.expired":
      return "expired";

    default:
      return null;
  }
}

// =====================================================
// WEBHOOK POST
// =====================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // 1. WEBHOOK SECRET
    // =================================================

    const webhookSecret =
      process.env.EDESY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "EDESY_WEBHOOK_SECRET is missing.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook service is not configured.",
        },
        { status: 500 },
      );
    }

    // =================================================
    // 2. READ RAW BODY
    //
    // IMPORTANT:
    // Signature must be verified against the exact
    // raw request body.
    // =================================================

    const rawBody = await request.text();

    // =================================================
    // 3. GET SIGNATURE
    // =================================================

    const signature =
      request.headers.get(
        "X-Edesy-Signature",
      );

    // =================================================
    // 4. VERIFY SIGNATURE
    // =================================================

    const validSignature =
      verifyEdesySignature(
        rawBody,
        signature,
        webhookSecret,
      );

    if (!validSignature) {
      console.warn(
        "Rejected Edesy webhook: invalid signature.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid webhook signature.",
        },
        { status: 401 },
      );
    }

    // =================================================
    // 5. PARSE JSON
    // =================================================

    let payload: {
      event?: string;
      reference?: string;
      virtual_number?: string;
      caller?: string;
      callee?: string;
      direction?: string;
      call_sid?: string;
      duration_sec?: number;
      status?: string;
      timestamp?: string;
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON payload.",
        },
        { status: 400 },
      );
    }

    // =================================================
    // 6. EVENT
    // =================================================

    const event = String(
      payload?.event ?? "",
    ).trim();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook event is missing.",
        },
        { status: 400 },
      );
    }

    // =================================================
    // 7. MAP EVENT
    // =================================================

    const newStatus =
      mapEdesyEventToStatus(event);

    // Unknown event:
    // acknowledge it safely.
    if (!newStatus) {
      console.log(
        "Ignoring unsupported Edesy event:",
        event,
      );

      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    // =================================================
    // 8. CALL SID
    // =================================================

    const callSid = String(
      payload?.call_sid ?? "",
    ).trim();

    // -------------------------------------------------
    // Test events or events without call_sid can still
    // receive a successful acknowledgement.
    // -------------------------------------------------

    if (!callSid) {
      console.log(
        "Edesy event received without call_sid:",
        event,
      );

      return NextResponse.json({
        success: true,
        processed: false,
        ignored: true,
        reason: "call_sid_missing",
      });
    }

    // =================================================
    // 9. DATABASE
    // =================================================

    const client = await clientPromise;

    const db = client.db(DB_NAME);

    const callLogs =
      db.collection("callLogs");

    // =================================================
    // 10. FIND CALL
    // =================================================

    const existingCall =
      await callLogs.findOne({
        callSid,
      });

    // =================================================
    // 11. UNKNOWN CALL
    // =================================================

    if (!existingCall) {
      console.warn(
        "Edesy webhook received for unknown callSid.",
        {
          event,
          callSid,
        },
      );

      // Return 200 so Edesy does not repeatedly retry
      // an event that does not belong to DealUp.
      return NextResponse.json({
        success: true,
        processed: false,
        ignored: true,
      });
    }

    // =================================================
    // 12. SAFE UPDATE
    //
    // IMPORTANT:
    // We intentionally DO NOT store:
    //
    // caller
    // callee
    // virtual_number
    //
    // because these can contain phone numbers.
    // =================================================

    const update: Record<
      string,
      unknown
    > = {
      status: newStatus,
      lastEvent: event,
      updatedAt: new Date(),
    };

    // =================================================
    // 13. EVENT TIMESTAMPS
    // =================================================

    if (event === "call.incoming") {
      update.ringingAt = new Date();
    }

    if (event === "call.connected") {
      update.answeredAt = new Date();
    }

    if (event === "call.ended") {
      update.completedAt = new Date();

      if (
        typeof payload.duration_sec ===
        "number"
      ) {
        update.durationSec =
          payload.duration_sec;
      }
    }

    if (event === "call.missed") {
      update.missedAt = new Date();
    }

    if (event === "session.expired") {
      update.expiredAt = new Date();
    }

    // =================================================
    // 14. UPDATE CALL LOG
    // =================================================

    await callLogs.updateOne(
      {
        callSid,
      },
      {
        $set: update,
      },
    );

    // =================================================
    // 15. SAFE SERVER LOG
    // =================================================

    console.log(
      "Edesy webhook processed:",
      {
        event,
        callSid,
        status: newStatus,
      },
    );

    // =================================================
    // 16. SUCCESS
    // =================================================

    return NextResponse.json({
      success: true,
      processed: true,
      status: newStatus,
    });
  } catch (error) {
    console.error(
      "Edesy webhook error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Webhook processing failed.",
      },
      { status: 500 },
    );
  }
}