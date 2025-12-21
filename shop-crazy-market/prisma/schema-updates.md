# Prisma Schema Updates Needed

Add these fields to your existing schema:

## Shop Model Updates
```prisma
model Shop {
  // ... existing fields
  stripeAccountId     String?
  hasAdvertising      Boolean  @default(false)  // Opt-in for 15% advertising fee
  lastListingFeeDate  DateTime?  // Track when listing fees were last charged
}
```

## Order Model Updates
```prisma
model Order {
  // ... existing fields
  paymentIntentId     String?
  stripeSessionId     String?
  metadata            Json?  // Store fee breakdown, country, etc.
  
  // Fee tracking
  transactionFee      Int?
  paymentProcessingFee Int?
  advertisingFee      Int?
  sellerPayout       Int?
}
```

## New Models to Add

```prisma
// Monthly listing fee tracking
model ListingFee {
  id          String   @id @default(uuid())
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  amount      Int      // In cents ($0.20 = 20)
  month       Int      // 1-12
  year        Int
  paid        Boolean  @default(false)
  paidAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  @@unique([shopId, productId, month, year])
}

// Fee transaction log
model FeeTransaction {
  id          String   @id @default(uuid())
  orderId     String?
  order       Order?   @relation(fields: [orderId], references: [id])
  shopId      String?
  shop        Shop?    @relation(fields: [shopId], references: [id])
  
  type        String   // "transaction", "payment_processing", "advertising", "listing"
  amount      Int      // In cents
  description String?
  
  createdAt   DateTime @default(now())
}
```

