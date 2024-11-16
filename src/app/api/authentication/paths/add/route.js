// app/api/paths/add/route.js
import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/AccessControl";

export async function POST(request) {
  await connectToDatabase();
  const { pathname, rolesAllowed } = await request.json();

  try {
    const newPath = await AccessControl.create({ pathname, rolesAllowed });
    return new Response(JSON.stringify(newPath), { status: 201 });
  } catch (error) {
    return new Response("Failed to add path", { status: 500 });
  }
}
