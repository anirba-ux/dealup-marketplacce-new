import { NextResponse } from "next/server";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

const DB_NAME = "dealup";
const USERS_COLLECTION = "users";

export async function GET() {
  try {
    // =====================================================
    // Admin Authentication
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 },
      );
    }

    // =====================================================
    // Database
    // =====================================================

    const client = await clientPromise;

    const collection = client
      .db(DB_NAME)
      .collection(USERS_COLLECTION);

    // =====================================================
    // Find Support Agents
    //
    // For now, DealUp admins are eligible support agents.
    // We only return safe fields needed by the admin UI.
    // =====================================================

    const agents = await collection
      .find(
        {
          role: "admin",
        },
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            image: 1,
            role: 1,
          },
        },
      )
      .sort({
        name: 1,
        email: 1,
      })
      .limit(100)
      .toArray();

    // =====================================================
    // Safe Response
    // =====================================================

    const safeAgents = agents.map((agent) => ({
      id: agent._id?.toString() ?? "",
      name:
        typeof agent.name === "string" &&
        agent.name.trim()
          ? agent.name.trim()
          : "DealUp Admin",
      email:
        typeof agent.email === "string"
          ? agent.email.trim()
          : "",
      image:
        typeof agent.image === "string" &&
        agent.image.trim()
          ? agent.image.trim()
          : null,
      role:
        typeof agent.role === "string"
          ? agent.role
          : "admin",
    }));

    return NextResponse.json(
      {
        success: true,
        agents: safeAgents,
        count: safeAgents.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT AGENTS GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load support agents.",
      },
      { status: 500 },
    );
  }
}