import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminDashboard() {
  // Fetch stats from database with error handling
  let userCount = 0;
  let shopCount = 0;
  let productCount = 0;
  let orderCount = 0;

  try {
    [userCount, shopCount, productCount, orderCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.shop.count().catch(() => 0),
      prisma.product.count().catch(() => 0),
      prisma.order.count().catch(() => 0),
    ]);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Continue with zero values if database is unavailable
  }

  const stats = [
    { label: "Users", value: userCount },
    { label: "Shops", value: shopCount },
    { label: "Products", value: productCount },
    { label: "Orders", value: orderCount },
  ];

  return (
    <div>
      <h1 className="font-accent text-4xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-xl shadow text-center"
          >
            <p className="text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

