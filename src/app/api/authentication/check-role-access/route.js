import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/AccessControl";

export async function GET(request) {
  await connectToDatabase();

  // Extract the pathname and role from the query string
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname");
  const userRole = searchParams.get("role");

  try {
    // If the user role is 'admin', allow access immediately
    if (userRole === "admin") {
      return new Response(JSON.stringify({ allowed: true }), { status: 200 });
    }

    // Fetch all potential matching paths from the database
    const pathData = await AccessControl.find({});

    if (!pathData.length) {
      // If no paths exist in the database, return a 404 response
      return new Response(JSON.stringify({ allowed: false, message: "Path not found" }), {
        status: 404,
      });
    }

    // Check if any paths match the given pathname
    const isAllowed = pathData.some((path) => {
      if (path.pathname.endsWith("/*")) {
        // Allow all paths starting with the base path (excluding the wildcard)
        const basePath = path.pathname.slice(0, -2); // Remove "/*"
        return pathname.startsWith(basePath) && path.rolesAllowed.includes(userRole);
      }
      // Exact path match
      return path.pathname === pathname && path.rolesAllowed.includes(userRole);
    });

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
