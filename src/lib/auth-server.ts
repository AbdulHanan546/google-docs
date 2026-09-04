import { headers } from "next/headers";
import { SEEDED_USERS } from "./auth";

export async function getCurrentUserFromHeaders(): Promise<typeof SEEDED_USERS[0]> {
  try {
    const headersList = await headers();
    const headerUserId = headersList.get("x-user-id");
    if (headerUserId) {
      const match = SEEDED_USERS.find((u) => u.id === headerUserId);
      if (match) return match;
    }
  } catch {
    // If running outside request context or tests
  }
  return SEEDED_USERS[0];
}
