import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateConversationMute } from "@/lib/repositories/chat.repository";

interface RouteContext {
  params: Promise<{
    conversationId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { conversationId } = await params;

    const { muted } = await request.json();

    await updateConversationMute(
      conversationId,
      (session.user as any).id,
      muted,
    );

    return NextResponse.json({
      success: true,
      muted,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update mute status",
      },
      {
        status: 500,
      },
    );
  }
}