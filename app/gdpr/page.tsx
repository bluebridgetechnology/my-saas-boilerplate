import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GDPR Compliance - ResizeSuite',
  description: 'Learn about ResizeSuite\'s GDPR compliance, data protection practices, and your rights under the General Data Protection Regulation.',
  robots: 'index, follow',
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">GDPR Compliance</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              ResizeSuite is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR). 
              This page outlines our data protection practices and your rights under GDPR.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              <p className="text-blue-800 font-medium">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <nav className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
              <ul className="space-y-2">
                <li><a href="#introduction" className="text-blue-600 hover:text-blue-800">1. Introduction to GDPR</a></li>
                <li><a href="#data-controller" className="text-blue-600 hover:text-blue-800">2. Data Controller Information</a></li>
                <li><a href="#data-collection" className="text-blue-600 hover:text-blue-800">3. Data Collection and Processing</a></li>
                <li><a href="#legal-basis" className="text-blue-600 hover:text-blue-800">4. Legal Basis for Processing</a></li>
                <li><a href="#user-rights" className="text-blue-600 hover:text-blue-800">5. Your Rights Under GDPR</a></li>
                <li><a href="#data-retention" className="text-blue-600 hover:text-blue-800">6. Data Retention</a></li>
                <li><a href="#data-transfers" className="text-blue-600 hover:text-blue-800">7. International Data Transfers</a></li>
                <li><a href="#contact" className="text-blue-600 hover:text-blue-800">8. Contact Information</a></li>
              </ul>
            </nav>

            <section id="introduction" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">1. Introduction to GDPR</h2>
              <p className="text-gray-700 mb-4">
                The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. 
                It applies to all organizations that process personal data of individuals in the European Union (EU), regardless of where the organization is located.
              </p>
              <p className="text-gray-700">
                ResizeSuite processes personal data in accordance with GDPR requirements, ensuring that your privacy rights are protected and respected.
              </p>
            </section>

            <section id="data-controller" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">2. Data Controller Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">ResizeSuite</h3>
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@resizesuite.com</p>
                <p className="text-gray-700 mb-2"><strong>Website:</strong> https://resizesuite.com</p>
                <p className="text-gray-700">
                  <strong>Data Protection Officer:</strong> privacy@resizesuite.com
                </p>
              </div>
            </section>

            <section id="data-collection" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">3. Data Collection and Processing</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Data We Collect:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Email address, name, password (hashed)</li>
                <li><strong>Usage Data:</strong> Tool usage statistics, feature preferences</li>
                <li><strong>Payment Information:</strong> Billing details (processed securely by Stripe)</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Communication Data:</strong> Support tickets, feedback, inquiries</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Data:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide and improve our image processing services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important service updates and notifications</li>
                <li>Provide customer support</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-800 font-medium">
                  <strong>Important:</strong> We do not store or process your uploaded images on our servers. 
                  All image processing happens locally in your browser for maximum privacy.
                </p>
              </div>
            </section>

            <section id="legal-basis" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
              <p className="text-gray-700 mb-4">We process your personal data based on the following legal grounds:</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Contract Performance</h4>
                  <p className="text-blue-800">Processing necessary to provide our services and fulfill our contractual obligations.</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Legitimate Interest</h4>
                  <p className="text-green-800">Processing for business operations, security, and service improvement.</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Consent</h4>
                  <p className="text-purple-800">Processing based on your explicit consent for marketing communications.</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900">Legal Obligation</h4>
                  <p className="text-orange-800">Processing required to comply with applicable laws and regulations.</p>
                </div>
              </div>
            </section>

            <section id="user-rights" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">5. Your Rights Under GDPR</h2>
              <p className="text-gray-700 mb-4">As a data subject, you have the following rights:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Right of Access</h4>
                  <p className="text-gray-700 text-sm">Request a copy of your personal data and information about how it's processed.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Right of Rectification</h4>
                  <p className="text-gray-700 text-sm">Correct inaccurate or incomplete personal data.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Right of Erasure</h4>
                  <p className="text-gray-700 text-sm">Request deletion of your personal data in certain circumstances.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Restrict Processing</h4>
                  <p className="text-gray-700 text-sm">Limit how we process your personal data.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h4>
                  <p className="text-gray-700 text-sm">Receive your data in a structured, machine-readable format.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Object</h4>
                  <p className="text-gray-700 text-sm">Object to processing based on legitimate interests or for marketing purposes.</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
                <p className="text-blue-800">
                  <strong>To exercise your rights:</strong> Contact us at privacy@resizesuite.com. 
                  We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            <section id="data-retention" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">We retain your personal data only as long as necessary for the purposes outlined in this policy:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after closure</li>
                <li><strong>Payment Data:</strong> Retained for 7 years for accounting and tax purposes</li>
                <li><strong>Support Communications:</strong> Retained for 3 years for service improvement</li>
                <li><strong>Usage Analytics:</strong> Anonymized after 2 years</li>
              </ul>
            </section>

            <section id="data-transfers" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">7. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Some of our service providers may be located outside the European Economic Area (EEA). 
                When we transfer your data internationally, we ensure appropriate safeguards are in place:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Adequacy decisions by the European Commission</li>
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Binding Corporate Rules</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <section id="contact" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this GDPR compliance statement or wish to exercise your rights, 
                please contact us:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@resizesuite.com</p>
                <p className="text-gray-700 mb-2"><strong>Subject Line:</strong> GDPR Request</p>
                <p className="text-gray-700">
                  <strong>Response Time:</strong> We will respond within 30 days of receiving your request.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
                <p className="text-yellow-800">
                  <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority 
                  if you believe we have not handled your personal data in accordance with GDPR.
                </p>
              </div>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-gray-600 text-sm">
                This GDPR compliance statement is part of our commitment to transparency and data protection. 
                We regularly review and update our practices to ensure continued compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
