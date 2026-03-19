import {
    deleteGroceryItem,
    setGroceryItemPurchased,
    updateGroceryItemQuantity,
} from "@/lib/server/db-actions";

export async function PATCH(request: Request, { id }: { id: string }) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const item = body.quantity
      ? await updateGroceryItemQuantity(userId, id, body.quantity)
      : await setGroceryItemPurchased(userId, id, body.purchased ?? true);

    if (!item) return Response.json({ error: "Item not found." }, { status: 404 });

    return Response.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update item";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { id }: { id: string }) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteGroceryItem(userId, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete item";
    return Response.json({ error: message }, { status: 500 });
  }
}