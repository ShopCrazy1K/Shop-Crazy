// Shopify API integration utilities

interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  variants: Array<{
    id: string;
    price: string;
    inventory_quantity: number;
  }>;
  images: Array<{
    src: string;
  }>;
}

interface ShopifyConfig {
  accessToken: string;
  storeName: string;
}

export class ShopifyClient {
  private accessToken: string;
  private storeName: string;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.accessToken = config.accessToken;
    this.storeName = config.storeName;
    this.baseUrl = `https://${this.storeName}.myshopify.com/admin/api/2024-01`;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(limit = 50): Promise<ShopifyProduct[]> {
    const response = await this.request(`/products.json?limit=${limit}`);
    return response.products || [];
  }

  async getProduct(productId: string): Promise<ShopifyProduct> {
    const response = await this.request(`/products/${productId}.json`);
    return response.product;
  }

  async updateProductInventory(productId: string, variantId: string, quantity: number) {
    return this.request(`/variants/${variantId}.json`, {
      method: "PUT",
      body: JSON.stringify({
        variant: {
          inventory_quantity: quantity,
        },
      }),
    });
  }

  async createWebhook(topic: string, address: string) {
    return this.request("/webhooks.json", {
      method: "POST",
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: "json",
        },
      }),
    });
  }
}

/**
 * Convert Shopify product to our Product format
 */
export function convertShopifyProduct(
  shopifyProduct: ShopifyProduct,
  shopId: string,
  zone: string = "SHOP_4_US"
) {
  const variant = shopifyProduct.variants[0];
  const image = shopifyProduct.images[0]?.src || "";

  return {
    title: shopifyProduct.title,
    description: shopifyProduct.body_html || "",
    price: Math.round(parseFloat(variant.price) * 100), // Convert to cents
    quantity: variant.inventory_quantity || 0,
    images: shopifyProduct.images.map((img) => img.src),
    zone: zone as any,
    condition: "NEW" as any,
    shopId,
    externalProductId: shopifyProduct.id.toString(),
    syncEnabled: true,
  };
}

