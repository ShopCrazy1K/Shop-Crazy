"use client";

import { useState, useEffect } from "react";
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
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // Save form data to localStorage to prevent data loss
  useEffect(() => {
    const savedData = localStorage.getItem('listing-form-data');
    if (savedData && !formData.title) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    if (formData.title || formData.description) {
      localStorage.setItem('listing-form-data', JSON.stringify(formData));
    }
  }, [formData]);

  // Check database connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setConnectionStatus("checking");
    try {
      const response = await fetch("/api/test-connection");
      if (response.ok) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch {
      setConnectionStatus("disconnected");
    }
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-xl border border-purple-100">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create a Listing
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                You need to be logged in to create a listing.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  async function handleImageUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent, retryCount = 0) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.price) {
        setError("Please fill in all required fields (title, description, and price)");
        setLoading(false);
        return;
      }

      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      if (isNaN(priceInCents) || priceInCents <= 0) {
        setError("Please enter a valid price");
        setLoading(false);
        return;
      }

      // Upload images first
      let imageArray: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingFiles(true);
        try {
          for (const file of imageFiles) {
            const url = await handleImageUpload(file);
            imageArray.push(url);
          }
          setUploadedImageUrls(imageArray);
        } catch (uploadError: any) {
          setError(`Failed to upload images: ${uploadError.message}`);
          setLoading(false);
          setUploadingFiles(false);
          return;
        }
        setUploadingFiles(false);
      } else if (formData.images) {
        imageArray = formData.images.split(',').map(url => url.trim()).filter(url => url);
      }

      // Validate digital files
      if (formData.type === "DIGITAL" && digitalFiles.length === 0 && uploadedFileUrls.length === 0) {
        setError("Please upload at least one digital file for digital products");
        setLoading(false);
        return;
      }

      // Upload digital files if needed
      let uploadedUrls: string[] = [...uploadedFileUrls];
      if (formData.type === "DIGITAL" && digitalFiles.length > uploadedFileUrls.length) {
        setUploadingFiles(true);
        const remainingFiles = digitalFiles.slice(uploadedFileUrls.length);
        
        for (const file of remainingFiles) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);

          try {
            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || "Failed to upload file");
            }

            const uploadData = await uploadResponse.json();
            uploadedUrls.push(uploadData.url);
          } catch (uploadError: any) {
            setError(`Failed to upload ${file.name}: ${uploadError.message}`);
            setLoading(false);
            setUploadingFiles(false);
            return;
          }
        }
        setUploadedFileUrls(uploadedUrls);
        setUploadingFiles(false);
      }

      // Create the listing with retry logic
      let response: Response;
      let data: any;
      
      try {
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price: priceInCents,
            quantity: parseInt(formData.quantity) || 1,
            images: imageArray,
            digitalFileUrls: formData.type === "DIGITAL" ? uploadedUrls : undefined,
            zone: "SHOP_4_US",
            userId: user?.id,
          }),
        });

        data = await response.json();
      } catch (fetchError: any) {
        // Network error - retry up to 2 times
        if (retryCount < 2) {
          console.log(`[Retry] Attempt ${retryCount + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return handleSubmit(e, retryCount + 1);
        }
        throw new Error("Network error. Please check your connection and try again.");
      }

      if (!response.ok) {
        const errorMessage = data.error || "Failed to create listing";
        
        // Check if it's a database error that might be temporary
        const isDatabaseError = errorMessage.includes('DATABASE_URL') || 
                               errorMessage.includes('pattern') || 
                               errorMessage.includes('connection') ||
                               errorMessage.includes('Prisma');
        
        if (isDatabaseError && retryCount < 2) {
          // Retry for database errors
          console.log(`[Retry] Database error detected, retrying... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          await checkConnection(); // Re-check connection
          return handleSubmit(e, retryCount + 1);
        }
        
        // Show user-friendly error
        if (isDatabaseError) {
          setError(
            "We're experiencing technical difficulties with our database. " +
            "Please try again in a few moments. Your form data has been saved locally."
          );
        } else {
          setError(errorMessage + (data.details ? `\n\n${data.details}` : ''));
        }
        setLoading(false);
        return;
      }

      // Success!
      const product = data;
      setCreatedProduct(product);
      setShowSuccess(true);
      setLoading(false);
      
      // Clear saved form data
      localStorage.removeItem('listing-form-data');
      
      // Clear connection status check
      setConnectionStatus("connected");
    } catch (err: any) {
      let errorMessage = err.message || "An error occurred while creating your listing";
      
      // Provide user-friendly error messages
      if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('pattern') || errorMessage.includes('connection')) {
        errorMessage = "We're experiencing technical difficulties. Your form data has been saved. Please try again in a moment.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  }

  if (showSuccess && createdProduct) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-xl border border-green-200">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <span className="text-4xl">✅</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-green-600">
                Listing Created Successfully!
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Your listing has been created and is now live.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Monthly listing fee: ${(LISTING_FEE_PER_MONTH / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/product/${createdProduct.id}`}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                View Listing
              </Link>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCreatedProduct(null);
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
                  setDigitalFiles([]);
                  setUploadedFileUrls([]);
                  setImageFiles([]);
                  setUploadedImageUrls([]);
                  setError("");
                  localStorage.removeItem('listing-form-data');
                }}
                className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
              >
                Create Another Listing
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create a New Listing
          </h1>
          <p className="text-gray-600 text-lg">
            Share your products with the world
          </p>
        </div>

        {/* Connection Status */}
        {connectionStatus === "checking" && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Checking database connection...
            </p>
          </div>
        )}

        {connectionStatus === "disconnected" && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-yellow-700 font-semibold mb-1">
                  ⚠️ Database Connection Issue
                </p>
                <p className="text-sm text-yellow-600 mb-2">
                  We're having trouble connecting to the database. You can still fill out the form - your data will be saved locally.
                </p>
                <button
                  onClick={checkConnection}
                  className="text-sm text-yellow-700 underline hover:text-yellow-900"
                >
                  Check Connection Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                {error.includes("technical difficulties") && (
                  <button
                    onClick={() => {
                      checkConnection();
                      setTimeout(() => handleSubmit(new Event('submit') as any), 1000);
                    }}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                  >
                    Try Again
                  </button>
                )}
              </div>
              <button
                onClick={() => setError("")}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 sm:p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📝</span>
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter product title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your product in detail..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">🔍</span>
              Product Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "PHYSICAL" | "DIGITAL" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="PHYSICAL">Physical Product</option>
                  <option value="DIGITAL">Digital Product</option>
                </select>
              </div>

              {formData.type === "PHYSICAL" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">🖼️</span>
              Images
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImageFiles(files);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imageFiles.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {imageFiles.length} image(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Or Enter Image URLs (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
            </div>
          </div>

          {/* Digital Files */}
          {formData.type === "DIGITAL" && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">📁</span>
                Digital Files
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Digital Files <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setDigitalFiles([...digitalFiles, ...files]);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {digitalFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Selected Files ({digitalFiles.length}):
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {digitalFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setDigitalFiles(digitalFiles.filter((_, i) => i !== index));
                              }}
                              className="text-red-500 hover:text-red-700 ml-4"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Listing Fee Info */}
          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
              <span className="mr-2">💰</span>
              Listing Fee
            </h3>
            <p className="text-purple-700">
              Monthly listing fee: <span className="font-bold">${(LISTING_FEE_PER_MONTH / 100).toFixed(2)}</span>
            </p>
            <p className="text-sm text-purple-600 mt-2">
              This fee will be charged monthly to keep your listing active.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || uploadingFiles || connectionStatus === "checking"}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading || uploadingFiles ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Create Listing
                </>
              )}
            </button>
            <Link
              href="/marketplace"
              className="px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
