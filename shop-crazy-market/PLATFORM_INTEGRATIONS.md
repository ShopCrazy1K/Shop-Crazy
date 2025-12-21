# 🔌 Platform Integrations Documentation

## Overview

Shop Crazy Market supports integrations with e-commerce platforms and marketplace plugins:
- **Shopify** - Sync products from Shopify stores
- **Printify** - Connect print-on-demand products

## Features

### Shopify Integration
- **Product Sync**: Automatically sync products from Shopify store
- **Inventory Management**: Real-time inventory updates
- **Price Sync**: Keep prices synchronized
- **Image Sync**: Import product images

### Printify Integration
- **Print-on-Demand**: Connect POD products
- **Product Catalog**: Sync entire product catalog
- **Automatic Fulfillment**: Orders automatically fulfilled by Printify
- **Unlimited Inventory**: Printify products show as unlimited stock

## Setup

### Shopify Setup

1. **Create Shopify App**:
   - Go to Shopify Partners dashboard
   - Create a new app
   - Configure OAuth scopes: `read_products`, `write_products`, `read_inventory`

2. **Get Access Token**:
   - Install app on your store
   - Get Admin API access token
   - Store name: `your-store` (from `your-store.myshopify.com`)

3. **Connect in Dashboard**:
   - Go to `/seller/platforms`
   - Click "Connect Platform"
   - Select Shopify
   - Enter store name and access token

### Printify Setup

1. **Create Printify App**:
   - Go to Printify Developer Portal
   - Create new app
   - Get API access token

2. **Get Shop ID**:
   - Log into Printify
   - Find your shop ID in settings

3. **Connect in Dashboard**:
   - Go to `/seller/platforms`
   - Click "Connect Platform"
   - Select Printify
   - Enter shop ID and access token

## API Endpoints

### Connect Platform
```
POST /api/platforms/connect
Body: {
  shopId: string,
  platform: "SHOPIFY" | "PRINTIFY",
  accessToken: string,
  storeName: string,
  storeUrl?: string
}
```

### Get Connections
```
GET /api/platforms/connect?shopId={shopId}
```

### Sync Products
```
POST /api/platforms/{platformId}/sync
Body: {
  zone?: "SHOP_4_US" | "GAME_ZONE" | "FRESH_OUT_WORLD"
}
```

### Disconnect Platform
```
DELETE /api/platforms/{platformId}/disconnect
```

## Product Sync

### How It Works

1. **Initial Sync**: Fetches all products from connected platform
2. **Product Mapping**: Maps platform products to Shop Crazy Market format
3. **Zone Assignment**: Assigns products to shopping zones
4. **Inventory Sync**: Updates quantities (Shopify) or sets unlimited (Printify)
5. **Update Detection**: Updates existing products, creates new ones

### Sync Behavior

- **New Products**: Created with `syncEnabled: true`
- **Existing Products**: Updated if `externalProductId` matches
- **Inventory**: Synced from platform (Shopify) or unlimited (Printify)
- **Prices**: Converted to cents, synced from platform

### Manual Sync

Sellers can trigger manual sync from the platforms dashboard:
- Click "Sync Now" button
- Products sync in background
- Shows sync status and results

## Database Schema

### PlatformConnection Model
```prisma
model PlatformConnection {
  id          String
  shopId      String
  platform    PlatformType  // SHOPIFY | PRINTIFY
  accessToken String        // Encrypted in production
  storeName   String?
  storeUrl    String?
  isActive    Boolean
  syncEnabled Boolean
  products    Product[]
}
```

### Product Updates
- `platformConnectionId` - Links product to platform
- `externalProductId` - Platform's product ID
- `syncEnabled` - Whether to sync this product
- `lastSyncedAt` - Last sync timestamp

## Security

### Access Token Storage
- **Current**: Stored as plain text (development)
- **Production**: Should be encrypted
- **Recommendation**: Use encryption library or secure vault

### API Rate Limits
- **Shopify**: 2 requests/second (leaky bucket)
- **Printify**: Varies by plan
- **Implementation**: Add rate limiting and retry logic

## Webhooks (Future)

### Shopify Webhooks
- `products/create` - New product created
- `products/update` - Product updated
- `inventory_levels/update` - Inventory changed

### Printify Webhooks
- `product:created` - New product
- `product:updated` - Product updated
- `order:created` - New order (for fulfillment)

## Usage Examples

### Connect Shopify Store
```typescript
const response = await fetch("/api/platforms/connect", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    shopId: "shop_123",
    platform: "SHOPIFY",
    accessToken: "shpat_...",
    storeName: "my-store",
  }),
});
```

### Sync Products
```typescript
const response = await fetch(`/api/platforms/${platformId}/sync`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    zone: "SHOP_4_US",
  }),
});
```

## Troubleshooting

### Sync Fails
- Check access token is valid
- Verify store name/shop ID is correct
- Check API rate limits
- Review error logs

### Products Not Syncing
- Verify `syncEnabled` is true
- Check platform connection is active
- Ensure products exist on platform
- Review sync logs

### Inventory Not Updating
- Shopify: Check inventory tracking is enabled
- Printify: Always shows as unlimited
- Verify webhook setup (if using)

## Future Enhancements

1. **Automatic Sync**: Scheduled syncs (hourly/daily)
2. **Webhook Support**: Real-time updates
3. **Bidirectional Sync**: Update platform from marketplace
4. **More Platforms**: WooCommerce, Etsy, Amazon
5. **Bulk Operations**: Sync selected products only
6. **Sync History**: Track sync history and errors
7. **Product Mapping**: Custom field mapping

