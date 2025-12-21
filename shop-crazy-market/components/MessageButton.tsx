import Link from "next/link";

export default function MessageButton({ userId }: { userId: string }) {
  return (
    <Link
      href={`/messages/${userId}`}
      className="inline-block mt-4 border border-purple-600 text-purple-600 px-5 py-2 rounded-xl font-semibold hover:bg-purple-50"
    >
      Message Seller
    </Link>
  );
}

