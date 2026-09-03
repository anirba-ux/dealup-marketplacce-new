import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const PAYMENTS_COLLECTION = "payments";

// =====================================================
// Payment Types
// =====================================================

export type PaymentType =
  | "PREMIUM_MONTHLY"
  | "PREMIUM_QUARTERLY"
  | "PREMIUM_YEARLY"
  | "FEATURED_AD"
  | "BOOST_AD";

// =====================================================
// Payment Status
// =====================================================

export type PaymentStatus =
  | "created"
  | "paid"
  | "failed"
  | "refunded";

// =====================================================
// Payment Record
// =====================================================

export interface PaymentRecord {
  _id?: ObjectId;

  userId: string;

  type: PaymentType;

  productId: string | null;

  razorpayOrderId: string;

  razorpayPaymentId: string | null;

  razorpaySignature: string | null;

  amount: number;

  currency: "INR";

  status: PaymentStatus;

  metadata?: Record<string, unknown>;

  createdAt: Date;

  paidAt: Date | null;

  updatedAt: Date;
}

// =====================================================
// Get Payments Collection
// =====================================================

async function getPaymentsCollection() {
  const client = await clientPromise;

  const db = client.db(
    DATABASE_NAME,
  );

  return db.collection<PaymentRecord>(
    PAYMENTS_COLLECTION,
  );
}

// =====================================================
// Create Payment Record
// =====================================================

export async function createPaymentRecord(
  payment: Omit<
    PaymentRecord,
    "_id"
  >,
) {
  const collection =
    await getPaymentsCollection();

  const result =
    await collection.insertOne(
      payment,
    );

  return result.insertedId;
}

// =====================================================
// Find Payment By Razorpay Order ID
// =====================================================

export async function findPaymentByOrderId(
  razorpayOrderId: string,
) {
  const collection =
    await getPaymentsCollection();

  return collection.findOne({
    razorpayOrderId,
  });
}

// =====================================================
// Find Payment By Razorpay Payment ID
// =====================================================

export async function findPaymentByPaymentId(
  razorpayPaymentId: string,
) {
  const collection =
    await getPaymentsCollection();

  return collection.findOne({
    razorpayPaymentId,
  });
}

// =====================================================
// Mark Payment As Paid
// =====================================================

export async function markPaymentAsPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  const collection =
    await getPaymentsCollection();

  const now = new Date();

  const result =
    await collection.updateOne(
      {
        razorpayOrderId,

        status: {
          $ne: "paid",
        },
      },
      {
        $set: {
          status: "paid",

          razorpayPaymentId,

          razorpaySignature,

          paidAt: now,

          updatedAt: now,
        },
      },
    );

  return {
    success:
      result.modifiedCount > 0,

    modifiedCount:
      result.modifiedCount,
  };
}

// =====================================================
// Mark Payment Activation
// =====================================================

export async function markPaymentActivation(
  razorpayOrderId: string,
  activationStatus: "completed" | "failed",
) {
  const collection =
    await getPaymentsCollection();

  const result =
    await collection.updateOne(
      {
        razorpayOrderId,
      },
      {
        $set: {
          "metadata.activationStatus":
            activationStatus,

          updatedAt:
            new Date(),
        },
      },
    );

  return result.modifiedCount > 0;
}

// =====================================================
// Mark Payment As Failed
// =====================================================

export async function markPaymentAsFailed(
  razorpayOrderId: string,
) {
  const collection =
    await getPaymentsCollection();

  const result =
    await collection.updateOne(
      {
        razorpayOrderId,

        status: "created",
      },
      {
        $set: {
          status: "failed",

          updatedAt:
            new Date(),
        },
      },
    );

  return (
    result.modifiedCount > 0
  );
}

// =====================================================
// Update Razorpay Payment ID
// =====================================================
//
// Useful if a payment record needs to be updated
// before final activation.
//
// =====================================================

export async function updatePaymentDetails(
  razorpayOrderId: string,
  data: {
    razorpayPaymentId?: string | null;

    razorpaySignature?: string | null;

    status?: PaymentStatus;
  },
) {
  const collection =
    await getPaymentsCollection();

  const result =
    await collection.updateOne(
      {
        razorpayOrderId,
      },
      {
        $set: {
          ...data,

          updatedAt:
            new Date(),
        },
      },
    );

  return (
    result.modifiedCount > 0
  );
}