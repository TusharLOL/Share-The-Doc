// app/page.tsx
"use client";

import Toast from "@/components/Toast";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

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
          toast.custom((t: any) => (
            <Toast
              message={`File ${file.name} is larger than 3MB and will be skipped.`}
              t={t}
              variant="error"
            />
          ));
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        toast.custom((t: any) => (
          <Toast message="No files selected." t={t} variant="error" />
        ));
        return;
      }

      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.custom((t: any) => (
        <Toast message="No files selected." t={t} variant="error" />
      ));
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
        toast.custom((t: any) => (
          <Toast message="Files uploaded successfully!" t={t} variant="success" />
        ));
        router.push(data.redirectUrl + "?user=me");
      } else {
        throw new Error(data.message || "Server is slow to respond please try it locally this will not work on vercel");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.custom((t: any) => (
        <Toast message={error.message || "Error uploading files"} t={t} variant="error" />
      ));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center my-40 p-4">
      <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="fileInput"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            {files.length > 0 ? (
              <ul className="">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center border p-3 rounded-lg my-2 shadow-xl">
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={24} />
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
        <p className="text-center mt-3 text-red-500">Currently, only image uploads are supported.*</p>
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