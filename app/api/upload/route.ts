import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createSession } from "@/lib/db";
import { generateUUID } from "@/lib/uuid";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles: Array<{ public_id: string; filename: string; format: string }> = [];
    const sessionId = generateUUID();

    for (const file of files) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<any>((resolve, reject) => {
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

        uploadedFiles.push({
          public_id: uploadResult.public_id,
          filename: uploadResult.original_filename,
          format: uploadResult.format,
        });
      }
    }

    await createSession(sessionId, uploadedFiles);

    return NextResponse.json({ sessionId, redirectUrl: `/download/${sessionId}`, files: uploadedFiles });
  } catch (error: any) {
    console.error("Error processing files:", error);
    return NextResponse.json({ message: "Error processing files", error: error.message }, { status: 500 });
  }
}
