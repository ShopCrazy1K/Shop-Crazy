import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminOrders() {
  let orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: Date;
    user: {
      username: string | null;
      email: string;
    };
    items: Array<{
      product: {
        title: string;
      };
    }>;
  }> = [];
  try {
    orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          username: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limit to 100 most recent
  });
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Continue with empty array if database is unavailable
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-100";
      case "SHIPPED":
        return "text-blue-600 bg-blue-100";
      case "COMPLETED":
        return "text-purple-600 bg-purple-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div>
      <h1 className="font-accent text-3xl mb-6">Orders</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-center">Total</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{o.id.slice(0, 8)}...</td>
                  <td className="p-4">
                    {o.user.username || o.user.email}
                  </td>
                  <td className="p-4 text-center">{o.items.length}</td>
                  <td className="p-4 text-center font-bold">
                    ${(o.total / 100).toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

