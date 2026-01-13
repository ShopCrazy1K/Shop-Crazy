"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { LISTING_FEE_PER_MONTH } from "@/lib/fees";
import ImageReorderGrid from "@/components/ImageReorderGrid";
import DragAndDropUpload from "@/components/DragAndDropUpload";
import ImageReorderBeforeUpload from "@/components/ImageReorderBeforeUpload";
import { uploadFilesParallel, validateFile } from "@/lib/upload-utils";

type ImageItem = { id: string; url: string; path?: string };

interface FormData {
  title: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  type: "PHYSICAL" | "DIGITAL";
  condition: "NEW" | "USED";
  // SEO & Discovery
  tags: string[];
  searchKeywords: string;
  metaDescription: string;
  // Product Attributes
  sku: string;
  brand: string;
  materials: string;
  dimensions: string;
  weight: string;
  color: string;
  countryOfOrigin: string;
  // Shipping
  shippingCost: string;
  processingTime: string;
  shippingMethods: string[];
  // Policies
  returnPolicy: string;
  returnWindowDays: string;
  warrantyInfo: string;
  careInstructions: string;
  // Draft
  isDraft: boolean;
}

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    quantity: "1",
    category: "",
    type: "PHYSICAL",
    condition: "NEW",
    // SEO & Discovery
    tags: [],
    searchKeywords: "",
    metaDescription: "",
    // Product Attributes
    sku: "",
    brand: "",
    materials: "",
    dimensions: "",
    weight: "",
    color: "",
    countryOfOrigin: "",
    // Shipping
    shippingCost: "",
    processingTime: "",
    shippingMethods: [],
    // Policies
    returnPolicy: "",
    returnWindowDays: "",
    warrantyInfo: "",
    careInstructions: "",
    // Draft
    isDraft: false,
  });

  // Digital files state
  const [digitalFiles, setDigitalFiles] = useState<File[]>([]);
  const [uploadingDigitalFiles, setUploadingDigitalFiles] = useState(false);
  const [uploadedDigitalFileUrls, setUploadedDigitalFileUrls] = useState<string[]>([]);

  // Image files state (for physical products only)
  const [thumbnails, setThumbnails] = useState<ImageItem[]>([]); // Multiple thumbnails (Etsy-style)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageUrls, setImageUrls] = useState<string>(""); // Manual URLs
  const [imageUploadProgress, setImageUploadProgress] = useState<Map<File, number>>(new Map());
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState(""); // For tag input
  
  // Ref to prevent auto-save when canceling
  const isCancelingRef = useRef(false);

  // Check if user is returning from Stripe checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingListingId = sessionStorage.getItem('pendingListingId');
      if (pendingListingId) {
        // User returned from Stripe, show success with listing ID
        setCreatedProduct(pendingListingId);
        setShowSuccess(true);
        sessionStorage.removeItem('pendingListingId');
      }
    }
  }, []);

  // Load saved form data from localStorage
  useEffect(() => {
    // Reset cancel flag on mount
    isCancelingRef.current = false;
    
    if (typeof window !== 'undefined') {
      // Check if we have a flag that indicates cancel was just pressed
      const wasCanceled = sessionStorage.getItem('form-canceled');
      if (wasCanceled === 'true') {
        // Clear the flag and don't load any data
        sessionStorage.removeItem('form-canceled');
        // Ensure form is empty
        const emptyFormData: FormData = {
          title: "",
          description: "",
          price: "",
          quantity: "1",
          category: "",
          type: "PHYSICAL",
          condition: "NEW",
          tags: [],
          searchKeywords: "",
          metaDescription: "",
          sku: "",
          brand: "",
          materials: "",
          dimensions: "",
          weight: "",
          color: "",
          countryOfOrigin: "",
          shippingCost: "",
          processingTime: "",
          shippingMethods: [],
          returnPolicy: "",
          returnWindowDays: "",
          warrantyInfo: "",
          careInstructions: "",
          isDraft: false,
        };
        setFormData(emptyFormData);
        return;
      }
      
      const savedData = localStorage.getItem('listing-form-data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    // Don't save if we're canceling or if form is empty
    if (isCancelingRef.current) {
      return;
    }
    if (typeof window !== 'undefined' && (formData.title || formData.description)) {
      localStorage.setItem('listing-form-data', JSON.stringify(formData));
    }
  }, [formData]);

  // Check database connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    setConnectionStatus("checking");
    try {
      // Test actual Prisma connection, not just URL pattern
      const response = await fetch("/api/test-prisma-connection");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.results?.step6_query?.success) {
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("disconnected");
        }
      } else {
        setConnectionStatus("disconnected");
      }
    } catch {
      setConnectionStatus("disconnected");
    }
  }, []);

  // Redirect if not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-xl border border-purple-100">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Login Required
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              You need to be logged in to create a listing.
            </p>
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

  async function handleFileUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("[UPLOAD] Starting upload for file:", file.name, file.size, file.type);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("[UPLOAD] Upload failed:", errorData);
        throw new Error(errorData.error || errorData.message || `Failed to upload ${file.name}`);
      }

      const data = await response.json();
      console.log("[UPLOAD] Upload successful:", data.url);
      
      if (!data.url) {
        throw new Error("Upload succeeded but no URL returned");
      }
      
      return data.url;
    } catch (error: any) {
      console.error("[UPLOAD] Upload error:", error);
      throw error;
    }
  }

  async function handleThumbnailUpload(file: File) {
    setUploadingThumbnail(true);
    try {
      const url = await handleFileUpload(file);
      const newThumbnail: ImageItem = {
        id: crypto.randomUUID(),
        url,
        path: url,
      };
      setThumbnails((prev) => [...prev, newThumbnail]);
    } catch (error: any) {
      alert(`Failed to upload thumbnail: ${error.message}`);
    } finally {
      setUploadingThumbnail(false);
    }
  }

  const handleThumbnailDrop = useCallback((files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        handleThumbnailUpload(file);
      }
    });
  }, []);

  const handleThumbnailFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        handleThumbnailUpload(file);
      }
    });
    if (e.target) {
      e.target.value = "";
    }
  }, []);

  const handleThumbnailClick = useCallback(() => {
    thumbnailInputRef.current?.click();
  }, []);

  const handleAddTag = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag) && formData.tags.length < 20) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
        setTagInput("");
      }
    }
  }, [tagInput, formData]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  }, [formData]);

  async function handleDigitalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files first
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      const validation = validateFile(file, false);
      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Some files are invalid:\n\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    console.log("[DIGITAL FILES] Starting upload for", validFiles.length, "file(s)");
    setDigitalFiles((prev) => [...prev, ...validFiles]);
    setUploadingDigitalFiles(true);
    setError("");

    const newUrls: string[] = [];
    const errors: string[] = [];

    try {
      const results = await uploadFilesParallel(
        validFiles,
        {
          onProgress: (file, progress) => {
            console.log(`[DIGITAL FILES] ${file.name}: ${Math.round(progress)}%`);
          },
          onComplete: (file, url) => {
            newUrls.push(url);
            console.log("[DIGITAL FILES] Uploaded successfully:", url);
          },
          onError: (file, error) => {
            errors.push(`${file.name}: ${error}`);
            setDigitalFiles((prev) => prev.filter(f => f !== file));
          },
        },
        3 // Max 3 concurrent uploads
      );

      // Process any remaining results
      results.forEach((result, file) => {
        if (result.url && !newUrls.includes(result.url)) {
          newUrls.push(result.url);
        } else if (result.error) {
          errors.push(`${file.name}: ${result.error}`);
          setDigitalFiles((prev) => prev.filter(f => f !== file));
        }
      });

      if (errors.length > 0) {
        setError(`Some uploads failed: ${errors.join(', ')}`);
      }

      if (newUrls.length > 0) {
        setUploadedDigitalFileUrls((prev) => {
          const updated = [...prev, ...newUrls];
          console.log("[DIGITAL FILES] Total uploaded URLs:", updated.length);
          return updated;
        });
      }
    } catch (error: any) {
      console.error("[DIGITAL FILES] Upload error:", error);
      setError(error.message || "Failed to upload files");
    } finally {
      setUploadingDigitalFiles(false);
      e.target.value = ""; // Clear input
    }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files first
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      const validation = validateFile(file, true);
      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Some files are invalid:\n\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    setUploadingImages(true);
    setError("");

    // Initialize progress tracking
    const progressMap = new Map<File, number>();
    validFiles.forEach(file => progressMap.set(file, 0));
    setImageUploadProgress(new Map(progressMap));

    const newImages: ImageItem[] = [];
    const errors: string[] = [];

    try {
      const results = await uploadFilesParallel(
        validFiles,
        {
          onProgress: (file, progress) => {
            setImageUploadProgress(prev => {
              const updated = new Map(prev);
              updated.set(file, progress);
              return updated;
            });
          },
          onComplete: (file, url) => {
            newImages.push({
              id: crypto.randomUUID(),
              url,
            });
            setImageUploadProgress(prev => {
              const updated = new Map(prev);
              updated.set(file, 100);
              return updated;
            });
          },
          onError: (file, error) => {
            errors.push(`${file.name}: ${error}`);
            setImageFiles((prev) => prev.filter(f => f !== file));
          },
        },
        3 // Max 3 concurrent uploads
      );

      // Process any remaining results
      results.forEach((result, file) => {
        if (result.url && !newImages.find(img => img.url === result.url)) {
          newImages.push({
            id: crypto.randomUUID(),
            url: result.url,
          });
        } else if (result.error) {
          errors.push(`${file.name}: ${result.error}`);
          setImageFiles((prev) => prev.filter(f => f !== file));
        }
      });

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }

      if (errors.length > 0) {
        setError(`Some uploads failed: ${errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error("[IMAGE UPLOAD] Upload error:", error);
      setError(error.message || "Failed to upload images");
    } finally {
      setUploadingImages(false);
      setImageUploadProgress(new Map());
      e.target.value = ""; // Clear input
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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

      // Validate digital files for digital products
      if (formData.type === "DIGITAL" && uploadedDigitalFileUrls.length === 0) {
        setError("Please upload at least one digital file for digital products");
        setLoading(false);
        return;
      }

      // Validate thumbnails (at least one required)
      if (thumbnails.length === 0) {
        setError("Please upload at least one thumbnail image for your listing");
        setLoading(false);
        return;
      }

      // Prepare images array
      let finalImages: string[] = [];
      const thumbnailUrls = thumbnails.map((thumb) => thumb.path ?? thumb.url);

      if (formData.type === "DIGITAL") {
        // For digital products: thumbnails first, then digital files
        finalImages = [
          ...thumbnailUrls,
          ...uploadedDigitalFileUrls
        ];
      } else {
        // For physical products: thumbnails first, then other images, then manual URLs
        const imagePathsInOrder = images.map((img) => img.path ?? img.url);
        const manualUrls = imageUrls ? imageUrls.split(",").map(url => url.trim()).filter(Boolean) : [];
        
        finalImages = [
          ...thumbnailUrls,
          ...imagePathsInOrder,
          ...manualUrls
        ];
      }

      // Prepare shipping cost
      const shippingCostCents = formData.shippingCost 
        ? Math.round(parseFloat(formData.shippingCost) * 100) 
        : undefined;

      // Prepare return window
      const returnWindowDays = formData.returnWindowDays 
        ? parseInt(formData.returnWindowDays) 
        : undefined;

      // Create the listing using listings/create API (handles Stripe subscription for listing fee)
      const response = await fetch("/api/listings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priceCents: priceInCents,
          currency: "usd",
          category: formData.category || undefined,
          images: finalImages,
          thumbnails: thumbnailUrls,
          // digitalFiles is required - ensure we have uploaded files for digital products
          digitalFiles: formData.type === "DIGITAL" ? uploadedDigitalFileUrls : [],
          sellerId: user?.id,
          // SEO & Discovery
          tags: formData.tags,
          searchKeywords: formData.searchKeywords || undefined,
          metaDescription: formData.metaDescription || undefined,
          // Product Attributes
          sku: formData.sku || undefined,
          brand: formData.brand || undefined,
          materials: formData.materials || undefined,
          dimensions: formData.dimensions || undefined,
          weight: formData.weight || undefined,
          color: formData.color || undefined,
          countryOfOrigin: formData.countryOfOrigin || undefined,
          // Shipping
          shippingCostCents: shippingCostCents,
          processingTime: formData.processingTime || undefined,
          shippingMethods: formData.shippingMethods,
          // Policies
          returnPolicy: formData.returnPolicy || undefined,
          returnWindowDays: returnWindowDays,
          warrantyInfo: formData.warrantyInfo || undefined,
          careInstructions: formData.careInstructions || undefined,
          // Draft
          isDraft: formData.isDraft,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.message || data.error || "Failed to create listing";
        // Handle field errors from validation
        if (data.fieldErrors) {
          const fieldErrorMessages = Object.entries(data.fieldErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          setError(errorMessage + '\n\n' + fieldErrorMessages);
        } else {
          setError(errorMessage + (data.details ? `\n\n${data.details}` : ''));
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log("[LISTING CREATE] Response:", result);
      
      // Always store the listing ID for later use
      const listingId = result.listingId || result.listing?.id || result.id;
      if (listingId) {
        console.log("[LISTING CREATE] Storing listing ID:", listingId);
        setCreatedProduct(listingId);
      }
      
      // If it's a draft, show success message without payment
      if (result.isDraft || formData.isDraft) {
        if (listingId) {
          setShowSuccess(true);
          setLoading(false);
        } else {
          setError("Draft saved but no listing ID returned");
          setLoading(false);
        }
        return;
      }
      
      // If there's a checkout URL, redirect to Stripe checkout for listing fee
      if (result.checkoutUrl) {
        // Store listing ID in sessionStorage so we can retrieve it after payment
        if (typeof window !== 'undefined' && listingId) {
          sessionStorage.setItem('pendingListingId', String(listingId));
          console.log("[LISTING CREATE] Stored listing ID in sessionStorage:", listingId);
        }
        window.location.href = result.checkoutUrl;
        return; // Don't show success message, user is going to checkout
      }
      
      // Otherwise, show success and allow viewing the listing
      if (listingId) {
        setShowSuccess(true);
        setLoading(false);
      } else {
        setError("Listing created but no listing ID returned");
        setLoading(false);
      }
      
      // Clear saved form data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('listing-form-data');
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while creating your listing");
      setLoading(false);
    }
  }

  function handleCancel() {
    // Set flag to prevent auto-save from running
    isCancelingRef.current = true;
    
    // Clear localStorage FIRST to prevent any auto-save from restoring data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('listing-form-data');
      // Also clear any other related localStorage items
      sessionStorage.removeItem('pendingListingId');
      // Set a flag to prevent loading data if user comes back to this page
      sessionStorage.setItem('form-canceled', 'true');
      
      // Force clear form inputs directly via DOM IMMEDIATELY (before state updates)
      const form = document.querySelector('form');
      if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((input: any) => {
          if (input.type === 'file') {
            input.value = '';
          } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          } else if (input.tagName === 'SELECT') {
            // Reset select to first option
            input.selectedIndex = 0;
          } else {
            input.value = '';
          }
          // Trigger input event to ensure React sees the change
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }
    }
    
    // Clear all form data immediately - use empty object to force re-render
    const emptyFormData: FormData = {
      title: "",
      description: "",
      price: "",
      quantity: "1",
      category: "",
      type: "PHYSICAL",
      condition: "NEW",
      tags: [],
      searchKeywords: "",
      metaDescription: "",
      sku: "",
      brand: "",
      materials: "",
      dimensions: "",
      weight: "",
      color: "",
      countryOfOrigin: "",
      shippingCost: "",
      processingTime: "",
      shippingMethods: [],
      returnPolicy: "",
      returnWindowDays: "",
      warrantyInfo: "",
      careInstructions: "",
      isDraft: false,
    };
    
    // Clear all state synchronously using flushSync to force immediate update
    flushSync(() => {
      setThumbnails([]);
      setDigitalFiles([]);
      setUploadedDigitalFileUrls([]);
      setImageFiles([]);
      setImages([]);
      setImageUrls("");
      setTagInput("");
      setFormData(emptyFormData);
      setError("");
      setLoading(false);
      setShowSuccess(false);
      setCreatedProduct(null);
    });
    
    // Navigate immediately after state is flushed
    if (typeof window !== 'undefined') {
      window.location.href = "/marketplace";
    }
  }

  function handleCreateAnother() {
    setShowSuccess(false);
    setCreatedProduct(null);
    setThumbnails([]);
    setDigitalFiles([]);
    setUploadedDigitalFileUrls([]);
    setImageFiles([]);
    setImages([]);
    setImageUrls("");
    setTagInput("");
    setFormData({
      title: "",
      description: "",
      price: "",
      quantity: "1",
      category: "",
      type: "PHYSICAL",
      condition: "NEW",
      tags: [],
      searchKeywords: "",
      metaDescription: "",
      sku: "",
      brand: "",
      materials: "",
      dimensions: "",
      weight: "",
      color: "",
      countryOfOrigin: "",
      shippingCost: "",
      processingTime: "",
      shippingMethods: [],
      returnPolicy: "",
      returnWindowDays: "",
      warrantyInfo: "",
      careInstructions: "",
      isDraft: false,
    });
    setError("");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('listing-form-data');
    }
    checkConnection();
  }

  // Success modal
  if (showSuccess && createdProduct) {
    const listingFeeDollars = (LISTING_FEE_PER_MONTH / 100).toFixed(2);
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-2xl border border-green-200">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-green-600">
              {formData.isDraft ? "Draft Saved Successfully!" : "Listing Created Successfully!"}
            </h1>
            {formData.isDraft && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  💾 Your listing has been saved as a draft. It won't be visible to buyers until you publish it.
                </p>
              </div>
            )}
            {!formData.isDraft && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 text-purple-800">💰 Listing Fee Information</h2>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Monthly Listing Fee:</span>
                    <span className="text-2xl font-bold text-purple-600">${listingFeeDollars}</span>
                  </div>
                  <div className="text-sm text-gray-600 bg-white rounded-lg p-4 mt-3">
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
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const listingId = typeof createdProduct === 'string' 
                    ? createdProduct 
                    : createdProduct?.id || createdProduct?.listingId || String(createdProduct);
                  console.log("[VIEW LISTING] Listing ID:", listingId, "Type:", typeof listingId);
                  if (listingId) {
                    // Redirect to listing page immediately
                    window.location.href = `/listings/${listingId}`;
                  } else {
                    console.error('[VIEW LISTING] No listing ID found:', createdProduct);
                    alert('Listing ID not found. Please check your listings.');
                  }
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                View Your Listing
              </button>
              <button
                onClick={handleCreateAnother}
                className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
              >
                Create Another Listing
              </button>
              <Link
                href="/marketplace"
                className="bg-purple-100 text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-purple-200 transition-all transform hover:scale-105 text-center flex items-center justify-center"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6 pb-24">
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
                <p className="text-sm text-yellow-600 mb-3">
                  We're having trouble connecting to the database. You can still fill out the form - your data will be saved locally.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={checkConnection}
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    🔄 Check Again
                  </button>
                  <Link
                    href="/api/debug-database-url"
                    target="_blank"
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    🔍 Debug Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {connectionStatus === "connected" && user?.role === "ADMIN" && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-700 flex items-center">
              <span className="mr-2">✅</span>
              Database connected. Ready to create your listing!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-4 text-red-500 hover:text-red-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 sm:p-8 space-y-8">
          {/* Basic Information */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📝</span>
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter product title"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  placeholder="Describe your product in detail..."
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.description.length}/2000 characters
                </p>
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Product Details */}
          <section>
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as "PHYSICAL" | "DIGITAL";
                    setFormData({ ...formData, type: newType });
                    // Clear files when switching types
                    if (newType === "DIGITAL") {
                      setImageFiles([]);
                      setImages([]);
                      setImageUrls("");
                    } else {
                      setDigitalFiles([]);
                      setUploadedDigitalFileUrls([]);
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                >
                  <option value="PHYSICAL">📦 Physical Product</option>
                  <option value="DIGITAL">💾 Digital Product</option>
                </select>
              </div>

              {formData.type === "PHYSICAL" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as "NEW" | "USED" })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  >
                    <option value="NEW">✨ New</option>
                    <option value="USED">🔄 Used</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* SEO & Discovery Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">🔍</span>
              SEO & Discovery
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags / Keywords
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Add tags to help buyers find your product. Press Enter to add each tag (max 20).
                </p>
                <div className="flex flex-wrap gap-2 mb-2 p-3 border-2 border-gray-300 rounded-xl min-h-[50px]">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {formData.tags.length < 20 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type and press Enter..."
                      className="flex-1 min-w-[150px] border-0 focus:ring-0 focus:outline-none"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {formData.tags.length}/20 tags
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Keywords
                </label>
                <input
                  type="text"
                  value={formData.searchKeywords}
                  onChange={(e) => setFormData({ ...formData, searchKeywords: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Additional keywords for search (comma-separated)"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.searchKeywords.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  placeholder="Brief description for search engines (150-160 characters recommended)"
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </section>

          {/* Product Attributes Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📦</span>
              Product Attributes
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU / Product Code
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="e.g., PROD-001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Materials
                </label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="e.g., Cotton, Polyester, Wood"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="e.g., 10x5x3 inches"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="e.g., 1.5 lbs or 0.68 kg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="e.g., Red, Blue, Multi-color"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={formData.countryOfOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="e.g., United States, China"
                />
              </div>
            </div>
          </section>

          {/* Shipping Information Section - Physical Products Only */}
          {formData.type === "PHYSICAL" && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">🚚</span>
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shipping Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Processing Time
                  </label>
                  <select
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  >
                    <option value="">Select processing time</option>
                    <option value="1-2 business days">1-2 business days</option>
                    <option value="3-5 business days">3-5 business days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3+ weeks">3+ weeks</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shipping Methods
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["Standard", "Express", "Overnight", "International"].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shippingMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, shippingMethods: [...formData.shippingMethods, method] });
                            } else {
                              setFormData({ ...formData, shippingMethods: formData.shippingMethods.filter(m => m !== method) });
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Policies & Information Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📋</span>
              Policies & Information
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Return Window (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.returnWindowDays}
                    onChange={(e) => setFormData({ ...formData, returnWindowDays: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="e.g., 30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Warranty Information
                  </label>
                  <input
                    type="text"
                    value={formData.warrantyInfo}
                    onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="e.g., 1 year manufacturer warranty"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Return Policy
                </label>
                <textarea
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  placeholder="Describe your return policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Care Instructions
                </label>
                <textarea
                  value={formData.careInstructions}
                  onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  placeholder="e.g., Hand wash only, Do not bleach, Air dry"
                />
              </div>
            </div>
          </section>

          {/* Thumbnail Upload Section - Etsy Style - Multiple Thumbnails */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📷</span>
              Listing Thumbnails (Cover Images) *
            </h2>
            
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-3">
                Upload multiple thumbnail images. The first image will be the main cover image that buyers see first. You can upload up to 10 thumbnails.
              </p>
              
              {thumbnails.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {thumbnails.map((thumb, index) => (
                      <div key={thumb.id} className="relative border-2 rounded-xl overflow-hidden bg-gray-50 aspect-square">
                        <img
                          src={thumb.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setThumbnails((prev) => prev.filter((t) => t.id !== thumb.id))}
                          disabled={uploadingThumbnail}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shadow-lg transition-colors disabled:opacity-50"
                          title="Remove thumbnail"
                        >
                          ×
                        </button>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newThumbnails = [...thumbnails];
                              [newThumbnails[0], newThumbnails[index]] = [newThumbnails[index], newThumbnails[0]];
                              setThumbnails(newThumbnails);
                            }}
                            className="absolute bottom-2 left-2 bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-lg transition-colors"
                            title="Set as main image"
                          >
                            Set Main
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {thumbnails.length < 10 && (
                    <button
                      type="button"
                      onClick={handleThumbnailClick}
                      disabled={uploadingThumbnail}
                      className="w-full border-2 border-dashed border-purple-300 rounded-xl p-4 text-center hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      + Add More Thumbnails ({thumbnails.length}/10)
                    </button>
                  )}
                </div>
              ) : (
                <DragAndDropUpload
                  onFilesSelected={handleThumbnailDrop}
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
                        Upload your listing thumbnails
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Drag and drop images here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
                        Recommended: Square images (1:1 ratio), at least 1000x1000px. First image will be the main cover image.
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
              {/* Hidden input for thumbnails */}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleThumbnailFileInput}
                className="hidden"
              />
            </div>
          </section>

          {/* Digital Files Section - Only for Digital Products */}
          {formData.type === "DIGITAL" && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">📁</span>
                Digital Files <span className="text-red-500">*</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Digital Files
                  </label>
                  
                  {/* Drag and Drop Upload */}
                  <DragAndDropUpload
                    onFilesSelected={(files) => {
                      // Create a synthetic event for handleDigitalFileChange
                      const fileList = {
                        files: files as any,
                        target: { files: files as any, value: "" },
                      };
                      handleDigitalFileChange(fileList as any);
                    }}
                    accept=".zip,.rar,.pdf,.epub,.mobi,.doc,.docx,.txt,.mp3,.mp4,.avi,.mov,.jpg,.png,.gif,.psd,.ai,.svg"
                    multiple={true}
                    maxSize={50 * 1024 * 1024}
                    className="mb-3"
                  >
                    <div className="space-y-2">
                      <div className="text-3xl">📦</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Drag and drop files here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse • Max 50MB per file
                      </p>
                    </div>
                  </DragAndDropUpload>

                  {/* Traditional File Input (fallback) */}
                  <input
                    type="file"
                    multiple
                    onChange={handleDigitalFileChange}
                    disabled={uploadingDigitalFiles}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    accept=".zip,.rar,.pdf,.epub,.mobi,.doc,.docx,.txt,.mp3,.mp4,.avi,.mov,.jpg,.png,.gif,.psd,.ai,.svg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 You can select multiple files. Max 50MB per file. Supported: ZIP, RAR, PDF, EPUB, MOBI, DOC, DOCX, TXT, MP3, MP4, AVI, MOV, JPG, PNG, GIF, PSD, AI, SVG
                  </p>
                </div>

                {uploadingDigitalFiles && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <span className="text-blue-600 animate-spin">🔄</span>
                    <p className="text-sm text-blue-800">Uploading files...</p>
                  </div>
                )}

                {uploadedDigitalFileUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Uploaded Files ({uploadedDigitalFileUrls.length}):
                    </p>
                    <div className="space-y-2">
                      {uploadedDigitalFileUrls.map((url, idx) => {
                        const filename = url.split("/").pop() || `File ${idx + 1}`;
                        return (
                          <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-green-600">✅</span>
                              <p className="text-sm text-green-800">
                                <strong>File {idx + 1}:</strong> {filename}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedDigitalFileUrls(uploadedDigitalFileUrls.filter((_, i) => i !== idx));
                                setDigitalFiles(digitalFiles.filter((_, i) => i !== idx));
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold px-3 py-1 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {digitalFiles.length > uploadedDigitalFileUrls.length && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Files Pending Upload ({digitalFiles.length - uploadedDigitalFileUrls.length}):
                    </p>
                    {digitalFiles.slice(uploadedDigitalFileUrls.length).map((file, idx) => (
                      <div key={`pending-${idx}`} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                        <span className="text-yellow-600 animate-pulse">⏳</span>
                        <p className="text-sm text-yellow-800">
                          <strong>Uploading:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Images Section - Only for Physical Products */}
          {formData.type === "PHYSICAL" && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">🖼️</span>
                Additional Product Images (Optional)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Images (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Add more images to show different angles, details, or variations of your product. You can upload up to 10 images total (including thumbnail).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Images
                  </label>
                  
                  {/* Drag and Drop Upload */}
                  <DragAndDropUpload
                    onFilesSelected={(files) => {
                      setImageFiles((prev) => [...prev, ...files]);
                    }}
                    accept="image/*"
                    multiple={true}
                    maxFiles={10}
                    maxSize={10 * 1024 * 1024}
                    isImage={true}
                    className="mb-3"
                  >
                    <div className="space-y-2">
                      <div className="text-3xl">📸</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Drag and drop images here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse • Max 10MB per image
                      </p>
                    </div>
                  </DragAndDropUpload>

                  {/* Traditional File Input (fallback) */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    disabled={uploadingImages}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload images directly (max 10MB per image, will be automatically optimized).
                  </p>
                </div>

                {/* Image Reordering Before Upload */}
                {imageFiles.length > 0 && !uploadingImages && (
                  <ImageReorderBeforeUpload
                    files={imageFiles}
                    onReorder={(reorderedFiles) => {
                      setImageFiles(reorderedFiles);
                    }}
                    onRemove={(index) => {
                      setImageFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                  />
                )}

                {uploadingImages && imageFiles.length > 0 && (
                  <div className="space-y-2">
                    {imageFiles.map((file) => {
                      const progress = imageUploadProgress.get(file) || 0;
                      return (
                        <div key={`${file.name}-${file.size}`} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-blue-800 truncate flex-1">{file.name}</p>
                            <span className="text-xs text-blue-600 ml-2">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {images.length > 0 && (
                  <div className="space-y-2">
                    <ImageReorderGrid items={images} onChange={setImages} maxImages={10} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or Enter Image URLs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Separate multiple URLs with commas.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Draft & Listing Fee Info */}
          <section className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDraft}
                  onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                    <span className="mr-2">💾</span>
                    Save as Draft
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Save this listing as a draft to finish later. Draft listings won't be visible to buyers and won't incur listing fees until published.
                  </p>
                </div>
              </label>
            </div>

            {!formData.isDraft && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
                  <span className="mr-2">💰</span>
                  Listing Fee
                </h3>
                <p className="text-purple-700">
                  Monthly listing fee: <span className="font-bold text-xl">${(LISTING_FEE_PER_MONTH / 100).toFixed(2)}</span>
                </p>
                <p className="text-sm text-purple-600 mt-2">
                  This fee will be charged monthly to keep your listing active.
                </p>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingDigitalFiles || uploadingImages || connectionStatus === "checking"}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading || uploadingDigitalFiles || uploadingImages ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Create Listing
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all text-center flex items-center justify-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
