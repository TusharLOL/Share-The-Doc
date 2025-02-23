import { getSession } from "@/lib/db";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

await connectToDatabase();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);

  if (!session) {
    return NextResponse.json({ message: "Invalid session" }, { status: 404 });
  }

  return NextResponse.json({ message: "Session found" }, { status: 200 });
}
