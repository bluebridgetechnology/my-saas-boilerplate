import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

export default function ContactPage() {
  return (
    <>
      <Navigation />
      
      <main className="pt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about ResizeSuite? We're here to help. Send us a message and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg">
                  <Icon icon="solar:letter-unread-bold-duotone" className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:letter-unread-bold-duotone" className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">Email Support</h4>
                      <p className="text-gray-600">support@resizesuite.com</p>
                      <p className="text-sm text-gray-500">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:chat-round-bold-duotone" className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">Live Chat</h4>
                      <p className="text-gray-600">Available 9 AM - 6 PM EST</p>
                      <p className="text-sm text-gray-500">Monday through Friday</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:book-bold-duotone" className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">Help Center</h4>
                      <p className="text-gray-600">Browse our knowledge base</p>
                      <p className="text-sm text-gray-500">Self-service support</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Preview */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Is ResizeSuite really free?</h4>
                    <p className="text-sm text-gray-600">Yes! Our free plan includes 5 images per batch with no registration required.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Are my images secure?</h4>
                    <p className="text-sm text-gray-600">Absolutely! All processing happens locally in your browser - images never leave your device.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">What file formats do you support?</h4>
                    <p className="text-sm text-gray-600">We support JPG, PNG, WEBP, GIF, BMP, and more. Pro users get access to additional formats.</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-6">
                  <Icon icon="solar:question-circle-bold-duotone" className="h-4 w-4 mr-2" />
                  View All FAQs
                </Button>
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <Icon icon="solar:clock-circle-bold-duotone" className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900">Quick Response Guarantee</h4>
                    <p className="text-blue-700">We typically respond to all inquiries within 24 hours, often much sooner!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
