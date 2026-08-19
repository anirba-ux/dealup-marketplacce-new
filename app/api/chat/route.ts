import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findConversation,
  createConversation,
} from "@/lib/repositories/chat.repository";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buyerId = (session.user as any).id;

  const body = await request.json();

  console.log("Chat Body:", body);
  console.log("Product ID:", body.productId);
  console.log("Seller ID:", body.sellerId);

  const { productId, sellerId } = body;

  if (!productId || !sellerId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (buyerId === sellerId) {
    return NextResponse.json(
      { error: "You cannot chat with yourself." },
      { status: 400 },
    );
  }

  let conversation = await findConversation(productId, buyerId, sellerId);

  if (!conversation) {
    conversation = await createConversation(productId, buyerId, sellerId);
  }

  return NextResponse.json(conversation);
}
