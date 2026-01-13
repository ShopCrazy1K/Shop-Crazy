export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose max-w-none space-y-6">
        <section>
          <p className="text-gray-700">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            Please read these Terms of Service ("Terms") carefully before using Shop Crazy Market
            ("the Service") operated by Shop Crazy Market ("us", "we", or "our").
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="text-gray-700">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree
            with any part of these terms, then you may not access the Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Use License</h2>
          <p className="text-gray-700">
            Permission is granted to temporarily access the materials on Shop Crazy Market's website
            for personal, non-commercial transitory viewing only. This is the grant of a license, not
            a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on Shop Crazy Market's website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <p className="text-gray-700">
            When you create an account with us, you must provide information that is accurate, complete,
            and current at all times. You are responsible for safeguarding the password and for all activities
            that occur under your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
          <p className="text-gray-700 mb-4">You may not use our Service:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material</li>
            <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
            <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="text-gray-700">
            The Service and its original content, features, and functionality are and will remain the
            exclusive property of Shop Crazy Market and its licensors. The Service is protected by
            copyright, trademark, and other laws. Our trademarks may not be used in connection with
            any product or service without our prior written consent.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Copyright Policy</h2>
          <p className="text-gray-700">
            We respect the intellectual property rights of others. It is our policy to respond to any
            claim that content posted on the Service infringes on the copyright or other intellectual
            property rights of any person. Please see our{" "}
            <a href="/legal/dmca" className="text-blue-600 hover:underline">DMCA Policy</a> for more information.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="text-gray-700">
            We may terminate or suspend your account and bar access to the Service immediately, without
            prior notice or liability, under our sole discretion, for any reason whatsoever and without
            limitation, including but not limited to a breach of the Terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <p className="text-gray-700">
            The information on this Service is provided on an "as is" basis. To the fullest extent
            permitted by law, this Company excludes all representations, warranties, conditions, and
            terms relating to our website and the use of this website.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-gray-700">
            In no event shall Shop Crazy Market, nor its directors, employees, partners, agents,
            suppliers, or affiliates, be liable for any indirect, incidental, special, consequential,
            or punitive damages, including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your use of the Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="text-gray-700">
            These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without
            regard to its conflict of law provisions.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            If a revision is material, we will provide at least 30 days notice prior to any new terms
            taking effect.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms, please contact us at legal@shopcrazymarket.com
          </p>
        </section>
      </div>
    </div>
  );
}
