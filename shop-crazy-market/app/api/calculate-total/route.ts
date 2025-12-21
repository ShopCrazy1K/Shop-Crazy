import { NextResponse } from "next/server";
import { calculateTax } from "@/lib/taxes";
import { calculateShipping } from "@/lib/shipping";

export async function POST(req: Request) {
  try {
    const { items, shippingZip, shippingState, weight } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Calculate shipping
    const shippingOptions = calculateShipping(
      weight || 1,
      shippingZip || "00000",
      "US"
    );
    const selectedShipping = shippingOptions[0]; // Default to standard

    // Calculate tax
    const tax = calculateTax(subtotal, shippingState || "CA");

    // Calculate total
    const total = subtotal + selectedShipping.price + tax;

    return NextResponse.json({
      subtotal,
      shipping: selectedShipping.price,
      shippingOptions,
      tax,
      total,
      breakdown: {
        items: subtotal,
        shipping: selectedShipping.price,
        tax,
        total,
      },
    });
  } catch (error: any) {
    console.error("Calculate total error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate total" },
      { status: 500 }
    );
  }
}

