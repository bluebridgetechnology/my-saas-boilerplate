import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      
      <main className="pt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <p className="text-lg text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed">
                  ResizeSuite is designed with privacy in mind. We collect minimal information necessary to provide our services:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li><strong>Account Information:</strong> Email address and password when you create an account</li>
                  <li><strong>Usage Data:</strong> Basic analytics about how you use our service (pages visited, features used)</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store payment details)</li>
                  <li><strong>Images:</strong> <strong>NEVER stored</strong> - all processing happens locally in your browser</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use your information only to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Provide and improve our image processing services</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send important service updates and notifications</li>
                  <li>Provide customer support</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Image Privacy & Security</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Your Images Are Never Uploaded</h3>
                  <p className="text-green-700 leading-relaxed">
                    All image processing happens locally in your browser using client-side JavaScript. 
                    Your images never leave your device and are never stored on our servers. This ensures 
                    complete privacy and security for your sensitive images.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, trade, or share your personal information with third parties except:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li><strong>Service Providers:</strong> Stripe for payment processing, Supabase for data storage</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Consent:</strong> When you explicitly give us permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>SSL/TLS encryption for all data transmission</li>
                  <li>Secure password hashing and storage</li>
                  <li>Regular security audits and updates</li>
                  <li>GDPR compliance and data protection measures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use essential cookies for functionality and optional analytics cookies to improve our service. 
                  You can control cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@resizesuite.com<br/>
                    <strong>Address:</strong> ResizeSuite Privacy Team<br/>
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
