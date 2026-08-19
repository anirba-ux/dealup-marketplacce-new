import { NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dealup");

    const result = await db.collection("users").updateMany(
      {},
      {
        $set: {
          image: "",
          phone: "",
          isPhoneVerified: false,
          address: {
            state: "",
            district: "",
            city: "",
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Migration failed.",
      },
      { status: 500 }
    );
  }
}