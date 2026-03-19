import { clearPurchasedItems } from "@/lib/server/db-actions";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clearPurchasedItems(userId);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear completed items";
    return Response.json({ error: message }, { status: 500 });
  }
}