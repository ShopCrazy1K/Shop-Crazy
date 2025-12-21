"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { LISTING_FEE_PER_MONTH } from "@/lib/fees";

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "1",
    category: "",
    type: "PHYSICAL",
    condition: "NEW",
    images: "",
  });
  const [digitalFiles, setDigitalFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);

  // Redirect if not logged in
  if (!user) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold mb-4">Create a Listing</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to create a listing.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.price) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      if (isNaN(priceInCents) || priceInCents <= 0) {
        setError("Please enter a valid price");
        setLoading(false);
        return;
      }

      // Validate digital files
      if (formData.type === "DIGITAL" && digitalFiles.length === 0 && uploadedFileUrls.length === 0) {
        setError("Please upload at least one digital file for digital products");
        setLoading(false);
        return;
      }

      // Use already uploaded file URLs (files are uploaded immediately when selected)
      let uploadedUrls: string[] = [...uploadedFileUrls];
      
      // If there are any files that haven't been uploaded yet, upload them now
      if (formData.type === "DIGITAL" && digitalFiles.length > uploadedFileUrls.length) {
        setUploadingFiles(true);
        const remainingFiles = digitalFiles.slice(uploadedFileUrls.length);
        
        // Upload remaining files
        for (const file of remainingFiles) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);

          try {
            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              const uploadError = await uploadResponse.json();
              setError(uploadError.error || `Failed to upload ${file.name}`);
              setLoading(false);
              setUploadingFiles(false);
              return;
            }

            const uploadData = await uploadResponse.json();
            uploadedUrls.push(uploadData.url);
          } catch (error) {
            setError(`Failed to upload ${file.name}`);
            setLoading(false);
            setUploadingFiles(false);
            return;
          }
        }
        
        setUploadedFileUrls(uploadedUrls);
        setUploadingFiles(false);
      }

      // Parse images (comma-separated URLs)
      let imageArray = formData.images
        ? formData.images.split(",").map((url) => url.trim()).filter(Boolean)
        : [];

      // For digital products, store uploaded file URLs in the images array
      // The first items are the digital files, followed by preview images
      if (formData.type === "DIGITAL" && uploadedUrls.length > 0) {
        imageArray = [...uploadedUrls, ...imageArray];
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: priceInCents,
          quantity: parseInt(formData.quantity) || 1,
          images: imageArray,
          digitalFileUrls: formData.type === "DIGITAL" ? uploadedUrls : undefined, // Store digital file URLs separately
          zone: "SHOP_4_US", // Default zone value
          userId: user?.id, // Include user ID from auth context
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create listing");
        setLoading(false);
        return;
      }

      const product = await response.json();
      setCreatedProduct(product);
      setShowSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  }

  function handleViewProduct() {
    if (createdProduct) {
      router.push(`/product/${createdProduct.id}`);
    }
  }

  function handleCreateAnother() {
    setShowSuccess(false);
    setCreatedProduct(null);
    setDigitalFiles([]);
    setUploadedFileUrls([]);
    setFormData({
      title: "",
      description: "",
      price: "",
      quantity: "1",
      category: "",
      type: "PHYSICAL",
      condition: "NEW",
      images: "",
    });
  }

  // Success modal
  if (showSuccess && createdProduct) {
    const listingFeeDollars = (LISTING_FEE_PER_MONTH / 100).toFixed(2);
    
    return (
      <main className="p-4 max-w-3xl mx-auto pb-24">
        <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4 text-green-600">Listing Created Successfully!</h1>
          
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-purple-800">📋 Listing Fee Information</h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Monthly Listing Fee:</span>
                <span className="text-2xl font-bold text-purple-600">${listingFeeDollars}</span>
              </div>
              <div className="text-sm text-gray-600 bg-white rounded-lg p-3">
                <p className="mb-2">💡 <strong>How it works:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>You'll be charged <strong>${listingFeeDollars} per month</strong> for this listing</li>
                  <li>Fees are billed on the 1st of each month</li>
                  <li>You can remove listings anytime to stop fees</li>
                  <li>Fees are charged automatically via Stripe</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewProduct}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View Your Listing
            </button>
            <button
              onClick={handleCreateAnother}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Create Another Listing
            </button>
            <Link
              href="/marketplace"
              className="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-200 transition-colors text-center"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-3xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a New Listing</h1>

      {/* Listing Fee Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-semibold text-blue-900 mb-1">Listing Fee: ${(LISTING_FEE_PER_MONTH / 100).toFixed(2)}/month</p>
            <p className="text-sm text-blue-700">
              You'll be charged <strong>${(LISTING_FEE_PER_MONTH / 100).toFixed(2)} per month</strong> for each active listing. 
              Fees are billed on the 1st of each month.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
            placeholder="e.g., Vintage Game Console"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
            rows={4}
            placeholder="Describe your product..."
            required
          />
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">Product Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="PHYSICAL"
                checked={formData.type === "PHYSICAL"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mr-2"
              />
              📦 Physical
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="DIGITAL"
                checked={formData.type === "DIGITAL"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mr-2"
              />
              💾 Digital
            </label>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-semibold mb-2">Condition</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="NEW"
                checked={formData.condition === "NEW"}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="mr-2"
              />
              ✨ New
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="USED"
                checked={formData.condition === "USED"}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="mr-2"
              />
              🔄 Used
            </label>
          </div>
        </div>

        {/* Digital File Upload */}
        {formData.type === "DIGITAL" && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Digital Files <span className="text-red-500">*</span>
            </label>
            
            {/* File Input */}
            <input
              type="file"
              multiple
              id="digital-files-input"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  // Add new files to existing selection
                  setDigitalFiles((prev) => [...prev, ...files]);
                  
                  // Auto-upload files immediately
                  setUploadingFiles(true);
                  const newUrls: string[] = [];
                  
                  for (const file of files) {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);

                    try {
                      const uploadResponse = await fetch("/api/upload", {
                        method: "POST",
                        body: uploadFormData,
                      });

                      if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        newUrls.push(uploadData.url);
                      } else {
                        const uploadError = await uploadResponse.json();
                        alert(`Failed to upload ${file.name}: ${uploadError.error || "Unknown error"}`);
                      }
                    } catch (error) {
                      alert(`Failed to upload ${file.name}`);
                    }
                  }
                  
                  // Add uploaded URLs to the list
                  setUploadedFileUrls((prev) => [...prev, ...newUrls]);
                  setUploadingFiles(false);
                  
                  // Clear the input so same files can be selected again if needed
                  e.target.value = "";
                }
              }}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              accept=".zip,.rar,.pdf,.epub,.mobi,.doc,.docx,.txt,.mp3,.mp4,.avi,.mov,.jpg,.png,.gif,.psd,.ai,.svg"
            />
            
            {/* Show files waiting to upload */}
            {digitalFiles.length > uploadedFileUrls.length && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-gray-600 font-semibold">Uploading files...</p>
                {digitalFiles.slice(uploadedFileUrls.length).map((file, idx) => (
                  <div key={`pending-${idx}`} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⏳ <strong>Uploading:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show uploaded files */}
            {uploadedFileUrls.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-semibold">
                  Uploaded Files ({uploadedFileUrls.length}):
                </p>
                {uploadedFileUrls.map((url, idx) => {
                  const filename = url.split("/").pop() || `File ${idx + 1}`;
                  return (
                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <p className="text-sm text-green-800">
                          <strong>File {idx + 1}:</strong> {filename}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileUrls(uploadedFileUrls.filter((_, i) => i !== idx));
                          // Also remove from digitalFiles if it exists
                          if (idx < digitalFiles.length) {
                            setDigitalFiles(digitalFiles.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold px-2 py-1 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {uploadingFiles && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">⏳ Uploading files...</p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              💡 <strong>Tip:</strong> You can select multiple files at once (hold Ctrl/Cmd to select multiple), or add more files later. 
              Files upload automatically when selected. Max 50MB per file.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: ZIP, RAR, PDF, EPUB, MOBI, DOC, DOCX, TXT, MP3, MP4, AVI, MOV, JPG, PNG, GIF, PSD, AI, SVG
            </p>
          </div>
        )}

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            {formData.type === "DIGITAL" ? "Preview Images (Optional)" : "Product Images"}
          </label>
          
          {/* Image Upload */}
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;

                const uploadedUrls: string[] = [];
                for (const file of files) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} is too large. Max size is 5MB.`);
                    continue;
                  }

                  const uploadFormData = new FormData();
                  uploadFormData.append("file", file);

                  try {
                    const uploadResponse = await fetch("/api/upload", {
                      method: "POST",
                      body: uploadFormData,
                    });

                    if (uploadResponse.ok) {
                      const uploadData = await uploadResponse.json();
                      uploadedUrls.push(uploadData.url);
                    }
                  } catch (error) {
                    console.error("Error uploading image:", error);
                  }
                }

                // Combine with existing images
                const existingImages = formData.images
                  ? formData.images.split(",").map((url) => url.trim()).filter(Boolean)
                  : [];
                setFormData({
                  ...formData,
                  images: [...existingImages, ...uploadedUrls].join(", "),
                });
              }}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500">
              Upload images directly or enter URLs below (max 5MB per image)
            </p>
          </div>

          {/* Image URLs (Alternative) */}
          <div className="mt-2">
            <input
              type="text"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              placeholder="Or enter image URLs separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === "DIGITAL" 
                ? "Add preview images to showcase your digital product (optional)"
                : "Separate multiple URLs with commas (e.g., https://example.com/image1.jpg, https://example.com/image2.jpg)"}
            </p>
          </div>

          {/* Preview uploaded images */}
          {formData.images && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.images.split(",").map((url, idx) => {
                const trimmedUrl = url.trim();
                if (!trimmedUrl) return null;
                return (
                  <div key={idx} className="relative">
                    <img
                      src={trimmedUrl}
                      alt={`Preview ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const images = formData.images.split(",").filter((_, i) => i !== idx);
                        setFormData({ ...formData, images: images.join(", ") });
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploadingFiles ? "Processing..." : "Create Listing"}
            </button>
          <Link
            href="/marketplace"
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

