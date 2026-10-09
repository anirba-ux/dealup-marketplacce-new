
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

  // Promotion targets
  productId: string | null;
  jobId?: string | null;
  serviceId?: string | null;

  // Razorpay
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;

  // Cashfree
  cashfreeOrderId: string | null;
  cashfreePaymentSessionId: string | null;
  cashfreePaymentId: string | null;

  // Amount
  amount: number;
  currency: "INR";
  status: PaymentStatus;

  metadata?: Record<string, unknown>;

  createdAt: Date;
  paidAt: Date | null;
  updatedAt: Date;
}

// =====================================================
// Collection
// =====================================================

async function getPaymentsCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection<PaymentRecord>(PAYMENTS_COLLECTION);
}

// =====================================================
// Create Payment
// =====================================================

export async function createPaymentRecord(
  payment: Omit<PaymentRecord, "_id">,
) {
  const collection = await getPaymentsCollection();
  const result = await collection.insertOne(payment);

  return result.insertedId;
}

// =====================================================
// Find Razorpay Payment
// =====================================================

export async function findPaymentByOrderId(
  razorpayOrderId: string,
) {
  const collection = await getPaymentsCollection();

  return collection.findOne({ razorpayOrderId });
}

export async function findPaymentByPaymentId(
  razorpayPaymentId: string,
) {
  const collection = await getPaymentsCollection();

  return collection.findOne({ razorpayPaymentId });
}

// =====================================================
// Mark Razorpay Payment As Paid
// =====================================================

export async function markPaymentAsPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  const collection = await getPaymentsCollection();
  const now = new Date();

  const result = await collection.updateOne(
    {
      razorpayOrderId,
      status: { $ne: "paid" },
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
    success: result.modifiedCount > 0,
    modifiedCount: result.modifiedCount,
  };
}

// =====================================================
// Mark Payment Activation
// =====================================================

export async function markPaymentActivation(
  orderId: string,
  activationStatus: "completed" | "failed",
  gateway: "razorpay" | "cashfree" = "razorpay",
) {
  const collection = await getPaymentsCollection();

  const filter =
    gateway === "cashfree"
      ? { cashfreeOrderId: orderId }
      : { razorpayOrderId: orderId };

  const result = await collection.updateOne(
    filter,
    {
      $set: {
        "metadata.activationStatus": activationStatus,
        updatedAt: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
}

// =====================================================
// Mark Razorpay Payment As Failed
// =====================================================

export async function markPaymentAsFailed(
  razorpayOrderId: string,
) {
  const collection = await getPaymentsCollection();

  const result = await collection.updateOne(
    {
      razorpayOrderId,
      status: "created",
    },
    {
      $set: {
        status: "failed",
        updatedAt: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
}

// =====================================================
// Find Cashfree Payment
// =====================================================

export async function findPaymentByCashfreeOrderId(
  cashfreeOrderId: string,
) {
  const collection = await getPaymentsCollection();

  return collection.findOne({ cashfreeOrderId });
}

export async function findPaymentByCashfreePaymentId(
  cashfreePaymentId: string,
) {
  const collection = await getPaymentsCollection();

  return collection.findOne({ cashfreePaymentId });
}

// =====================================================
// Mark Cashfree Payment As Paid
// =====================================================

export async function markCashfreePaymentAsPaid(
  cashfreeOrderId: string,
  cashfreePaymentId: string,
) {
  const collection = await getPaymentsCollection();
  const now = new Date();

  const result = await collection.updateOne(
    {
      cashfreeOrderId,
      status: { $ne: "paid" },
    },
    {
      $set: {
        status: "paid",
        cashfreePaymentId,
        paidAt: now,
        updatedAt: now,
      },
    },
  );

  return {
    success: result.modifiedCount > 0,
    modifiedCount: result.modifiedCount,
  };
}

// =====================================================
// Mark Cashfree Payment As Failed
// =====================================================

export async function markCashfreePaymentAsFailed(
  cashfreeOrderId: string,
) {
  const collection = await getPaymentsCollection();

  const result = await collection.updateOne(
    {
      cashfreeOrderId,
      status: "created",
    },
    {
      $set: {
        status: "failed",
        updatedAt: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
}

// =====================================================
// Update Razorpay Payment Details
// =====================================================

export async function updatePaymentDetails(
  razorpayOrderId: string,
  data: {
    razorpayPaymentId?: string | null;
    razorpaySignature?: string | null;
    status?: PaymentStatus;
  },
) {
  const collection = await getPaymentsCollection();

  const result = await collection.updateOne(
    { razorpayOrderId },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
}
