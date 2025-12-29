"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewFormProps {
  sellerId?: string;
  productId?: string;
  listingId?: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onReviewSubmitted?: () => void; // Legacy prop name
}

export default function ReviewForm({ 
  sellerId, 
  productId, 
  listingId,
  orderId, 
  onSuccess, 
  onCancel,
  onReviewSubmitted 
}: ReviewFormProps) {
  // Use onReviewSubmitted if onSuccess is not provided (for backward compatibility)
  const handleSuccess = onSuccess || onReviewSubmitted;
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    setError("");

    const newPhotos: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        newPhotos.push(data.url);
      } catch (err: any) {
        setError(err.message || `Failed to upload ${file.name}`);
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploadingPhotos(false);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to leave a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!sellerId && !productId && !listingId) {
      setError("Review target is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Determine which API endpoint to use
      let endpoint = "";
      let body: any = {
        rating,
        comment: comment || null,
      };

      if (sellerId) {
        // Seller/user review
        endpoint = `/api/users/${sellerId}/reviews`;
        body.reviewerId = user.id;
        body.orderId = orderId || null;
        body.photos = photos;
      } else if (productId) {
        // Product review (legacy) - doesn't support photos
        endpoint = `/api/reviews`;
        body.productId = productId;
        body.userId = user.id; // Product reviews use userId, not reviewerId
      } else if (listingId) {
        // Listing review - use seller reviews endpoint if we have sellerId
        if (sellerId) {
          endpoint = `/api/users/${sellerId}/reviews`;
          body.reviewerId = user.id;
          body.orderId = orderId || null;
          body.photos = photos;
        } else {
          // Fallback to general reviews endpoint
          endpoint = `/api/reviews`;
          body.listingId = listingId;
          body.userId = user.id;
        }
      } else {
        throw new Error("Either sellerId, productId, or listingId must be provided");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      if (handleSuccess) {
        handleSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Review Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Share your experience..."
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Add Photos (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          disabled={uploadingPhotos}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
        />
        {uploadingPhotos && (
          <p className="text-sm text-gray-500 mt-1">Uploading photos...</p>
        )}
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
