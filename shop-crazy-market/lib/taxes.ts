// Tax calculation utilities

interface TaxRate {
  state: string;
  rate: number; // As decimal (0.08 = 8%)
}

// Simplified tax rates by state (in production, use a tax API)
const TAX_RATES: TaxRate[] = [
  { state: "CA", rate: 0.0725 },
  { state: "NY", rate: 0.08 },
  { state: "TX", rate: 0.0625 },
  { state: "FL", rate: 0.06 },
  { state: "IL", rate: 0.0625 },
  // Add more states as needed
];

export function calculateTax(subtotal: number, state: string): number {
  const taxRate = TAX_RATES.find((tr) => tr.state === state)?.rate || 0.06; // Default 6%
  return Math.round(subtotal * taxRate);
}

export function getTaxRate(state: string): number {
  return TAX_RATES.find((tr) => tr.state === state)?.rate || 0.06;
}

