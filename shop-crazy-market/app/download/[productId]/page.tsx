"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface FileInfo {
  url: string;
  filename: string;
  index: number;
}

interface DownloadFilesResponse {
  productTitle: string;
  files: FileInfo[];
  totalFiles: number;
}

export default function DownloadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const productId = params.productId as string;
  const orderId = searchParams.get("orderId");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [productTitle, setProductTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !orderId) {
      router.push("/login");
      return;
    }
    fetchFiles();
  }, [user, orderId, productId, router]);

  async function fetchFiles() {
    try {
      const response = await fetch(
        `/api/download/${productId}/files?orderId=${orderId}&userId=${user?.id}`
      );
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to load files");
        return;
      }
      const data: DownloadFilesResponse = await response.json();
      setFiles(data.files);
      setProductTitle(data.productTitle);
    } catch (err) {
      setError("Failed to load download files");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading files...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-3xl mx-auto pb-24">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/orders")}
            className="text-purple-600 hover:underline"
          >
            Back to Orders
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto pb-24">
      <h1 className="font-accent text-3xl mb-2">Download Files</h1>
      <p className="text-gray-600 mb-6">{productTitle}</p>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">
            {files.length} {files.length === 1 ? "File" : "Files"} Available
          </h2>
        </div>

        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-semibold">{file.filename}</p>
                  <p className="text-sm text-gray-500">File {index + 1} of {files.length}</p>
                </div>
              </div>
              <a
                href={file.url}
                download
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Download
              </a>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => router.push("/orders")}
            className="text-purple-600 hover:underline font-semibold"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </main>
  );
}

