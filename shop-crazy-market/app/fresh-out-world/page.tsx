"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FreshOutWorldPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/category/fresh-out-world");
  }, [router]);

  return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Redirecting to Fresh Out World...</p>
    </div>
  );
}

