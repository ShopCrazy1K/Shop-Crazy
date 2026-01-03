# Admin Setup Guide

## How to Login as Admin

### Step 1: Make Your Account Admin

You have three options to set your account as admin:

#### Option 1: Using the API Endpoint (Recommended for First Time)

1. Set a secret key in your `.env` file:
   ```
   ADMIN_PROMOTE_SECRET=your-secret-key-here
   ```

2. Make a POST request to promote yourself:
   ```bash
   curl -X POST http://localhost:3000/api/admin/promote \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-email@example.com",
       "secretKey": "your-secret-key-here"
     }'
   ```

   Or use this in your browser console (on your app):
   ```javascript
   fetch('/api/admin/promote', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'your-email@example.com',
       secretKey: 'your-secret-key-here'
     })
   }).then(r => r.json()).then(console.log)
   ```

#### Option 2: Using Prisma Studio (Easiest)

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navigate to the `User` table
3. Find your user by email
4. Click on your user record
5. Change the `role` field from `USER` to `ADMIN`
6. Click "Save 1 change"

#### Option 3: Using SQL (Direct Database)

If you have direct database access:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or using Prisma CLI:
```bash
npx prisma db execute --stdin <<< "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your-email@example.com';"
```

### Step 2: Login Normally

1. Go to your app's login page (`/login`)
2. Login with your email and password (the same credentials you always use)
3. After login, navigate to `/admin`
4. You should now see the admin panel!

### Step 3: Access Admin Features

Once logged in as admin, you can access:

- **Dashboard**: `/admin` - Overview of your marketplace
- **Users**: `/admin/users` - Manage all users
- **Listings**: `/admin/listings` - Manage all listings
- **Transactions**: `/admin/transactions` - View all orders
- **Settings**: `/admin/settings` - Configure marketplace

## Security Notes

⚠️ **Important**: After setting up your first admin account, you should:

1. **Remove or protect the promote endpoint** - The `/api/admin/promote` endpoint is for initial setup only
2. **Change the secret key** - Use a strong, random secret key
3. **Use the admin interface** - Once you have admin access, you can promote other users through the admin interface (if you add that feature)

## Troubleshooting

**Can't access `/admin`?**
- Make sure your user's `role` field is set to `"ADMIN"` (not `"USER"`)
- Try logging out and logging back in
- Clear your browser's localStorage: `localStorage.removeItem('user')` then login again

**Getting "Admin access required" error?**
- Your account might not be set to ADMIN role
- Check your user record in the database
- Make sure you're logged in with the correct account

## Making Other Users Admin

Once you have admin access, you can manually update other users through:
- Prisma Studio
- Direct database access
- Or add a "Promote to Admin" button in the admin users page

