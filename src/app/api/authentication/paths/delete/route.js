// app/api/paths/delete/route.js
import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/AccessControl";

export async function DELETE(request) {
  await connectToDatabase();
  const { pathname } = await request.json();

  try {
    await AccessControl.findOneAndDelete({ pathname });
    return new Response("Path deleted", { status: 200 });
  } catch (error) {
    return new Response("Failed to delete path", { status: 500 });
  }
}
