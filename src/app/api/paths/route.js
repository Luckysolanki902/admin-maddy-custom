// app/api/paths/route.js
import { connectToDatabase } from "@/lib/db";
import AccessControl from "@/models/routeSchema";

export async function GET() {
  await connectToDatabase();
  const paths = await AccessControl.find();
  return new Response(JSON.stringify(paths), { status: 200 });
}
