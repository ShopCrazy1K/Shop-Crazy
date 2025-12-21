// Printify API integration utilities

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  variants: Array<{
    id: number;
    price: number;
    is_enabled: boolean;
  }>;
  images: Array<{
    src: string;
  }>;
}

interface PrintifyConfig {
  accessToken: string;
  shopId: string;
}

export class PrintifyClient {
  private accessToken: string;
  private shopId: string;
  private baseUrl = "https://api.printify.com/v1";

  constructor(config: PrintifyConfig) {
    this.accessToken = config.accessToken;
    this.shopId = config.shopId;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(limit = 50): Promise<PrintifyProduct[]> {
    const response = await this.request(
      `/shops/${this.shopId}/products.json?limit=${limit}`
    );
    return response.data || [];
  }

  async getProduct(productId: string): Promise<PrintifyProduct> {
    const response = await this.request(
      `/shops/${this.shopId}/products/${productId}.json`
    );
    return response;
  }

  async publishProduct(productId: string, publishToShop: boolean = true) {
    return this.request(
      `/shops/${this.shopId}/products/${productId}/publish.json`,
      {
        method: "POST",
        body: JSON.stringify({
          title: true,
          description: true,
          images: true,
          variants: true,
          tags: true,
          keyFeatures: true,
          shipping_template: true,
        }),
      }
    );
  }
}

/**
 * Convert Printify product to our Product format
 */
export function convertPrintifyProduct(
  printifyProduct: PrintifyProduct,
  shopId: string,
  zone: string = "FRESH_OUT_WORLD"
) {
  const variant = printifyProduct.variants.find((v) => v.is_enabled) || printifyProduct.variants[0];
  const image = printifyProduct.images[0]?.src || "";

  return {
    title: printifyProduct.title,
    description: printifyProduct.description || "",
    price: Math.round(variant.price * 100), // Convert to cents
    quantity: 999, // Printify is print-on-demand, unlimited inventory
    images: printifyProduct.images.map((img) => img.src),
    zone: zone as any,
    condition: "NEW" as any,
    shopId,
    externalProductId: printifyProduct.id.toString(),
    syncEnabled: true,
  };
}

