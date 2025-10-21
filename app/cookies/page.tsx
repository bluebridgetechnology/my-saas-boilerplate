import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy - ResizeSuite',
  description: 'Learn about how ResizeSuite uses cookies, what types of cookies we use, and how you can manage your cookie preferences.',
  robots: 'index, follow',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              This Cookie Policy explains how ResizeSuite uses cookies and similar technologies when you visit our website. 
              By using our website, you consent to the use of cookies as described in this policy.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              <p className="text-blue-800 font-medium">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <nav className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
              <ul className="space-y-2">
                <li><a href="#what-are-cookies" className="text-blue-600 hover:text-blue-800">1. What Are Cookies?</a></li>
                <li><a href="#types-of-cookies" className="text-blue-600 hover:text-blue-800">2. Types of Cookies We Use</a></li>
                <li><a href="#essential-cookies" className="text-blue-600 hover:text-blue-800">3. Essential Cookies</a></li>
                <li><a href="#analytics-cookies" className="text-blue-600 hover:text-blue-800">4. Analytics Cookies</a></li>
                <li><a href="#advertising-cookies" className="text-blue-600 hover:text-blue-800">5. Advertising Cookies</a></li>
                <li><a href="#third-party-cookies" className="text-blue-600 hover:text-blue-800">6. Third-Party Cookies</a></li>
                <li><a href="#cookie-management" className="text-blue-600 hover:text-blue-800">7. Managing Your Cookie Preferences</a></li>
                <li><a href="#browser-settings" className="text-blue-600 hover:text-blue-800">8. Browser Cookie Settings</a></li>
                <li><a href="#updates" className="text-blue-600 hover:text-blue-800">9. Updates to This Policy</a></li>
              </ul>
            </nav>

            <section id="what-are-cookies" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. 
                They help websites remember information about your visit, such as your preferred language and other settings.
              </p>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-800 font-medium">
                  <strong>Important:</strong> Cookies cannot access your personal files or harm your device. 
                  They are simply text files that help improve your browsing experience.
                </p>
              </div>
            </section>

            <section id="types-of-cookies" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
              <p className="text-gray-700 mb-4">We use different types of cookies for various purposes:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Session Cookies</h4>
                  <p className="text-blue-800 text-sm">Temporary cookies that expire when you close your browser.</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Persistent Cookies</h4>
                  <p className="text-green-800 text-sm">Cookies that remain on your device for a set period or until you delete them.</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">First-Party Cookies</h4>
                  <p className="text-purple-800 text-sm">Cookies set directly by ResizeSuite on our domain.</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Third-Party Cookies</h4>
                  <p className="text-orange-800 text-sm">Cookies set by other domains (like Google Analytics).</p>
                </div>
              </div>
            </section>

            <section id="essential-cookies" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">3. Essential Cookies</h2>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the website to function properly and cannot be disabled:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Cookie Name</th>
                      <th className="border border-gray-300 p-3 text-left">Purpose</th>
                      <th className="border border-gray-300 p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">session_id</td>
                      <td className="border border-gray-300 p-3">Maintains your session while using our tools</td>
                      <td className="border border-gray-300 p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">auth_token</td>
                      <td className="border border-gray-300 p-3">Keeps you logged in securely</td>
                      <td className="border border-gray-300 p-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">csrf_token</td>
                      <td className="border border-gray-300 p-3">Protects against cross-site request forgery</td>
                      <td className="border border-gray-300 p-3">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="analytics-cookies" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">4. Analytics Cookies</h2>
              <p className="text-gray-700 mb-4">
                These cookies help us understand how visitors interact with our website:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Cookie Name</th>
                      <th className="border border-gray-300 p-3 text-left">Purpose</th>
                      <th className="border border-gray-300 p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">_ga</td>
                      <td className="border border-gray-300 p-3">Google Analytics - distinguishes users</td>
                      <td className="border border-gray-300 p-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">_ga_[ID]</td>
                      <td className="border border-gray-300 p-3">Google Analytics - stores session state</td>
                      <td className="border border-gray-300 p-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">_gid</td>
                      <td className="border border-gray-300 p-3">Google Analytics - distinguishes users</td>
                      <td className="border border-gray-300 p-3">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-blue-800">
                  <strong>Opt-out:</strong> You can opt out of Google Analytics by installing the 
                  <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
                </p>
              </div>
            </section>

            <section id="advertising-cookies" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">5. Advertising Cookies</h2>
              <p className="text-gray-700 mb-4">
                These cookies are used to deliver relevant advertisements and measure ad effectiveness:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Cookie Name</th>
                      <th className="border border-gray-300 p-3 text-left">Purpose</th>
                      <th className="border border-gray-300 p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">_gcl_au</td>
                      <td className="border border-gray-300 p-3">Google Ads conversion tracking</td>
                      <td className="border border-gray-300 p-3">3 months</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">IDE</td>
                      <td className="border border-gray-300 p-3">Google Ads - measures ad performance</td>
                      <td className="border border-gray-300 p-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono text-sm">test_cookie</td>
                      <td className="border border-gray-300 p-3">Google Ads - checks if cookies are enabled</td>
                      <td className="border border-gray-300 p-3">15 minutes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
                <p className="text-yellow-800">
                  <strong>Ad Personalization:</strong> You can control personalized ads in your 
                  <a href="https://adssettings.google.com/" className="text-yellow-600 hover:text-yellow-800 underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.
                </p>
              </div>
            </section>

            <section id="third-party-cookies" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">6. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">We use services from third parties that may set cookies:</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Services</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li>Google Analytics - Website analytics</li>
                    <li>Google Ads - Advertising and conversion tracking</li>
                    <li>Google Fonts - Web font delivery</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li>Payment processing and fraud prevention</li>
                    <li>Subscription management</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Supabase</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li>User authentication and database services</li>
                    <li>Session management</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="cookie-management" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">7. Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 mb-4">
                You have several options for managing cookies:
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Cookie Consent Banner</h4>
                  <p className="text-blue-800 text-sm">
                    When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Settings Page</h4>
                  <p className="text-green-800 text-sm">
                    You can change your cookie preferences at any time by visiting our settings page or contacting us.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Opt-out Links</h4>
                  <p className="text-purple-800 text-sm">
                    Use the opt-out links provided for specific services like Google Analytics and Google Ads.
                  </p>
                </div>
              </div>
            </section>

            <section id="browser-settings" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">8. Browser Cookie Settings</h2>
              <p className="text-gray-700 mb-4">
                You can also control cookies through your browser settings:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Chrome</h4>
                  <p className="text-gray-700 text-sm">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
                  <p className="text-gray-700 text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                  <p className="text-gray-700 text-sm">Preferences → Privacy → Manage Website Data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Edge</h4>
                  <p className="text-gray-700 text-sm">Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-800">
                  <strong>Warning:</strong> Disabling all cookies may affect the functionality of our website and prevent you from using certain features.
                </p>
              </div>
            </section>

            <section id="updates" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">9. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. We will notify you of any material changes by:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a notice on our website</li>
              </ul>
              
              <p className="text-gray-700 mt-4">
                Your continued use of our website after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Cookie Policy, please contact us:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@resizesuite.com</p>
                <p className="text-gray-700 mb-2"><strong>Subject Line:</strong> Cookie Policy Inquiry</p>
                <p className="text-gray-700">
                  <strong>Response Time:</strong> We will respond within 48 hours of receiving your inquiry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
