import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteConversation } from "@/lib/repositories/chat.repository";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { conversationId } = await params;

  try {
    await deleteConversation(
      conversationId,
      (session.user as any).id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete conversation",
      },
      {
        status: 500,
      }
    );
  }
}