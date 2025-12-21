# Supabase Client Setup

## ✅ What's Been Set Up

- ✅ Installed `@supabase/supabase-js` package
- ✅ Created `lib/supabase.ts` with client configuration
- ✅ Added environment variable documentation

## 🔑 Get Your Supabase Keys

### Step 1: Go to Supabase API Settings

**Direct Link:**
https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api

### Step 2: Copy Your Keys

On the API settings page, you'll see:

1. **Project URL** (already set: `https://hbufjpxdzmygjnbfsniu.supabase.co`)
2. **Project API keys** section with:
   - **anon** `public` - Safe for browser/client-side use
   - **service_role** - Server-side only (admin access)

### Step 3: Add to Environment Variables

#### For Vercel:

1. Go to: https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://hbufjpxdzmygjnbfsniu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)
```

**Optional (server-side only):**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service_role key)
```

3. Select environments: **Production**, **Preview**, **Development**

4. Click **"Save"**

#### For Local Development:

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hbufjpxdzmygjnbfsniu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📖 Usage Examples

### Client-Side Usage (React Components)

```typescript
'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(10)

      if (error) {
        console.error('Error:', error)
      } else {
        setData(data)
      }
    }

    fetchData()
  }, [])

  return <div>{/* Your component */}</div>
}
```

### Server-Side Usage (API Routes)

```typescript
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### Authentication Example

```typescript
import { supabase } from '@/lib/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Storage Example

```typescript
import { supabase } from '@/lib/supabase'

// Upload file
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('my-image.jpg', file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl('my-image.jpg')
```

### Real-time Subscriptions

```typescript
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

useEffect(() => {
  const channel = supabase
    .channel('products')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'products' },
      (payload) => {
        console.log('New product:', payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## 🔒 Security Notes

1. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Safe to expose in browser
   - Uses Row Level Security (RLS) policies
   - Limited permissions based on user authentication

2. **`SUPABASE_SERVICE_ROLE_KEY`** - ⚠️ **NEVER expose in browser!**
   - Bypasses RLS policies
   - Full admin access
   - Only use in server-side code (API routes, server components)

3. **Row Level Security (RLS)**
   - Enable RLS on your Supabase tables
   - Create policies to control access
   - See: https://supabase.com/docs/guides/auth/row-level-security

## 🎯 Common Use Cases

### 1. Replace Prisma with Supabase (Optional)

If you want to use Supabase's built-in database client instead of Prisma:

```typescript
// Instead of Prisma
const products = await prisma.product.findMany()

// Use Supabase
const { data: products } = await supabase
  .from('products')
  .select('*')
```

### 2. File Storage

Use Supabase Storage for product images:

```typescript
// Upload
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${productId}/${filename}`, file)

// Get URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(`${productId}/${filename}`)
```

### 3. Real-time Updates

Listen for real-time changes:

```typescript
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'orders' },
    (payload) => {
      // Update UI when order status changes
    }
  )
  .subscribe()
```

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **JavaScript Client:** https://supabase.com/docs/reference/javascript/introduction
- **Auth Guide:** https://supabase.com/docs/guides/auth
- **Storage Guide:** https://supabase.com/docs/guides/storage
- **Realtime Guide:** https://supabase.com/docs/guides/realtime

## ✅ Checklist

- [ ] Get Supabase anon key from dashboard
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] (Optional) Add `SUPABASE_SERVICE_ROLE_KEY` for server-side
- [ ] Test client connection
- [ ] Enable RLS on Supabase tables (if using)
- [ ] Create storage buckets (if using file storage)

