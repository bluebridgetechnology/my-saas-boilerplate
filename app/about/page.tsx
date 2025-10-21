import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Icon } from '@iconify/react';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      
      <main className="pt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About ResizeSuite
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make professional image processing accessible, fast, and secure for everyone.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                ResizeSuite was born from a simple observation: image processing tools were either too complex, 
                too slow, or compromised user privacy. We set out to change that.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our mission is to provide professional-grade image processing tools that work instantly, 
                respect your privacy, and deliver exceptional results every time.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">🔒 Privacy First</h3>
                <p className="text-blue-700">
                  All image processing happens locally in your browser. Your images never leave your device, 
                  ensuring complete privacy and security.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <Icon icon="solar:shield-check-bold-duotone" className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">500K+ Images</h3>
                <p className="text-gray-600">Processed monthly with complete privacy</p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon icon="solar:flash-bold-duotone" className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Speed</h3>
                <p className="text-gray-600">
                  Process images in milliseconds, not minutes. Our client-side technology ensures 
                  lightning-fast results every time.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon icon="solar:shield-check-bold-duotone" className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy</h3>
                <p className="text-gray-600">
                  Your images never leave your device. All processing happens locally, ensuring 
                  complete privacy and security.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon icon="solar:star-bold-duotone" className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
                <p className="text-gray-600">
                  Professional-grade results with advanced algorithms. We maintain the highest 
                  quality standards in every tool we build.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">AC</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Alex Chen</h3>
                <p className="text-blue-600 font-medium mb-2">Founder & CEO</p>
                <p className="text-gray-600 text-sm">
                  Former Google engineer with 10+ years in image processing and computer vision.
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">SM</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Sarah Martinez</h3>
                <p className="text-blue-600 font-medium mb-2">CTO</p>
                <p className="text-gray-600 text-sm">
                  Expert in web technologies and client-side processing with a focus on performance.
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">DJ</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">David Johnson</h3>
                <p className="text-blue-600 font-medium mb-2">Head of Design</p>
                <p className="text-gray-600 text-sm">
                  UX/UI designer passionate about creating intuitive and beautiful user experiences.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">By the Numbers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600 font-medium">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">500K+</div>
                <div className="text-gray-600 font-medium">Images Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                <div className="text-gray-600 font-medium">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">4.9/5</div>
                <div className="text-gray-600 font-medium">User Rating</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust ResizeSuite for their image processing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/#free-tools"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                <Icon icon="solar:play-bold-duotone" className="h-5 w-5 mr-2" />
                Start Free Now
              </a>
              <a 
                href="/contact"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                <Icon icon="solar:letter-unread-bold-duotone" className="h-5 w-5 mr-2" />
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
