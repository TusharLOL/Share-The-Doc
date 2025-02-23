"use client";

import Toast from "@/components/Toast";
import { Check, Clipboard } from "lucide-react";
import { useQRCode } from "next-qrcode";
import { EmailIcon, EmailShareButton, LinkedinIcon, LinkedinShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from "next-share";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FileData {
  url: string;
  filename: string;
}

export default function DownloadPage() {
  const { sessionId } = useParams();
  const navigate = useRouter();
  const { Canvas } = useQRCode();
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const query = new URLSearchParams(window.location.search);
  const isUser = query.get("user") === "me";
  const sharableUrl = "https://share-the-doc.vercel.app/download/" + sessionId;
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

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
      navigator.clipboard.writeText(sharableUrl || "")
        .then(() => toast.custom((t: any) => (
          <Toast message="URL copied to clipboard!" t={t} variant="success" />
        )))
        .catch((err) => {
          console.error("Clipboard API failed, using fallback method", err);
          fallbackCopyTextToClipboard(sharableUrl || "");
        });
    } else {
      fallbackCopyTextToClipboard(sharableUrl || "");
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

  const checkSessionStatus = async () => {
    try {
      const response = await fetch("/api/session/" + sessionId, {
        method: "GET",
      });
      if (!response.ok) {
        setIsSessionCompleted(true);
      }
    } catch (error) {
      console.error("Error checking session status:", error);
    }
  }

  useEffect(() => {
    setDownloadUrl(window.location.href);
    const interval = setInterval(checkSessionStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSessionCompleted) {
      toast.custom((t: any) => (
        <Toast message="Session expired" t={t} variant="error" />
      ));
      timeout = setTimeout(() => {
        navigate.push("/");
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [isSessionCompleted])

  return (
    <>
      <Head>
        <title>Download</title>
        <meta name="description" content="Download your shared files from Share-The-Doc." />
      </Head>
      <div className="flex flex-col items-center justify-center my-20 p-4">
        <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          {
            isSessionCompleted ? (
              <div className="flex flex-col justify-center items-center gap-5 my-10">
                <Check size={32} className="bg-green-500 p-3 h-[150px] w-[150px] rounded-full animate-enter" />
                <p className="text-xl text-center animate-enter">Download completed. Session Expired!!</p>
              </div>
            ) :
              <>
                <h1 className="text-xl font-bold mb-4 border-b">Download Your Files</h1>
                <div className="flex items-center justify-center my-4">
                  {
                    downloadUrl ? (
                      <Canvas
                        text={sharableUrl || ""}
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
                    value={sharableUrl || ""}
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
                <div className="space-y-3">
                  <p className="font-bold">Share the URL with anyone to download the files.</p>
                  <div className="space-x-3">
                    <WhatsappShareButton
                      url={sharableUrl || ""}
                      title={'Just upload your files and share the link to download them.\nSecure and easy to use.'}
                    >
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                    <LinkedinShareButton url={sharableUrl}>
                      <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    <TelegramShareButton
                      url={sharableUrl || ""}
                      title={'Just upload your files and share the link to download them.\nSecure and easy to use.'}
                    >
                      <TelegramIcon size={32} round />
                    </TelegramShareButton>
                    <EmailShareButton
                      url={sharableUrl || ""}
                      subject={'Share-The-Doc - Download your files'}
                      body="Just upload your files and share the link to download them.\nSecure and easy to use."
                    >
                      <EmailIcon size={32} round />
                    </EmailShareButton>
                  </div>
                </div>

                {!isUser && <button
                  onClick={handleDownload}
                  disabled={loading}
                  className={`bg-blue-500 py-2 px-4 rounded hover:bg-blue-600 mt-3 ${loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? "Downloading..." : "Download Files"}
                </button>}
              </>}
        </div>
      </div>
    </>
  );
}
