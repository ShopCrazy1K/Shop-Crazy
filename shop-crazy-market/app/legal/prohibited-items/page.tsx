export default function ProhibitedItemsPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-accent text-4xl">Prohibited Items</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <p className="text-gray-700">
          To protect intellectual property rights and maintain a safe marketplace,
          the following items are strictly prohibited:
        </p>

        <h2 className="font-bold text-2xl mt-4">Copyright & Intellectual Property</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Counterfeit or replica goods</li>
          <li>Pirated software, ROMs, cracked games</li>
          <li>Unlicensed branded merchandise</li>
          <li>Bootlegs or copied designs</li>
          <li>Trademarked logos without authorization</li>
          <li>Unauthorized reproductions of copyrighted material</li>
          <li>Fan art or designs based on copyrighted characters without permission</li>
        </ul>

        <h2 className="font-bold text-2xl mt-6">Other Prohibited Items</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Illegal items or substances</li>
          <li>Weapons or dangerous items</li>
          <li>Stolen goods</li>
          <li>Items that violate platform policies</li>
        </ul>

        <div className="bg-red-100 rounded-lg p-4 border-2 border-red-300 mt-6">
          <p className="text-sm text-red-900">
            <strong>Warning:</strong> Sellers found listing prohibited items may
            receive strikes, have their listings removed, or face account suspension.
            Repeated violations may result in permanent ban.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Report Violations</h3>
          <p className="text-gray-700 mb-3">
            If you see a prohibited item, please report it using the "Report Copyright
            Violation" button on the product page.
          </p>
          <a
            href="/legal/dmca"
            className="text-purple-600 underline font-semibold"
          >
            Learn more about our DMCA policy →
          </a>
        </div>
      </div>
    </main>
  );
}

