import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createSession } from "@/lib/db";
import { generateUUID } from "@/lib/uuid";
import { connectToDatabase } from "@/lib/mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

connectToDatabase();

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
        chunk_size: 6000000,
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
      console.error("Error uploading file:", error);
    }
  }
  console.error(`❌ Failed to upload ${file.name} after ${attempts} attempts`);
  return null;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files uploaded" },
        { status: 400 }
      );
    }

    const sessionId = generateUUID();
    const uploadedFiles: Array<{
      public_id: string;
      filename: string;
      format: string;
    }> = [];
    const failedFiles: string[] = [];

    for (const file of files) {
      if (file instanceof File) {
        console.log("⬆️ Uploading file to Cloudinary:", file.name);

        const uploadResult = await retryUpload(file);
        if (uploadResult) {
          uploadedFiles.push({
            public_id: uploadResult.public_id,
            filename: uploadResult.original_filename,
            format: uploadResult.format,
          });
        } else {
          failedFiles.push(file.name);
        }
      }
    }

    // Return response early to prevent timeout
    console.log("✅ Upload successful. Returning early response...");
    const responsePayload: {
      sessionId: string;
      redirectUrl: string;
      files: Array<{ public_id: string; filename: string; format: string }>;
      failedFiles?: string[];
    } = {
      sessionId,
      redirectUrl: `/download/${sessionId}`,
      files: uploadedFiles,
    };

    if (failedFiles.length > 0) {
      responsePayload["failedFiles"] = failedFiles;
    }

    const response = NextResponse.json(responsePayload);

    await createSession(sessionId, uploadedFiles);
    console.log("✅ Session created!");

    return response;
  } catch (error: any) {
    console.error("❌ Error processing files:", error);
    return NextResponse.json(
      { message: "Error processing files", error: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
    responseLimit: false,
  },
};
