export default function DMCAPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-accent text-4xl">DMCA Policy</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <p className="text-gray-700">
          Shop Crazy Market respects the intellectual property rights of others
          and expects sellers to do the same. We take copyright infringement seriously
          and have implemented a system to handle DMCA takedown requests.
        </p>

        <h2 className="font-bold text-2xl mt-6">Filing a DMCA Notice</h2>
        <p className="text-gray-700">
          If you believe your copyrighted work has been infringed, please email
          the following information to:
        </p>

        <div className="bg-purple-100 rounded-lg p-4 border-2 border-purple-300">
          <p className="font-bold text-lg text-purple-900">
            dmca@shopcrazymarket.com
          </p>
        </div>

        <h3 className="font-semibold text-xl mt-4">Required Information:</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Your full legal name and contact information</li>
          <li>Proof of copyright ownership (registration number, certificate, etc.)</li>
          <li>URL of the infringing listing(s)</li>
          <li>Description of the copyrighted work that has been infringed</li>
          <li>Good faith statement that the use is not authorized</li>
          <li>Statement that the information is accurate and you are authorized to act</li>
          <li>Electronic signature</li>
        </ul>

        <h2 className="font-bold text-2xl mt-6">Counter-Notice</h2>
        <p className="text-gray-700">
          Sellers may submit a counter-notice if they believe content was removed
          in error. Counter-notices must include:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Your full legal name and contact information</li>
          <li>Identification of the removed content</li>
          <li>Statement under penalty of perjury that content was removed by mistake</li>
          <li>Consent to jurisdiction in your location</li>
          <li>Electronic signature</li>
        </ul>

        <div className="bg-yellow-100 rounded-lg p-4 border-2 border-yellow-300 mt-6">
          <p className="text-sm text-yellow-900">
            <strong>Note:</strong> Filing a false DMCA notice or counter-notice
            may result in legal consequences. Please ensure all information is accurate.
          </p>
        </div>
      </div>
    </main>
  );
}

