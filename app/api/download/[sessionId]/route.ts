import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function GET(
  request: Request,
  context: { params: { sessionId: string } }
) {
  await connectToDatabase();
  const { sessionId } = context.params;

  console.log(`API Called: /api/download/${sessionId}`);

  // Retrieve session from MongoDB
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ message: "Invalid session" }, { status: 404 });
  }

  console.log(`Session found: ${session.id} | Files: ${session.files.length}`);

  const fileUrls: { url: string; filename: string }[] = [];

  for (const file of session.files) {
    try {
      const cloudinaryResource = await cloudinary.api.resource(file.public_id);

      if (!cloudinaryResource?.secure_url) continue;

      fileUrls.push({
        url: cloudinaryResource.secure_url,
        filename: file.public_id.split("/").pop() || "file",
      });
    } catch (error) {
      console.error(`Error processing file ${file.public_id}:`, error);
    }
  }

  if (fileUrls.length === 0) {
    return NextResponse.json({ message: "No files available for download" }, { status: 404 });
  }

  console.log("Returning file URLs...");

  return NextResponse.json({ files: fileUrls });
}
