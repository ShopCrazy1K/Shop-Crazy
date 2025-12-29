export type Carrier = "USPS" | "UPS" | "FedEx" | "DHL" | "Other";

export function buildTrackingUrl(carrier: Carrier, trackingNumber: string) {
  const t = encodeURIComponent(trackingNumber.trim());

  switch (carrier) {
    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${t}`;
    case "UPS":
      return `https://www.ups.com/track?tracknum=${t}`;
    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
    case "DHL":
      return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${t}`;
    default:
      return ""; // "Other" can show number only or you can add a custom URL field later
  }
}

export function formatStatus(status: string) {
  // Optional: nice labels
  const s = status.toLowerCase();
  if (s === "processing") return "Processing";
  if (s === "shipped") return "Shipped";
  if (s === "delivered") return "Delivered";
  return status;
}

