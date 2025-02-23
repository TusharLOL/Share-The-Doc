"use client";

import { useQRCode } from "next-qrcode";
import { Clipboard } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

interface FileData {
  url: string;
  filename: string;
}

export default function DownloadPage() {
  const { sessionId } = useParams();
  const { Canvas } = useQRCode();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setDownloadUrl(window.location.href);
  }, []);

  const handleDownload = async () => {
    if (!sessionId) {
      toast.error("Invalid session ID");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/download/${sessionId}`);
      const data = await response.json();

      if (!response.ok || !data.files) {
        toast.error(data.message || "Error downloading files");
        return;
      }

      data.files.forEach(async (file: FileData) => {
        try {
          const fileResponse = await fetch(file.url);
          const blob = await fileResponse.blob();
          const objectUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = objectUrl;
          link.setAttribute("download", file.filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error(`Error downloading ${file.filename}:`, error);
          toast.error(`Failed to download ${file.filename}`);
        }
      });

      toast.success("Download started for all files!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading files");
    } finally {
      setLoading(false);
      await fetch(`/api/delete/${sessionId}`, { method: "DELETE" });
    }
  };


  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(downloadUrl || "")
        .then(() => toast.success("URL copied to clipboard!"))
        .catch((err) => {
          console.error("Clipboard API failed, using fallback method", err);
          fallbackCopyTextToClipboard(downloadUrl || "");
        });
    } else {
      fallbackCopyTextToClipboard(downloadUrl || "");
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.success("URL copied to clipboard!");
  };


  return (
    <div className="flex flex-col items-center justify-center my-20 p-4">
      <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-4 border-b">Download Your Files</h1>
        <div className="flex items-center justify-center mb-4">

          {downloadUrl ? (
            <Canvas
              text={downloadUrl}
              options={{
                type: "svg",
                quality: 0.3,
                errorCorrectionLevel: "M",
                margin: 3,
                scale: 4,
                width: 200,
                color: {
                  dark: "#010599FF",
                  light: "#FFBF60FF",
                },
              }}
            />
          ) : (
            <p>Generating QR Code...</p>
          )}

        </div>
        <div className="flex items-center justify-center mb-4">
          <input
            type="text"
            readOnly
            value={downloadUrl || ""}
            className="border p-2 rounded-l-lg w-full text-black"
          />
          <button
            onClick={handleCopy}
            className="py-2 px-4 border rounded-r-lg">
            <Clipboard
              className="cursor-pointer"
            />
          </button>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className={`bg-blue-500 py-2 px-4 rounded hover:bg-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Downloading..." : "Download Files"}
        </button>
      </div>
    </div>
  );
}
