// app/api/paths/update/route.js
import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/routeSchema";

export async function PATCH(request) {
  await connectToDatabase();
  const { pathname, rolesAllowed } = await request.json();

  try {
    const updatedPath = await AccessControl.findOneAndUpdate(
      { pathname },
      { rolesAllowed },
      { new: true }
    );
    return new Response(JSON.stringify(updatedPath), { status: 200 });
  } catch (error) {
    return new Response("Failed to update roles", { status: 500 });
  }
}
