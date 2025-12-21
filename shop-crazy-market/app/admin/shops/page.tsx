import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminShops() {
  let shops: Array<{
    id: string;
    name: string;
    owner: {
      username: string | null;
      email: string;
    };
    _count: {
      products: number;
    };
  }> = [];
  try {
    shops = await prisma.shop.findMany({
    include: {
      owner: {
        select: {
          username: true,
          email: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  } catch (error) {
    console.error('Error fetching shops:', error);
    // Continue with empty array if database is unavailable
  }

  return (
    <div>
      <h1 className="font-accent text-3xl mb-6">Shops</h1>

      <div className="space-y-4">
        {shops.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
            No shops found
          </div>
        ) : (
          shops.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-xl shadow flex justify-between items-center hover:shadow-lg transition-shadow"
            >
              <div>
                <p className="font-bold text-lg">{s.name}</p>
                <p className="text-gray-500">
                  Owner: {s.owner.username || s.owner.email}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {s._count.products} product{s._count.products !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href={`/shop/${s.id}`}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  View
                </Link>
                <button className="text-red-600 font-bold hover:text-red-700 transition-colors">
                  Suspend
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

