import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession, deleteSession } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function DELETE(
  request: Request,
  context: { params: { sessionId: string } }
) {
  await connectToDatabase();
  const { sessionId } = context.params;

  console.log(`API Called: /api/delete/${sessionId}`);

  // Retrieve session from MongoDB
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ message: "Invalid session" }, { status: 404 });
  }

  console.log(`Session found: ${session.id} | Files: ${session.files.length}`);

  for (const file of session.files) {
    try {
      await cloudinary.uploader.destroy(file.public_id);
      console.log(`Deleted file: ${file.public_id}`);
    } catch (error) {
      console.error(`Failed to delete ${file.public_id}:`, error);
    }
  }

  await deleteSession(sessionId);

  return NextResponse.json({ message: "Files deleted successfully" });
}
