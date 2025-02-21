// app/page.tsx
"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selectedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const validFiles = selectedFiles.filter((file) => {
        if (file.size > 3 * 1024 * 1024) {
          toast.error(`File ${file.name} is larger than 3MB and will be skipped.`);
          return false;
        }
        return true;
      });
  
      if (validFiles.length === 0) {
        toast.error("No valid files selected. Please select files under 3MB.");
        return;
      }
  
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };
  

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No files selected.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("files", file);
      console.log(`Appending file ${index}:`, file.name, file.size, file.type);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload response:", data);

      if (res.ok) {
        toast.success("Files uploaded successfully!");
        router.push(data.redirectUrl);
      } else {
        throw new Error(data.message || "Error uploading files");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Error uploading files");
    } finally {
      setUploading(false);
    }
  };


  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div
          className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            className="hidden"
            id="fileInput"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            {files.length > 0 ? (
              <ul className="text-gray-700">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                Drag & drop files or click to select
              </p>
            )}
          </label>
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}