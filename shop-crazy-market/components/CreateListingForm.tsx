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
  // Combined thumbnail + images - first image is the thumbnail/main image
  const [images, setImages] = useState<ImageItem[]>([]);
  const [digitalFiles, setDigitalFiles] = useState<ImageItem[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Helper function to check if a file is a valid image
  function isImageFile(file: File): boolean {
    if (file.type.startsWith("image/")) return true;
    const fileName = file.name.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
    return imageExtensions.some(ext => fileName.endsWith(ext));
  }

  // Helper function to check if a URL is an image URL
  function isImageUrl(url: string): boolean {
    const urlLower = url.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
    return imageExtensions.some(ext => urlLower.includes(ext)) || urlLower.includes('/image');
  }

  async function handleImageUpload(file: File) {
    // Double-check that only image files are uploaded
    if (!isImageFile(file)) {
      throw new Error(`${file.name} is not a valid image file`);
    }

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
    
    // Validate the uploaded URL is an image
    if (!isImageUrl(uploaded.url) && !isImageUrl(uploaded.path || '')) {
      throw new Error(`Uploaded file ${file.name} is not a valid image`);
    }
    
    return {
      id: crypto.randomUUID(),
      url: uploaded.url,
      path: uploaded.path,
    };
  }

  const handleImagesDrop = useCallback(async (files: File[]) => {
    // Filter to only image files - use helper function for better validation
    const imageFiles = files.filter(file => isImageFile(file));
    if (imageFiles.length === 0) {
      alert("Please upload only image files (JPG, PNG, GIF, etc.)");
      return;
    }

    setUploadingImages(true);
    const newImages: ImageItem[] = [];

    for (const file of imageFiles) {
      try {
        const imageItem = await handleImageUpload(file);
        // Additional validation - ensure URL is actually an image
        if (isImageUrl(imageItem.url) || isImageUrl(imageItem.path || '')) {
          newImages.push(imageItem);
        } else {
          alert(`Skipped ${file.name}: File is not a valid image`);
        }
      } catch (error: any) {
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    // Filter out any non-image items that might have slipped through
    const validImages = newImages.filter(img => isImageUrl(img.url) || isImageUrl(img.path || ''));
    setImages((prev) => {
      // Also filter existing images to remove any non-image URLs
      const filteredPrev = prev.filter(img => isImageUrl(img.url) || isImageUrl(img.path || ''));
      return [...filteredPrev, ...validImages];
    });
    setUploadingImages(false);
  }, []);

  const handleImagesFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter to only image files - use helper function for better validation
    const imageFiles = files.filter(file => isImageFile(file));
    if (imageFiles.length === 0) {
      alert("Please upload only image files (JPG, PNG, GIF, etc.)");
      if (e.target) {
        e.target.value = "";
      }
      return;
    }

    setUploadingImages(true);
    const newImages: ImageItem[] = [];

    (async () => {
      for (const file of imageFiles) {
        try {
          const imageItem = await handleImageUpload(file);
          // Additional validation - ensure URL is actually an image
          if (isImageUrl(imageItem.url) || isImageUrl(imageItem.path || '')) {
            newImages.push(imageItem);
          } else {
            alert(`Skipped ${file.name}: File is not a valid image`);
          }
        } catch (error: any) {
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      // Filter out any non-image items that might have slipped through
      const validImages = newImages.filter(img => isImageUrl(img.url) || isImageUrl(img.path || ''));
      setImages((prev) => {
        // Also filter existing images to remove any non-image URLs
        const filteredPrev = prev.filter(img => isImageUrl(img.url) || isImageUrl(img.path || ''));
        return [...filteredPrev, ...validImages];
      });
      setUploadingImages(false);
      if (e.target) {
        e.target.value = "";
      }
    })();
  }, []);

  async function handleDigitalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    const newFiles: ImageItem[] = [];

    // Filter out image files - digital files should not be images
    // Check both MIME type and file extension
    const nonImageFiles = files.filter(file => {
      const isImageMime = file.type.startsWith("image/");
      const fileName = file.name.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'];
      const isImageExtension = imageExtensions.some(ext => fileName.endsWith(ext));
      return !isImageMime && !isImageExtension;
    });

    if (nonImageFiles.length === 0) {
      alert("Digital files cannot be images. Please upload document files (PDF, DOC, ZIP, etc.)");
      setUploadingFiles(false);
      e.target.value = "";
      return;
    }

    // Show warning if some files were filtered out
    if (nonImageFiles.length < files.length) {
      const filteredCount = files.length - nonImageFiles.length;
      alert(`${filteredCount} image file(s) were skipped. Digital files cannot be images.`);
    }

    for (const file of nonImageFiles) {
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

    // Require at least one image (thumbnail)
    if (images.length === 0) {
      setError("Please upload at least one image for your listing");
      setLoading(false);
      return;
    }

    // First image is the thumbnail/main image
    const imageUrls = images.map((img) => img.path ?? img.url);
    const digitalFileUrls = digitalFiles.map((file) => file.path ?? file.url);

    try {
      const payload: any = {
        title,
        description,
        priceCents: priceInCents,
        category: category || undefined,
        images: imageUrls,
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

      {/* Images Upload Section - Combined thumbnail + images */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Listing Images *
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload your product images. The first image will be used as the main/cover image. Drag images to reorder them.
        </p>
        
        {images.length > 0 ? (
          <div className="space-y-4">
            <ImageReorderGrid 
              items={images.filter(img => isImageUrl(img.url) || isImageUrl(img.path || ''))} 
              onChange={(newImages) => {
                // Filter to only allow valid image URLs
                const validImages = newImages.filter(img => isImageUrl(img.url) || isImageUrl(img.path || ''));
                setImages(validImages);
              }} 
              maxImages={10} 
            />
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesFileInput}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              disabled={uploadingImages || images.length >= 10}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
            >
              {uploadingImages ? "Uploading..." : `Add More Images (${images.length}/10)`}
            </button>
          </div>
        ) : (
          <DragAndDropUpload
            onFilesSelected={handleImagesDrop}
            accept="image/*"
            multiple={true}
            maxFiles={10}
            maxSize={10 * 1024 * 1024} // 10MB
            isImage={true}
            className="w-full"
          >
            <div className="space-y-4 py-8">
              <div className="text-5xl">📷</div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Upload your listing images
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  First image will be used as the cover. You can upload up to 10 images.
                </p>
              </div>
              {uploadingImages && (
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
          </DragAndDropUpload>
        )}
        {/* Hidden input for adding more images */}
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesFileInput}
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
          Digital Files
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload downloadable files for your product (PDFs, documents, etc.). Images cannot be uploaded as digital files.
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.zip,.rar,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
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
