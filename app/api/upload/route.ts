import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import archiver from "archiver";
import stream from "stream";

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
      return NextResponse.json(
        { message: "No files uploaded" },
        { status: 400 }
      );
    }

    const archiveStream = new stream.PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(archiveStream);

    for (const file of files) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        archive.append(buffer, { name: file.name });
      }
    }

    await archive.finalize();

    const zipUploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "uploads",
          public_id: "uploaded_files",
          format: "zip",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      archiveStream.pipe(uploadStream);
    });

    return NextResponse.json({ url: (zipUploadResult as any).secure_url });
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json(
      { message: "Error processing files", error: (error as Error).message },
      { status: 500 }
    );
  }
}
