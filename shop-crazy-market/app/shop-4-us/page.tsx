"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Shop4UsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/category/shop-4-us");
  }, [router]);

  return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Redirecting to Shop 4 Us...</p>
    </div>
  );
}

