"use client";
import Toast from '@/components/Toast';
import { Clipboard, Download } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQRCode } from "next-qrcode";
import "@/components/index.css";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string>('');
  const { Canvas } = useQRCode();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selectedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUrl(data.url);
        toast.custom((t: any) => (
          <Toast t={t} message='Uploaded successfully' variant='success' />
        ));
      } else {
        throw new Error(data.message || 'Error uploading files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.custom((t: any) => (
        <Toast t={t} message='Error uploading files' variant='error' />
      ));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {url ?
          <div className='flex justify-center'>
            <Canvas
              text={url}
              options={{
                type: 'image/jpeg',
                quality: 0.3,
                errorCorrectionLevel: 'M',
                margin: 3,
                scale: 4,
                width: 200,
                color: {
                  dark: '#010599FF',
                  light: '#FFBF60FF',
                },
              }} />
          </div> :
          <>
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
                  <p className="text-gray-500">Drag & drop files or click to select</p>
                )}
              </label>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button></>
        }
        {url && (
          <div className="mt-4 text-center">
            <div className='flex flex-col gap-2 my-4 relative rounded-xl'>
              <a
                href={url}
                className="text-blue-500 underline max-w-md overflow-x-auto scrollbar-hidden shadow-inner shadow-black p-2 pr-10 relative overflow-y-hidden whitespace-nowrap rounded-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                {url}
              </a>
              <Clipboard className="cursor-pointer text-black absolute top-0 right-0 bg-white h-full border rounded-lg rounded-l-none" />
            </div>
            <button className="flex items-center justify-center gap-2 bg-orange-700 p-2 text-white w-full rounded-lg">
              <Download />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}