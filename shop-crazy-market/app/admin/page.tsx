import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ViewCount from "@/components/admin/ViewCount";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminDashboard() {
  // Fetch stats from database with error handling
  let userCount = 0;
  let shopCount = 0;
  let listingCount = 0;
  let activeListingCount = 0;
  let orderCount = 0;
  let paidOrderCount = 0;
  let totalRevenue = 0;

  try {
    [
      userCount,
      shopCount,
      listingCount,
      activeListingCount,
      orderCount,
      paidOrderCount,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.shop.count().catch(() => 0),
      prisma.listing.count().catch(() => 0),
      prisma.listing.count({ where: { isActive: true } }).catch(() => 0),
      prisma.order.count().catch(() => 0),
      prisma.order.count({ where: { paymentStatus: "paid" } }).catch(() => 0),
      prisma.order
        .aggregate({
          where: { paymentStatus: "paid" },
          _sum: { orderTotalCents: true },
        })
        .then((result) => result._sum.orderTotalCents || 0)
        .catch(() => 0),
    ]);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Continue with zero values if database is unavailable
  }

  const stats = [
    { label: "Total Users", value: userCount, link: "/admin/users" },
    { label: "Active Listings", value: activeListingCount, link: "/admin/listings" },
    { label: "Total Listings", value: listingCount, link: "/admin/listings" },
    { label: "Paid Orders", value: paidOrderCount, link: "/admin/transactions" },
    { label: "Total Orders", value: orderCount, link: "/admin/transactions" },
    { label: "Total Revenue", value: `$${(totalRevenue / 100).toFixed(2)}`, link: "/admin/revenue" },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.link}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow"
          >
            <p className="text-gray-500 text-sm mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* View Statistics Section */}
      <div className="mb-8">
        <ViewCount />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/users"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/listings"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Manage Listings
            </Link>
            <Link
              href="/admin/transactions"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Transactions
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Marketplace Settings
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-sm">
            View detailed activity in the respective sections:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• <Link href="/admin/orders" className="text-purple-600 hover:underline">Recent Orders</Link></li>
            <li>• <Link href="/admin/refunds" className="text-purple-600 hover:underline">Refund Requests</Link></li>
            <li>• <Link href="/admin/reports" className="text-purple-600 hover:underline">Copyright Reports</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

