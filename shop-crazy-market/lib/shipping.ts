// Shipping rate calculation

export interface ShippingOption {
  name: string;
  price: number; // In cents
  estimatedDays: number;
}

export function calculateShipping(
  weight: number, // in lbs
  zipCode: string,
  zone: string
): ShippingOption[] {
  // Simplified shipping calculation
  // In production, integrate with shipping APIs (USPS, FedEx, etc.)

  const baseRates: ShippingOption[] = [
    {
      name: "Standard Shipping",
      price: 599, // $5.99
      estimatedDays: 5,
    },
    {
      name: "Express Shipping",
      price: 1299, // $12.99
      estimatedDays: 2,
    },
    {
      name: "Overnight",
      price: 2499, // $24.99
      estimatedDays: 1,
    },
  ];

  // Adjust based on weight
  const weightMultiplier = weight > 5 ? 1.5 : weight > 2 ? 1.2 : 1;

  return baseRates.map((option) => ({
    ...option,
    price: Math.round(option.price * weightMultiplier),
  }));
}

export function getDefaultShipping(zipCode: string): ShippingOption {
  return {
    name: "Standard Shipping",
    price: 599,
    estimatedDays: 5,
  };
}

