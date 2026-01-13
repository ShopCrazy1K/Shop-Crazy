"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ImageReorderGrid from "@/components/ImageReorderGrid";
import DragAndDropUpload from "@/components/DragAndDropUpload";
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
  const [thumbnail, setThumbnail] = useState<ImageItem | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [digitalFiles, setDigitalFiles] = useState<ImageItem[]>([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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

  const handleThumbnailUpload = useCallback(async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const imageItem = await handleImageUpload(file);
      setThumbnail(imageItem);
    } catch (error: any) {
      alert(`Failed to upload thumbnail: ${error.message}`);
    } finally {
      setUploadingThumbnail(false);
    }
  }, []);

  const handleThumbnailDrop = useCallback((files: File[]) => {
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleThumbnailUpload(files[0]);
    }
  }, [handleThumbnailUpload]);

  const handleThumbnailFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleThumbnailUpload(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  }, [handleThumbnailUpload]);

  const handleThumbnailClick = useCallback(() => {
    thumbnailInputRef.current?.click();
  }, []);

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

    // Require thumbnail
    if (!thumbnail) {
      setError("Please upload a thumbnail image for your listing");
      setLoading(false);
      return;
    }

    // Combine thumbnail (first) with other images
    const allImages = [thumbnail, ...images];
    const imageUrls = allImages.map((img) => img.path ?? img.url);
    const digitalFileUrls = digitalFiles.map((file) => file.path ?? file.url);

    try {
      const payload: any = {
        title,
        description,
        priceCents: priceInCents,
        category: category || undefined,
        images: imageUrls.length > 0 ? imageUrls : [],
        sellerId: user.id,
      };
      
      // Only include digitalFiles if there are files (validation requires min 1 if provided)
      if (digitalFileUrls.length > 0) {
        payload.digitalFiles = digitalFileUrls;
      }
      
      console.log("[CREATE LISTING FORM] Payload digitalFiles:", digitalFileUrls.length, "files");

      console.log("[CREATE LISTING FORM] Submitting payload:", payload);
      
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("[CREATE LISTING FORM] Failed to parse JSON response:", jsonError);
        setError(`Server error: ${res.status} ${res.statusText}. Please try again.`);
        setLoading(false);
        return;
      }
      
      console.log("[CREATE LISTING FORM] API response:", data);

      if (!res.ok) {
        const errorMsg = data?.message || data?.error || `Server error: ${res.status}`;
        let fieldErrorMessages = "";
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, errors]) => {
            fieldErrorMessages += `\n- ${field}: ${(errors as string[]).join(", ")}`;
          });
        }
        console.error("[CREATE LISTING FORM] API error:", errorMsg, fieldErrorMessages);
        setError(errorMsg + (fieldErrorMessages || ""));
        setLoading(false);
        return;
      }

      if (data?.ok && data?.id) {
        console.log("[CREATE LISTING FORM] Listing created with ID:", data.id);
        
        // Redirect immediately to the listing page
        // The listing page will handle loading and display
        console.log("[CREATE LISTING FORM] Redirecting to listing page:", `/listings/${data.id}`);
        try {
          router.push(`/listings/${data.id}`);
        } catch (navError: any) {
          console.error("[CREATE LISTING FORM] Navigation error:", navError);
          // Fallback to window.location if router.push fails
          window.location.href = `/listings/${data.id}`;
        }
      } else {
        console.error("[CREATE LISTING FORM] Invalid response:", data);
        setError(data?.message || "Could not create listing. No ID returned. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[CREATE LISTING FORM] Unexpected error:", err);
      setError(err.message || "Failed to create listing. Please check your connection and try again.");
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

      {/* Thumbnail Upload Section - Etsy Style */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Listing Thumbnail (Cover Image) *
        </label>
        <p className="text-xs text-gray-500 mb-3">
          This is the main image that buyers will see first. Choose a high-quality image that showcases your product.
        </p>
        
        {thumbnail ? (
          <div className="relative border-2 border-purple-300 rounded-xl overflow-hidden bg-gray-50">
            <div className="relative aspect-square max-w-md mx-auto">
              <img
                src={thumbnail.url}
                alt="Listing thumbnail"
                className="w-full h-full object-contain"
              />
              {/* Overlay with change button */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleThumbnailClick}
                    disabled={uploadingThumbnail}
                    className="bg-white/90 hover:bg-white px-4 py-2 rounded-lg font-semibold text-sm text-gray-700 shadow-lg transition-colors disabled:opacity-50"
                  >
                    Change Thumbnail
                  </button>
                </div>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                disabled={uploadingThumbnail}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-lg transition-colors disabled:opacity-50"
                title="Remove thumbnail"
              >
                ×
              </button>
              {/* Primary badge */}
              <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Main Image
              </div>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <DragAndDropUpload
            onFilesSelected={handleThumbnailDrop}
            accept="image/*"
            multiple={false}
            maxFiles={1}
            maxSize={10 * 1024 * 1024} // 10MB
            isImage={true}
            className="w-full"
          >
            <div className="space-y-4 py-8">
              <div className="text-5xl">📷</div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Upload your listing thumbnail
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Recommended: Square image (1:1 ratio), at least 1000x1000px
                </p>
              </div>
              {uploadingThumbnail && (
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
          </DragAndDropUpload>
        )}
        {/* Hidden input for "Change Thumbnail" button */}
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailFileInput}
          className="hidden"
        />
      </div>

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
          Additional Images (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add more images to show different angles, details, or variations of your product. You can upload up to 10 images total (including thumbnail).
        </p>
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
            <ImageReorderGrid items={images} onChange={setImages} maxImages={9} />
            <p className="text-xs text-gray-500 mt-2">
              Note: Your thumbnail is already set above. These additional images will appear after it.
            </p>
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

