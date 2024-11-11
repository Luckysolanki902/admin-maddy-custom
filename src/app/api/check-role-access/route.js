import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/routeSchema";

export async function GET(request) {
  await connectToDatabase();

  // Extract the pathname and role from the query string
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname');
  const userRole = searchParams.get('role');

  try {
    // Find the path in the database
    const pathData = await AccessControl.findOne({ pathname });
    
    if (!pathData) {
      // If the path is not found, return a 404 response
      return new Response(JSON.stringify({ allowed: false, message: "Path not found" }), { status: 404 });
    }

    // Check if the user's role is allowed for this path
    const allowedRoles = pathData.rolesAllowed || [];
    if (allowedRoles.includes(userRole)) {
      return new Response(JSON.stringify({ allowed: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ allowed: false, message: "Access denied" }), { status: 403 });
    }
  } catch (error) {
    // Handle any unexpected errors
    return new Response("Failed to check access", { status: 500 });
  }
}
