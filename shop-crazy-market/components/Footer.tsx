import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-accent text-2xl text-white hover:text-purple-400 transition-colors">
              Shop Crazy Market
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Where the deals get crazy. Your one-stop marketplace for amazing products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="hover:text-purple-400 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-purple-400 transition-colors">
                  Sell on Shop Crazy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-purple-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/dmca" className="hover:text-purple-400 transition-colors">
                  DMCA Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/prohibited-items" className="hover:text-purple-400 transition-colors">
                  Prohibited Items
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Shop Crazy Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

