// Fee calculation utilities for Shop Crazy Market

export type CountryCode = "US" | "CA" | "UK" | "AU" | "EU" | "DEFAULT";

type ProcessingRule = {
  rate: number;      // e.g. 0.02
  fixedCents: number; // e.g. 20
  label: string;
};

const PROCESSING_RULES: Record<CountryCode, ProcessingRule> = {
  US: { rate: 0.02, fixedCents: 20, label: "US_2%_20c" },
  CA: { rate: 0.025, fixedCents: 30, label: "CA_2.5%_30c" },
  UK: { rate: 0.02, fixedCents: 25, label: "UK_2%_25p" }, // treat as "cents" in GBP minor units
  AU: { rate: 0.022, fixedCents: 30, label: "AU_2.2%_30c" },
  EU: { rate: 0.021, fixedCents: 25, label: "EU_2.1%_25c" },
  DEFAULT: { rate: 0.02, fixedCents: 20, label: "DEFAULT_2%_20c" },
};

function roundToInt(n: number) {
  return Math.round(n);
}

export function calcOrderBreakdown(args: {
  itemsSubtotalCents: number;
  shippingCents: number;
  giftWrapCents: number;
  taxCents: number;
  country: CountryCode;
  adsEnabled: boolean;
}) {
  const { itemsSubtotalCents, shippingCents, giftWrapCents, taxCents, country, adsEnabled } = args;

  const orderSubtotalCents = itemsSubtotalCents + shippingCents + giftWrapCents;
  const orderTotalCents = orderSubtotalCents + taxCents;

  const platformFeeCents = roundToInt(orderSubtotalCents * 0.05);
  const adFeeCents = adsEnabled ? roundToInt(orderSubtotalCents * 0.15) : 0;

  const rule = PROCESSING_RULES[country] ?? PROCESSING_RULES.DEFAULT;
  const processingFeeCents = roundToInt(orderTotalCents * rule.rate) + rule.fixedCents;

  const feesTotalCents = platformFeeCents + adFeeCents + processingFeeCents;
  const sellerPayoutCents = Math.max(0, orderTotalCents - feesTotalCents);

  return {
    orderSubtotalCents,
    orderTotalCents,
    platformFeeCents,
    adFeeCents,
    processingFeeCents,
    feesTotalCents,
    sellerPayoutCents,
    processingRule: rule.label,
    adsEnabledAtSale: adsEnabled,
  };
}

// Legacy exports for backward compatibility
export interface FeeBreakdown {
  itemTotal: number; // In cents
  shippingTotal: number; // In cents
  giftWrapTotal: number; // In cents
  subtotal: number; // In cents
  transactionFee: number; // 5% of subtotal
  paymentProcessingFee: number; // 2% + $0.20 (varies by country)
  advertisingFee: number; // 15% if seller opted in
  totalFees: number; // Sum of all fees
  sellerPayout: number; // Amount seller receives
  platformRevenue: number; // Platform's total revenue
}

export interface PaymentProcessingFee {
  percentage: number; // e.g., 0.02 for 2%
  fixed: number; // In cents, e.g., 20 for $0.20
}

// Payment processing fees by country (in cents)
const PAYMENT_PROCESSING_FEES: Record<string, PaymentProcessingFee> = {
  US: { percentage: 0.02, fixed: 20 }, // 2% + $0.20
  CA: { percentage: 0.025, fixed: 30 }, // 2.5% + $0.30
  GB: { percentage: 0.02, fixed: 25 }, // 2% + £0.25
  AU: { percentage: 0.022, fixed: 30 }, // 2.2% + $0.30
  EU: { percentage: 0.021, fixed: 25 }, // 2.1% + €0.25
  // Default
  DEFAULT: { percentage: 0.02, fixed: 20 },
};

// Listing fee per product per month (in cents)
export const LISTING_FEE_PER_MONTH = 20; // $0.20

// Transaction fee percentage
export const TRANSACTION_FEE_PERCENTAGE = 0.05; // 5%

// Advertising fee percentage (optional)
export const ADVERTISING_FEE_PERCENTAGE = 0.15; // 15%

/**
 * Calculate payment processing fee based on country
 */
export function calculatePaymentProcessingFee(
  amount: number,
  country: string = "US"
): number {
  const fee = PAYMENT_PROCESSING_FEES[country] || PAYMENT_PROCESSING_FEES.DEFAULT;
  return Math.round(amount * fee.percentage + fee.fixed);
}

/**
 * Calculate all fees for a transaction
 */
export function calculateFees(params: {
  itemTotal: number; // In cents
  shippingTotal: number; // In cents
  giftWrapTotal?: number; // In cents, optional
  country?: string; // For payment processing fee
  hasAdvertising?: boolean; // If seller opted into advertising
}): FeeBreakdown {
  const {
    itemTotal,
    shippingTotal,
    giftWrapTotal = 0,
    country = "US",
    hasAdvertising = false,
  } = params;

  const subtotal = itemTotal + shippingTotal + giftWrapTotal;

  // Transaction fee: 5% of subtotal
  const transactionFee = Math.round(subtotal * TRANSACTION_FEE_PERCENTAGE);

  // Payment processing fee: 2% + $0.20 (varies by country)
  const paymentProcessingFee = calculatePaymentProcessingFee(subtotal, country);

  // Advertising fee: 15% of subtotal (only if seller opted in)
  const advertisingFee = hasAdvertising
    ? Math.round(subtotal * ADVERTISING_FEE_PERCENTAGE)
    : 0;

  const totalFees = transactionFee + paymentProcessingFee + advertisingFee;

  // Seller payout = subtotal - total fees
  const sellerPayout = subtotal - totalFees;

  // Platform revenue = all fees
  const platformRevenue = totalFees;

  return {
    itemTotal,
    shippingTotal,
    giftWrapTotal,
    subtotal,
    transactionFee,
    paymentProcessingFee,
    advertisingFee,
    totalFees,
    sellerPayout,
    platformRevenue,
  };
}

/**
 * Calculate monthly listing fee for a product
 */
export function calculateMonthlyListingFee(productCount: number): number {
  return productCount * LISTING_FEE_PER_MONTH;
}

/**
 * Get payment processing fee info for a country
 */
export function getPaymentProcessingFeeInfo(
  country: string = "US"
): PaymentProcessingFee {
  return PAYMENT_PROCESSING_FEES[country] || PAYMENT_PROCESSING_FEES.DEFAULT;
}

