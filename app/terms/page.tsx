import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Navigation />
      
      <main className="pt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <p className="text-lg text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using ResizeSuite, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  ResizeSuite provides professional image processing tools including:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Image resizing and cropping</li>
                  <li>Format conversion and compression</li>
                  <li>Social media optimization</li>
                  <li>Batch processing capabilities</li>
                  <li>Watermarking and enhancement tools</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  All processing is performed locally in your browser to ensure privacy and security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-700 leading-relaxed">
                  To access certain features, you may need to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree not to use ResizeSuite for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Processing illegal or harmful content</li>
                  <li>Violating intellectual property rights</li>
                  <li>Attempting to reverse engineer our technology</li>
                  <li>Spamming or abusing our systems</li>
                  <li>Any activity that violates applicable laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Payment</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Plan</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our free plan provides basic image processing capabilities with reasonable usage limits.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Plan</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pro subscriptions are billed monthly or annually. You can cancel anytime from your account dashboard.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">30-Day Money-Back Guarantee</h3>
                    <p className="text-blue-700 leading-relaxed">
                      If you're not satisfied with our Pro features, contact us within 30 days for a full refund.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  ResizeSuite and its original content, features, and functionality are owned by ResizeSuite and are 
                  protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You retain all rights to your images and content. We do not claim ownership of any images you process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Modify or discontinue the service</li>
                  <li>Perform maintenance and updates</li>
                  <li>Suspend accounts for policy violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  ResizeSuite is provided "as is" without warranties. We are not liable for any indirect, incidental, 
                  or consequential damages arising from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes 
                  via email or service notifications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@resizesuite.com<br/>
                    <strong>Address:</strong> ResizeSuite Legal Team<br/>
                    [Your Company Address]
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
