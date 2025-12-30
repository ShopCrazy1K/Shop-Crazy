export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="font-accent text-4xl">Privacy Policy</h1>
      <p className="text-gray-600">Last updated: December 29, 2024</p>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">1. Introduction</h2>
          <p className="text-gray-700">
            Shop Crazy Market ("we", "us", or "our") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our online marketplace platform ("Platform").
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">2. Information We Collect</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-xl mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, username, password (hashed)</li>
                <li><strong>Profile Information:</strong> Profile photos, cover photos, bio, shop policies</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store full payment card details)</li>
                <li><strong>Listing Information:</strong> Product descriptions, images, prices, and other listing details</li>
                <li><strong>Communication:</strong> Messages sent through the Platform, reviews, and feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mt-4 mb-2">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, and navigation patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience</li>
                <li><strong>Location Data:</strong> General location information (city/region level) based on IP address</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">3. How We Use Your Information</h2>
          <div className="space-y-3 text-gray-700">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our Platform services</li>
              <li>Process transactions and facilitate payments</li>
              <li>Communicate with you about your account, orders, and Platform updates</li>
              <li>Send marketing communications (with your consent, which you can opt-out of)</li>
              <li>Detect, prevent, and address fraud, security, or technical issues</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
              <li>Personalize your experience and show relevant content</li>
              <li>Analyze usage patterns to improve our services</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">4. Information Sharing and Disclosure</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>4.1 With Sellers/Buyers:</strong> When you make a purchase, we share necessary 
              information (name, shipping address, contact info) with the seller to fulfill your order. 
              When you sell, we share your shop information with potential buyers.
            </p>
            <p>
              <strong>4.2 Service Providers:</strong> We share information with third-party service 
              providers who perform services on our behalf, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processing (Stripe)</li>
              <li>Email delivery services</li>
              <li>Cloud hosting and storage providers</li>
              <li>Analytics and monitoring services</li>
            </ul>
            <p>
              <strong>4.3 Legal Requirements:</strong> We may disclose information if required by law, 
              court order, or government regulation, or to protect our rights, property, or safety.
            </p>
            <p>
              <strong>4.4 Business Transfers:</strong> In the event of a merger, acquisition, or sale 
              of assets, your information may be transferred to the acquiring entity.
            </p>
            <p>
              <strong>4.5 With Your Consent:</strong> We may share information for any other purpose 
              with your explicit consent.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">5. Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate technical and organizational security measures to protect your 
            personal information against unauthorized access, alteration, disclosure, or destruction. 
            These measures include encryption, secure servers, access controls, and regular security 
            assessments. However, no method of transmission over the Internet or electronic storage 
            is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">6. Cookies and Tracking Technologies</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              We use cookies and similar tracking technologies to track activity on our Platform 
              and hold certain information. Cookies are files with a small amount of data that may 
              include an anonymous unique identifier.
            </p>
            <p>
              <strong>Types of cookies we use:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the Platform to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use the Platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is 
              being sent. However, if you do not accept cookies, you may not be able to use some 
              portions of our Platform.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">7. Your Privacy Rights</h2>
          <div className="space-y-3 text-gray-700">
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-Out:</strong> Opt-out of marketing communications</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@shopcrazymarket.com. We will 
              respond to your request within 30 days.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700">
            Our Platform is not intended for children under the age of 18. We do not knowingly 
            collect personal information from children under 18. If you are a parent or guardian 
            and believe your child has provided us with personal information, please contact us 
            immediately.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">9. Data Retention</h2>
          <p className="text-gray-700">
            We retain your personal information for as long as necessary to fulfill the purposes 
            outlined in this Privacy Policy, unless a longer retention period is required or 
            permitted by law. When you delete your account, we will delete or anonymize your 
            personal information, except where we are required to retain it for legal or business 
            purposes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">10. International Data Transfers</h2>
          <p className="text-gray-700">
            Your information may be transferred to and processed in countries other than your 
            country of residence. These countries may have data protection laws that differ from 
            those in your country. By using our Platform, you consent to the transfer of your 
            information to these countries.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">11. California Privacy Rights (CCPA)</h2>
          <p className="text-gray-700">
            If you are a California resident, you have additional rights under the California 
            Consumer Privacy Act (CCPA), including the right to know what personal information 
            we collect, the right to delete personal information, and the right to opt-out of 
            the sale of personal information. We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">12. European Privacy Rights (GDPR)</h2>
          <p className="text-gray-700">
            If you are located in the European Economic Area (EEA), you have additional rights 
            under the General Data Protection Regulation (GDPR), including the right to access, 
            rectify, erase, restrict processing, data portability, and object to processing. 
            Our legal basis for processing your information includes consent, contract performance, 
            legal obligations, and legitimate interests.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">13. Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date. 
            We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-2xl mt-6 mb-4">14. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy or our privacy practices, please 
            contact us at:
          </p>
          <div className="bg-purple-100 rounded-lg p-4 border-2 border-purple-300 mt-4">
            <p className="font-bold text-lg text-purple-900 mb-2">
              Email: privacy@shopcrazymarket.com
            </p>
            <p className="text-purple-800">
              For data protection inquiries, please include "Privacy Request" in the subject line.
            </p>
          </div>
        </section>

        <div className="bg-blue-100 rounded-lg p-4 border-2 border-blue-300 mt-6">
          <p className="text-sm text-blue-900">
            <strong>Your Privacy Matters:</strong> We are committed to protecting your privacy 
            and being transparent about how we collect and use your information. If you have 
            concerns or questions, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </main>
  );
}

