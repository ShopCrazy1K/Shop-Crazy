import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-5 border-b bg-white">
      <Link href="/" className="font-accent text-2xl text-purple-600">
        Shop Crazy Market
      </Link>
      <div className="flex gap-5 font-semibold">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/shop-4-us">Shop 4 Us</Link>
        <Link href="/game-zone">Game Zone</Link>
        <Link href="/fresh-out-world">Fresh Out World</Link>
        <Link href="/messages">Messages</Link>
        <Link href="/sell" className="text-pink-600">Sell</Link>
      </div>
    </nav>
  );
}

