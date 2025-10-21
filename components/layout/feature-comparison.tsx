'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

export function FeatureComparison() {
  const features = [
    { name: 'Images per batch', free: '5', pro: '100' },
    { name: 'File size limit', free: '10MB', pro: '50MB' },
    { name: 'Supported formats', free: 'JPG, PNG, WEBP, GIF, BMP', pro: 'All formats + TIFF, SVG, PDF' },
    { name: 'Social media presets', free: '3 per platform', pro: 'Unlimited + custom' },
    { name: 'Watermarking', free: 'No', pro: 'Yes' },
    { name: 'ZIP downloads', free: 'No', pro: 'Yes' },
    { name: 'Project saving', free: 'No', pro: 'Yes' },
    { name: 'Priority processing', free: 'No', pro: 'Yes' },
    { name: 'API access', free: 'No', pro: 'Yes' },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you need more power. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-16">
          {/* Free Plan */}
          <Card className="relative bg-white border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">FREE</CardTitle>
              <p className="text-gray-600 mb-4">
                Perfect for personal use and occasional image processing
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">Forever</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">What's included?</h4>
                <ul className="space-y-2">
                  {features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span className="font-medium">{feature.name}</span>
                      <span className="ml-auto font-semibold text-gray-900">{feature.free}</span>
                  </li>
                ))}
              </ul>
              </div>
              <Button 
                className="w-full h-12 text-base font-semibold rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300" 
                variant="outline"
                onClick={() => {
                  const toolsSection = document.getElementById('free-tools');
                  toolsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Choose Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative bg-white border-2 border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-6 pt-4">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">PRO</CardTitle>
              <p className="text-gray-600 mb-4">
                For professionals, businesses, and power users
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Icon icon="solar:discount-bold-duotone" className="h-4 w-4 mr-1" />
                Save 20% with Annual Plan ($99/year)
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">What's included?</h4>
                <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span className="font-medium">{feature.name}</span>
                      <span className="ml-auto font-semibold text-gray-900">{feature.pro}</span>
                  </li>
                ))}
              </ul>
              </div>
              <Button 
                className="w-full h-12 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
                onClick={() => {
                  window.location.href = '/sign-up?plan=pro';
                }}
              >
                Choose Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust and Security */}
        <div className="text-center bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Trusted and Secure
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Your privacy and security are at the heart of everything we do.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 mb-3">
                <Icon icon="solar:shield-check-bold-duotone" className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">GDPR Compliant</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-3">
                <Icon icon="solar:server-minimalistic-bold-duotone" className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">No Data Storage</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-50 mb-3">
                <Icon icon="solar:bolt-bold-duotone" className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">Lightning Fast</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-3">
                <Icon icon="solar:clock-circle-bold-duotone" className="h-6 w-6 text-blue-600" />
        </div>
              <div className="text-sm font-semibold text-gray-900">Always Available</div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
