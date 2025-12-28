"use client";

import { useState, useEffect } from "react";

interface Deal {
  id: string;
  title: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  badgeText?: string | null;
  badgeColor?: string | null;
  endsAt: string;
  promoCode?: string | null;
}

interface DealBadgeProps {
  deal: Deal;
  priceCents: number;
  className?: string;
}

export default function DealBadge({ deal, priceCents, className = "" }: DealBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(deal.endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deal.endsAt]);

  const calculateDiscount = () => {
    if (deal.discountType === "PERCENTAGE") {
      return Math.round((priceCents * deal.discountValue) / 100);
    }
    return deal.discountValue;
  };

  const discountCents = calculateDiscount();
  const originalPrice = priceCents;
  const discountedPrice = originalPrice - discountCents;

  const badgeColorClass = deal.badgeColor
    ? `bg-${deal.badgeColor}-500`
    : "bg-red-500";

  return (
    <div className={`bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {deal.badgeText && (
              <span className={`${badgeColorClass} text-white text-xs font-bold px-2 py-1 rounded`}>
                {deal.badgeText}
              </span>
            )}
            <span className="text-lg font-bold text-red-600">
              {deal.discountType === "PERCENTAGE"
                ? `${deal.discountValue}% OFF`
                : `$${(deal.discountValue / 100).toFixed(2)} OFF`}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">{deal.title}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          ${(discountedPrice / 100).toFixed(2)}
        </span>
        <span className="text-lg text-gray-500 line-through">
          ${(originalPrice / 100).toFixed(2)}
        </span>
        <span className="text-sm font-semibold text-red-600">
          Save ${(discountCents / 100).toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">⏰ Ends in:</span>
          <span className="font-bold text-red-600">{timeLeft}</span>
        </div>
        {deal.promoCode && (
          <span className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono">
            Code: {deal.promoCode}
          </span>
        )}
      </div>
    </div>
  );
}

