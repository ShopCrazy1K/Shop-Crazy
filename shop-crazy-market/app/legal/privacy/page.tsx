export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none space-y-6">
        <section>
          <p className="text-gray-700">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            Shop Crazy Market ("we", "us", or "our") operates the Shop Crazy Market website and service
            (the "Service"). This page informs you of our policies regarding the collection, use, and
            disclosure of personal data when you use our Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Information Collection and Use</h2>
          <p className="text-gray-700 mb-4">
            We collect several different types of information for various purposes to provide and improve
            our Service to you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li><strong>Personal Data:</strong> Email address, name, phone number, address, and other information you provide</li>
            <li><strong>Usage Data:</strong> Information on how you access and use the Service</li>
            <li><strong>Cookies Data:</strong> Small files stored on your device to enhance your experience</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Use of Data</h2>
          <p className="text-gray-700 mb-4">We use the collected data for various purposes:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-gray-700">
            The security of your data is important to us, but remember that no method of transmission
            over the Internet or method of electronic storage is 100% secure. While we strive to use
            commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute
            security.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Service Providers</h2>
          <p className="text-gray-700">
            We may employ third party companies and individuals to facilitate our Service, provide the
            Service on our behalf, perform Service-related services, or assist us in analyzing how our
            Service is used. These third parties have access to your Personal Data only to perform these
            tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Links to Other Sites</h2>
          <p className="text-gray-700">
            Our Service may contain links to other sites that are not operated by us. If you click on
            a third party link, you will be directed to that third party's site. We strongly advise you
            to review the Privacy Policy of every site you visit.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="text-gray-700">
            Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly
            collect personally identifiable information from anyone under the age of 18. If you are a
            parent or guardian and you are aware that your Children has provided us with Personal Data,
            please contact us.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at privacy@shopcrazymarket.com
          </p>
        </section>
      </div>
    </div>
  );
}
