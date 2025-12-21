# SQLite Migration Notes

## Changes Made

The schema has been converted from PostgreSQL to SQLite for easier development setup. Here are the key changes:

### 1. Enums → Strings
All enums have been converted to String fields with string values:

- `Role` enum → `String` with values `"USER"` or `"ADMIN"`
- `Zone` enum → `String` with values `"SHOP_4_US"`, `"GAME_ZONE"`, `"FRESH_OUT_WORLD"`
- `ProductCondition` enum → `String` with values `"NEW"` or `"USED"`
- `OrderStatus` enum → `String` with values `"PENDING"`, `"PAID"`, `"SHIPPED"`, `"COMPLETED"`, `"CANCELLED"`
- `PlatformType` enum → `String` with values `"SHOPIFY"` or `"PRINTIFY"`

### 2. Json → String
- `Order.metadata` changed from `Json?` to `String?` (store JSON as string)

### 3. String[] → String
- `Product.images` changed from `String[]` to `String` (store as JSON array string: `["url1", "url2"]`)

## Code Updates Needed

When using these fields in your code, use string values instead of enum values:

### Before (with enums):
```typescript
user.role === Role.USER
product.zone === Zone.GAME_ZONE
order.status === OrderStatus.PENDING
```

### After (with strings):
```typescript
user.role === "USER"
product.zone === "GAME_ZONE"
order.status === "PENDING"
```

### Images Array:
```typescript
// Store images
const images = ["url1", "url2", "url3"];
product.images = JSON.stringify(images);

// Retrieve images
const images = JSON.parse(product.images || "[]");
```

### Metadata JSON:
```typescript
// Store metadata
const metadata = { key: "value" };
order.metadata = JSON.stringify(metadata);

// Retrieve metadata
const metadata = JSON.parse(order.metadata || "{}");
```

## Database File

SQLite database is stored at: `./dev.db`

This file is automatically created and should be added to `.gitignore` (already included).

## Switching Back to PostgreSQL

If you want to switch back to PostgreSQL later:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Restore enum definitions:
```prisma
enum Role {
  USER
  ADMIN
}
// ... etc
```

3. Restore Json and String[] types:
```prisma
images      String[]
metadata    Json?
```

4. Update `.env` with PostgreSQL connection string
5. Run `npm run db:push`

## Benefits of SQLite

- ✅ No database server installation needed
- ✅ Perfect for development and testing
- ✅ Single file database (easy to backup/reset)
- ✅ Fast and lightweight
- ✅ Works offline

## Limitations

- ⚠️ Not suitable for production (use PostgreSQL)
- ⚠️ No concurrent writes (fine for development)
- ⚠️ No advanced features (enums, JSON, arrays)

For production, use PostgreSQL or another production-ready database.

