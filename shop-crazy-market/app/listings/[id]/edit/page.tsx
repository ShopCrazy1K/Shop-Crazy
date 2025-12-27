"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceCents: 0,
    images: [] as string[],
    digitalFiles: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && listingId) {
      fetchListing();
    }
  }, [user, authLoading, listingId, router]);

  async function fetchListing() {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      const data = await response.json();
      
      // Verify user owns this listing
      if (data.sellerId !== user?.id) {
        setError("You can only edit your own listings.");
        setLoading(false);
        return;
      }

      setListing(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        priceCents: data.priceCents || 0,
        images: data.images || [],
        digitalFiles: data.digitalFiles || [],
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load listing");
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Failed to upload ${file.name}`);
    }

    const uploaded = await response.json();
    if (!uploaded.url) {
      throw new Error("Upload succeeded but no URL returned");
    }

    return uploaded.url;
  }

  async function handleDigitalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    const newUrls: string[] = [];

    for (const file of files) {
      try {
        const url = await handleFileUpload(file);
        newUrls.push(url);
      } catch (error: any) {
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setFormData({ ...formData, digitalFiles: [...formData.digitalFiles, ...newUrls] });
    setUploadingFiles(false);
    e.target.value = "";
  }

  function removeDigitalFile(index: number) {
    setFormData({
      ...formData,
      digitalFiles: formData.digitalFiles.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/listings/${listingId}?userId=${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update listing");
      }

      // Redirect to listing page
      router.push(`/listings/${listingId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update listing");
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/profile"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Edit Listing</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter listing title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your listing"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  value={(formData.priceCents / 100).toFixed(2)}
                  onChange={(e) => {
                    const dollars = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, priceCents: Math.round(dollars * 100) });
                  }}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (URLs, one per line)
              </label>
              <textarea
                rows={4}
                value={formData.images.join("\n")}
                onChange={(e) => {
                  const urls = e.target.value.split("\n").filter(url => url.trim());
                  setFormData({ ...formData, images: urls });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter image URLs, one per line
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digital Files
              </label>
              
              {/* File Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  id="digitalFileUpload"
                  multiple
                  onChange={handleDigitalFileChange}
                  disabled={uploadingFiles}
                  className="hidden"
                  accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.epub,.mobi,.png,.jpg,.jpeg,.gif,.webp"
                />
                <label
                  htmlFor="digitalFileUpload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer ${
                    uploadingFiles
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <span className="mr-2">📁</span>
                  {uploadingFiles ? "Uploading..." : "Upload Files"}
                </label>
                {uploadingFiles && (
                  <p className="mt-2 text-sm text-blue-600">Uploading files, please wait...</p>
                )}
              </div>

              {/* Current Digital Files */}
              {formData.digitalFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Current Files ({formData.digitalFiles.length}):
                  </p>
                  <div className="space-y-2">
                    {formData.digitalFiles.map((url, index) => {
                      const fileName = url.split('/').pop() || `File ${index + 1}`;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{url}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDigitalFile(index)}
                            className="ml-3 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700 font-semibold">
                      💾 This listing is marked as DIGITAL ({formData.digitalFiles.length} file{formData.digitalFiles.length !== 1 ? 's' : ''})
                    </p>
                  </div>
                </div>
              )}

              {/* Manual URL Input (Alternative) */}
              <div className="mt-4">
                <details className="cursor-pointer">
                  <summary className="text-sm text-gray-600 hover:text-gray-800">
                    Or enter file URLs manually
                  </summary>
                  <div className="mt-2">
                    <textarea
                      rows={3}
                      value={formData.digitalFiles.join("\n")}
                      onChange={(e) => {
                        const urls = e.target.value.split("\n").filter(url => url.trim());
                        setFormData({ ...formData, digitalFiles: urls });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/file1.pdf&#10;https://example.com/file2.zip"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter file URLs, one per line. Leave empty for physical products.
                    </p>
                  </div>
                </details>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || uploadingFiles}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : uploadingFiles ? "Uploading..." : "Save Changes"}
              </button>
              <Link
                href={`/listings/${listingId}`}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

