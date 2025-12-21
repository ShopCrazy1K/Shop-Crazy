import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminProducts() {
  let products = [];
  try {
    products = await prisma.product.findMany({
    include: {
      shop: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limit to 100 most recent
  });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Continue with empty array if database is unavailable
  }

  return (
    <div>
      <h1 className="font-accent text-3xl mb-6">Products</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Shop</th>
              <th className="p-4 text-center">Zone</th>
              <th className="p-4 text-center">Price</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link
                      href={`/product/${p.id}`}
                      className="text-purple-600 hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-4">{p.shop.name}</td>
                  <td className="p-4 text-center">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {p.zone.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-center">${(p.price / 100).toFixed(2)}</td>
                  <td className="p-4 text-center">{p.quantity}</td>
                  <td className="p-4 text-center">
                    <button className="text-red-600 font-bold hover:text-red-700 transition-colors">
                      Remove
                    </button>
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

