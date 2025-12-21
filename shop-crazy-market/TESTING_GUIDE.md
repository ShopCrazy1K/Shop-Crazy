# 🧪 Testing Guide - Shop Crazy Market

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env` file:
```env
# Database (use local PostgreSQL or Supabase)
DATABASE_URL="postgresql://user:password@localhost:5432/shop_crazy_market?schema=public"

# Stripe (use test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Set Up Database
```bash
# Push schema to database
npm run db:push

# Or create migration
npm run db:migrate

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Testing Checklist

### ✅ Home Page
- [ ] Home page loads with hero section
- [ ] Zone cards display correctly
- [ ] Seasonal theme applies (check background color)
- [ ] Bottom navigation appears

### ✅ Marketplace
- [ ] Navigate to `/marketplace`
- [ ] Products display in grid
- [ ] Product cards show images, titles, prices
- [ ] Zone badges display correctly

### ✅ Product Pages
- [ ] Navigate to `/product/[id]`
- [ ] Product details display
- [ ] Zone badge shows
- [ ] Add to Cart button works
- [ ] Message Seller button appears

### ✅ Cart & Checkout
- [ ] Navigate to `/cart`
- [ ] Cart items display
- [ ] Checkout button works
- [ ] Stripe checkout redirects (test mode)

### ✅ Messages
- [ ] Navigate to `/messages`
- [ ] Conversations list displays
- [ ] Navigate to `/messages/[userId]`
- [ ] Message input works
- [ ] Send button works

### ✅ Seller Dashboard
- [ ] Navigate to `/seller/dashboard`
- [ ] Fee summary displays
- [ ] Advertising toggle works
- [ ] Recent fees show

### ✅ Platform Integrations
- [ ] Navigate to `/seller/platforms`
- [ ] Connect platform modal works
- [ ] Can enter Shopify/Printify credentials
- [ ] Platform connections list displays

### ✅ Admin Dashboard
- [ ] Navigate to `/admin`
- [ ] Stats display correctly
- [ ] Products page loads
- [ ] Shops page loads
- [ ] Orders page loads
- [ ] Revenue dashboard loads
- [ ] Refunds page loads
- [ ] Fees page loads

### ✅ API Endpoints

#### Products
```bash
curl http://localhost:3000/api/products
```

#### Messages
```bash
curl "http://localhost:3000/api/messages?userId=u1"
```

#### Checkout
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"name": "Test Product", "price": 10000, "quantity": 1}
    ],
    "shippingTotal": 599,
    "country": "US",
    "hasAdvertising": false
  }'
```

#### Platform Connect
```bash
curl -X POST http://localhost:3000/api/platforms/connect \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "shop_123",
    "platform": "SHOPIFY",
    "accessToken": "test_token",
    "storeName": "test-store"
  }'
```

## Common Issues

### Database Connection Error
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify database exists

### Stripe Errors
- Use test keys (sk_test_...)
- Check webhook secret is set
- Verify Stripe account is in test mode

### TypeScript Errors
- Run `npx tsc --noEmit` to check
- Ensure all imports are correct
- Check Prisma client is generated

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Regenerate Prisma: `npx prisma generate`

## Browser Testing

### Desktop
- Chrome/Edge
- Firefox
- Safari

### Mobile
- Test responsive design
- Bottom navigation works
- Touch interactions work
- Forms are usable

## Performance Testing

### Lighthouse Scores
- Run Lighthouse audit
- Target: 90+ Performance
- Target: 90+ Accessibility
- Target: 90+ Best Practices

### Load Testing
- Test with multiple products
- Test with many orders
- Check database query performance

## Security Testing

- [ ] API endpoints require authentication (when implemented)
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (add when needed)
- [ ] Rate limiting (add for production)

## Next Steps After Testing

1. Fix any bugs found
2. Add missing features
3. Improve error handling
4. Add loading states
5. Optimize performance
6. Add authentication
7. Deploy to production

