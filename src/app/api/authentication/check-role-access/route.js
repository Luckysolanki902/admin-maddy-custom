import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/AccessControl";

export async function GET(request) {
  await connectToDatabase();

  // Extract the pathname and role from the query string
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname");
  const userRole = searchParams.get("role");

  try {
    // Find all paths that match the current pathname, including wildcard paths
    const pathData = await AccessControl.find({
      $or: [
        { pathname }, // Exact match
        { pathname: { $regex: "^" + pathname.replace(/\/$/, "") + "/.*" } }, // Wildcard match
        { pathname: { $regex: `^${pathname.split("/")[1]}/*` } }, // Match if starts with pattern
      ],
    });

    if (!pathData.length) {
      // If no matching path is found, return a 404 response
      return new Response(JSON.stringify({ allowed: false, message: "Path not found" }), {
        status: 404,
      });
    }

    // Check if the user's role is allowed for any matched path
    const isAllowed = pathData.some((path) => (path.rolesAllowed || []).includes(userRole));

    if (isAllowed) {
      return new Response(JSON.stringify({ allowed: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ allowed: false, message: "Access denied" }), {
        status: 403,
      });
    }
  } catch (error) {
    // Handle unexpected errors
    return new Response("Failed to check access", { status: 500 });
  }
}
