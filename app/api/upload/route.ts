import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createSession } from "@/lib/db";
import { generateUUID } from "@/lib/uuid";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Function to upload a single file to Cloudinary
const uploadFileToCloudinary = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    console.error(`🚨 Empty file: ${file.name}`);
    return null;
  }

  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "uploads",
        public_id: `uploads/${file.name.split(".")[0]}-${generateUUID()}`,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    uploadStream.end(buffer);
  });
};

// Retry failed uploads
const retryUpload = async (file: File, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await uploadFileToCloudinary(file);
    } catch (error) {
      console.warn(`⚠️ Retry attempt ${i + 1} for file: ${file.name}`);
    }
  }
  console.error(`❌ Failed to upload ${file.name} after ${attempts} attempts`);
  return null;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((file) => file instanceof File) as File[];

    console.log("📂 Files received in API:", files);

    if (!files.length) {
      console.error("🚨 No valid files uploaded!");
      return NextResponse.json({ message: "No valid files uploaded" }, { status: 400 });
    }

    // Parallel uploads with retry logic
    const uploadPromises = files.map((file) => retryUpload(file));
    const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean);

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ message: "No files were successfully uploaded" }, { status: 400 });
    }

    // Save session in DB
    const sessionId = generateUUID();
    await createSession(sessionId, uploadedFiles);

    return NextResponse.json({ sessionId, redirectUrl: `/download/${sessionId}`, files: uploadedFiles });

  } catch (error: any) {
    console.error("❌ Error processing files:", error);
    return NextResponse.json({ message: "Error processing files", error: error.message }, { status: 500 });
  }
}
