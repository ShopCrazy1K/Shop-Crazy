import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-black text-white p-6 space-y-6">
        <h1 className="font-accent text-2xl">Admin Panel</h1>

        <nav className="space-y-3">
          <Link href="/admin" className="block hover:text-green-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/products" className="block hover:text-green-400 transition-colors">
            Products
          </Link>
          <Link href="/admin/shops" className="block hover:text-green-400 transition-colors">
            Shops
          </Link>
          <Link href="/admin/orders" className="block hover:text-green-400 transition-colors">
            Orders
          </Link>
          <Link href="/admin/revenue" className="block hover:text-green-400 transition-colors">
            Revenue
          </Link>
          <Link href="/admin/refunds" className="block hover:text-green-400 transition-colors">
            Refunds & Disputes
          </Link>
          <Link href="/admin/fees" className="block hover:text-green-400 transition-colors">
            Fees
          </Link>
          <Link href="/admin/reports" className="block hover:text-green-400 transition-colors">
            Copyright Reports
          </Link>
          <Link href="/" className="block text-red-400 hover:text-red-300 transition-colors">
            Exit Admin
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

