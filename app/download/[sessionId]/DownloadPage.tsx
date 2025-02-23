"use client";

import Toast from "@/components/Toast";
import { Clipboard } from "lucide-react";
import { useQRCode } from "next-qrcode";
import Head from "next/head";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
      toast.custom((t: any) => (
        <Toast message="Invalid session ID" t={t} variant="error" />
      ));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/download/${sessionId}`);
      const data = await response.json();

      if (!response.ok || !data.files) {
        toast.custom((t: any) => (
          <Toast message="Error downloading files" t={t} variant="error" />
        ));
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
          toast.custom((t: any) => (
            <Toast message={`Error downloading ${file.filename}`} t={t} variant="error" />
          ));
        }
      });

      toast.custom((t: any) => (
        <Toast message="Downloading started..." t={t} variant="success" />
      ));
    } catch (error) {
      console.error("Download error:", error);
      toast.custom((t: any) => (
        <Toast message="Error downloading files" t={t} variant="error" />
      ));
    } finally {
      setLoading(false);
      await fetch(`/api/delete/${sessionId}`, { method: "DELETE" });
    }
  };


  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(downloadUrl || "")
        .then(() => toast.custom((t: any) => (
          <Toast message="URL copied to clipboard!" t={t} variant="success" />
        )))
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
    toast.custom((t: any) => (
      <Toast message="URL copied to clipboard!" t={t} variant="success" />
    ));
  };


  return (
    <>
      <Head>
        <title>Download</title>
        <meta name="description" content="Download your shared files from Share-The-Doc." />
      </Head>
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
    </>
  );
}
