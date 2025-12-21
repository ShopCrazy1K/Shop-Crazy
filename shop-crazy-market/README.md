# Shop Crazy Market

An Etsy-style marketplace with 90s Nickelodeon vibes and seasonal themes!

## Features

- 🎨 Seasonal theme switching (Winter, Summer, Fall)
- 🧸 Three shopping zones: Shop 4 Us, Game Zone, Fresh Out World
- 🎮 Dynamic fonts and colors based on the current season
- 🛒 Product pages with zone badges

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your database and Stripe:
   - Create a `.env` file in the root directory
   - Add your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/shop_crazy_market?schema=public"
   ```
   - Add your Stripe keys (get them from https://dashboard.stripe.com):
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."  # Get from Stripe webhook settings
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

3. Set up the database schema:
```bash
# Push the schema to your database
npm run db:push

# Or create a migration
npm run db:migrate
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Management

- View your database in Prisma Studio:
```bash
npm run db:studio
```

- Create a new migration:
```bash
npm run db:migrate
```

## Project Structure

```
shop-crazy-market/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout with fonts and providers
│   ├── page.tsx             # Home page
│   └── product/
│       └── [id]/
│           └── page.tsx     # Dynamic product pages
├── components/
│   ├── AddToCart.tsx        # Add to cart button
│   ├── Navbar.tsx           # Navigation bar
│   ├── ThemeProvider.tsx    # Seasonal theme provider
│   └── ZoneBadge.tsx        # Zone badge component
├── lib/
│   └── prisma.ts            # Prisma client singleton
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## Seasonal Themes

The app automatically switches themes based on the current month:

- **Winter (Dec-Feb)**: Baloo 2 font, cool blue gradient
- **Summer (Jun-Aug)**: Luckiest Guy font, warm yellow gradient  
- **Fall (Sep-Nov)**: Bungee font, orange gradient
- **Spring (Mar-May)**: Fredoka font, default gradient

## Tech Stack

- Next.js 14.1.0
- React 18.2.0
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- Stripe (Payment Processing)
- Google Fonts (Fredoka, Baloo 2, Luckiest Guy, Bungee, Inter)

## Database Schema

The app uses Prisma with PostgreSQL and includes:

- **Users** - User accounts with roles (USER, ADMIN)
- **Shops** - Seller storefronts (Etsy-style)
- **Products** - Items organized by zones (SHOP_4_US, GAME_ZONE, FRESH_OUT_WORLD)
- **Orders** - Order management with status tracking
- **Reviews** - Product and shop reviews
- **Favorites** - User favorite products
- **Messages** - Buyer-seller messaging system

