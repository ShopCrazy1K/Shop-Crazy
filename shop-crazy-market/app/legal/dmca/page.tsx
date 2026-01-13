export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">DMCA Takedown Policy</h1>
      
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Digital Millennium Copyright Act (DMCA) Policy</h2>
          <p className="text-gray-700">
            Shop Crazy Market ("we", "us", or "our") respects the intellectual property rights of others
            and expects our users to do the same. In accordance with the Digital Millennium Copyright Act
            of 1998, the text of which may be found on the U.S. Copyright Office website at
            <a href="https://www.copyright.gov/legislation/dmca.pdf" className="text-blue-600 hover:underline ml-1">
              https://www.copyright.gov/legislation/dmca.pdf
            </a>, we will respond expeditiously to claims of copyright infringement committed using our
            service that are reported to our Designated Copyright Agent identified below.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Reporting Copyright Infringement</h2>
          <p className="text-gray-700 mb-4">
            If you are a copyright owner, or authorized to act on behalf of one, and you believe that
            the copyrighted work has been copied in a way that constitutes copyright infringement, please
            submit your claim via our DMCA complaint form or email to our Designated Copyright Agent with
            the following information:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner</li>
            <li>Identification of the copyrighted work claimed to have been infringed</li>
            <li>Identification of the material that is claimed to be infringing and information reasonably sufficient
              to permit us to locate the material</li>
            <li>Your contact information, including your address, telephone number, and email address</li>
            <li>A statement that you have a good faith belief that use of the material in the manner complained of
              is not authorized by the copyright owner, its agent, or the law</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury,
              that you are authorized to act on behalf of the copyright owner</li>
          </ol>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Counter-Notification</h2>
          <p className="text-gray-700 mb-4">
            If you believe that your content was removed in error, or that you have the right to post the
            content, you may send us a counter-notification. To be effective, your counter-notification must
            include:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>Your physical or electronic signature</li>
            <li>Identification of the material that has been removed and the location where it appeared before removal</li>
            <li>A statement under penalty of perjury that you have a good faith belief the material was removed
              or disabled as a result of mistake or misidentification</li>
            <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction
              of the Federal District Court for the judicial district in which your address is located</li>
          </ol>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Repeat Infringers</h2>
          <p className="text-gray-700">
            It is our policy to terminate, in appropriate circumstances, the accounts of users who are repeat
            infringers. We may also, at our sole discretion, limit access to our service and/or terminate the
            accounts of any users who infringe any intellectual property rights of others, whether or not there
            is any repeat infringement.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Designated Copyright Agent</h2>
          <p className="text-gray-700">
            Our Designated Copyright Agent to receive notifications of claimed infringement can be reached at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="text-gray-700">
              <strong>Copyright Agent</strong><br />
              Shop Crazy Market<br />
              Email: dmca@shopcrazymarket.com<br />
              Address: [Your Business Address]
            </p>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">False Claims</h2>
          <p className="text-gray-700">
            Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents
            that material or activity is infringing may be subject to liability. We reserve the right to seek
            damages from any party that submits a false notification of infringement.
          </p>
        </section>
      </div>
    </div>
  );
}
