// app/download/[sessionId]/page.tsx (or create a wrapper)
import { Metadata } from "next";
import DownloadPage from "./DownloadPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Download - Share-The-Doc",
    description: "Download your shared files from Share-The-Doc.",
  };
}

export default function page() {
  return <DownloadPage />;
}
