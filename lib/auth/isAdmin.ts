import { auth } from "@/auth";

/**
 * Check whether the currently authenticated
 * user has admin access.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  return session.user.role === "admin";
}