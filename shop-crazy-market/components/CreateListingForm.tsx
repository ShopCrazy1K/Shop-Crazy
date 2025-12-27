"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ImageReorderGrid from "@/components/ImageReorderGrid";
import { categories } from "@/lib/categories";

type ImageItem = { id: string; url: string; path?: string };

export default function CreateListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [digitalFiles, setDigitalFiles] = useState<ImageItem[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  async function handleImageUpload(file: File) {
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
    return {
      id: crypto.randomUUID(),
      url: uploaded.url,
      path: uploaded.path,
    };
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    const newImages: ImageItem[] = [];

    for (const file of files) {
      try {
        const imageItem = await handleImageUpload(file);
        newImages.push(imageItem);
      } catch (error: any) {
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploadingImages(false);
    e.target.value = "";
  }

  async function handleDigitalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    const newFiles: ImageItem[] = [];

    for (const file of files) {
      try {
        const fileItem = await handleImageUpload(file);
        newFiles.push(fileItem);
      } catch (error: any) {
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setDigitalFiles((prev) => [...prev, ...newFiles]);
    setUploadingFiles(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      setError("You must be logged in to create a listing");
      setLoading(false);
      return;
    }

    if (!title || !description || !price) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError("Please enter a valid price");
      setLoading(false);
      return;
    }

    const imageUrls = images.map((img) => img.path ?? img.url);
    const digitalFileUrls = digitalFiles.map((file) => file.path ?? file.url);

    if (digitalFileUrls.length === 0 && imageUrls.length === 0) {
      setError("Please upload at least one image or digital file");
      setLoading(false);
      return;
    }

    // Ensure we send empty array if no digital files (validation requires array)
    const finalDigitalFiles = digitalFileUrls.length > 0 ? digitalFileUrls : undefined;

    try {
      const payload = {
        title,
        description,
        priceCents: priceInCents,
        category: category || undefined,
        images: imageUrls.length > 0 ? imageUrls : [],
        ...(finalDigitalFiles && { digitalFiles: finalDigitalFiles }),
        sellerId: user.id,
      };

      console.log("[CREATE LISTING FORM] Submitting payload:", payload);
      
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[CREATE LISTING FORM] API response:", data);

      if (!res.ok) {
        const errorMsg = data?.message || data?.error || `Server error: ${res.status}`;
        let fieldErrorMessages = "";
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, errors]) => {
            fieldErrorMessages += `\n- ${field}: ${(errors as string[]).join(", ")}`;
          });
        }
        setError(errorMsg + (fieldErrorMessages || ""));
        return;
      }

      if (data?.ok && data?.id) {
        console.log("[CREATE LISTING FORM] Listing created with ID:", data.id);
        
        // Redirect immediately to the listing page
        // The listing page will handle loading and display
        console.log("[CREATE LISTING FORM] Redirecting to listing page:", `/listings/${data.id}`);
        router.push(`/listings/${data.id}`);
      } else {
        setError(data?.message || "Could not create listing. No ID returned.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select a category (optional)</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.emoji} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Price (USD) *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={uploadingImages}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
        />
        {uploadingImages && (
          <p className="text-sm text-gray-500 mt-2">Uploading images...</p>
        )}
        {images.length > 0 && (
          <div className="mt-4">
            <ImageReorderGrid items={images} onChange={setImages} maxImages={10} />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Digital Files
        </label>
        <input
          type="file"
          multiple
          onChange={handleDigitalFileChange}
          disabled={uploadingFiles}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
        />
        {uploadingFiles && (
          <p className="text-sm text-gray-500 mt-2">Uploading files...</p>
        )}
        {digitalFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              {digitalFiles.length} file(s) uploaded
            </p>
            <div className="space-y-2">
              {digitalFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{file.url.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => setDigitalFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
}

