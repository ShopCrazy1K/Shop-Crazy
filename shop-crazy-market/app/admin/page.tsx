import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  // Fetch stats from database
  const [userCount, shopCount, productCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

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

