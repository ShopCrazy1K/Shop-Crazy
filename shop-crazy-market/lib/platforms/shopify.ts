// Shopify API integration utilities
import { decrypt } from "@/lib/encryption";

interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  variants: Array<{
    id: string;
    price: string;
    inventory_quantity: number;
    sku?: string;
  }>;
  images: Array<{
    src: string;
    alt?: string;
  }>;
  tags?: string;
  vendor?: string;
  product_type?: string;
  status?: string;
}

interface ShopifyConfig {
  accessToken: string; // Can be encrypted or plain
  storeName: string;
}

export class ShopifyClient {
  private accessToken: string;
  private storeName: string;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    // Decrypt token if it's encrypted
    this.accessToken = decrypt(config.accessToken);
    this.storeName = config.storeName.includes('.') 
      ? config.storeName.split('.')[0] 
      : config.storeName;
    this.baseUrl = `https://${this.storeName}.myshopify.com/admin/api/2024-01`;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Shopify API request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Shopify API error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors) {
          if (typeof errorJson.errors === 'string') {
            errorMessage = errorJson.errors;
          } else if (Array.isArray(errorJson.errors)) {
            errorMessage = errorJson.errors.join(', ');
          } else if (errorJson.errors.message) {
            errorMessage = errorJson.errors.message;
          } else {
            errorMessage = JSON.stringify(errorJson.errors);
          }
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText.substring(0, 500);
        }
      }
      console.error(`Shopify API error: ${errorMessage}`, {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        url,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // Store headers for pagination
    (data as any).headers = response.headers;
    return data;
  }

  async getProducts(limit = 250): Promise<ShopifyProduct[]> {
    // Shopify allows up to 250 products per request
    const allProducts: ShopifyProduct[] = [];
    let pageInfo: string | null = null;
    let hasNextPage = true;

    while (hasNextPage && allProducts.length < limit) {
      let url = `/products.json?limit=${Math.min(250, limit - allProducts.length)}`;
      if (pageInfo) {
        url += `&page_info=${pageInfo}`;
      }

      const response = await this.request(url);
      const products = response.products || [];
      allProducts.push(...products);

      // Check for pagination
      const linkHeader = response.headers?.get?.('link') || '';
      const nextMatch = linkHeader.match(/<[^>]+page_info=([^>]+)>; rel="next"/);
      pageInfo = nextMatch ? nextMatch[1] : null;
      hasNextPage = !!pageInfo && allProducts.length < limit;
    }

    return allProducts.slice(0, limit);
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
 * Convert Shopify product to our Listing format
 */
export function convertShopifyProduct(
  shopifyProduct: ShopifyProduct,
  shopId: string,
  zone: string = "SHOP_4_US"
) {
  const variant = shopifyProduct.variants[0] || { price: "0", inventory_quantity: 0 };
  const images = shopifyProduct.images.map((img) => img.src);
  const tags = shopifyProduct.tags ? shopifyProduct.tags.split(',').map(t => t.trim()) : [];

  return {
    title: shopifyProduct.title,
    description: shopifyProduct.body_html || "",
    priceCents: Math.round(parseFloat(variant.price) * 100), // Convert to cents
    quantity: variant.inventory_quantity || 0,
    images: images,
    thumbnails: images.slice(0, 10), // First 10 images as thumbnails
    tags: tags,
    brand: shopifyProduct.vendor || undefined,
    category: shopifyProduct.product_type || undefined,
    sku: variant.sku || undefined,
    shopId,
    externalProductId: shopifyProduct.id.toString(),
    syncEnabled: true,
    isDraft: shopifyProduct.status === 'draft',
  };
}

