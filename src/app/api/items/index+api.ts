import { createGroceryItem, listGroceryItems } from "@/lib/server/db-actions";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await listGroceryItems(userId);

    return Response.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch items";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, quantity, priority } = body;

    if (!name || !category || !priority) {
      return Response.json({ error: "Please provide all required fields." }, { status: 400 });
    }

    const item = await createGroceryItem(userId, { name, category, quantity, priority });

    return Response.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create item";
    return Response.json({ error: message }, { status: 500 });
  }
}