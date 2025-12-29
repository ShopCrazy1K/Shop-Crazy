"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GameZonePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/category/game-zone");
  }, [router]);

  return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Redirecting to Game Zone...</p>
    </div>
  );
}

