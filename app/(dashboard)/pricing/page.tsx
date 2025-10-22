'use client';

import { checkoutAction } from '@/lib/payments/actions';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { SubmitButton } from './submit-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function PricingPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricesResponse, productsResponse] = await Promise.all([
          fetch('/api/stripe/prices'),
          fetch('/api/stripe/products'),
        ]);
        
        if (!pricesResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch pricing data');
        }
        
        const [pricesData, productsData] = await Promise.all([
          pricesResponse.json(),
          productsResponse.json(),
        ]);
        
        setPrices(pricesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find the Pro plan (assuming it's named "Pro" in Stripe)
  const proPlan = products.find((product) => 
    product.name.toLowerCase().includes('pro') || 
    product.name.toLowerCase().includes('plus') ||
    product.name.toLowerCase().includes('premium')
  );

  const proPrice = prices.find((price) => price.productId === proPlan?.id);

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing</h1>
          <p className="text-gray-600">Choose the perfect plan for your image processing needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h2>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg font-normal text-gray-600">/month</span>
              </p>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Image Resizer</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Image Cropper</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Image Compressor</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Image Converter</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Social Media Presets</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Meme Generator</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Color Picker</span>
              </li>
            </ul>
            
            <Link href="/image-resizer">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Most Popular
              </div>
            </div>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h2>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                ${(proPrice?.unitAmount || 2900) / 100}
                <span className="text-lg font-normal text-gray-600">/month</span>
              </p>
              <p className="text-gray-600">Everything you need for professional work</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Everything in Free Plan</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">AI Background Removal</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Image Watermarking</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Batch Processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Priority Support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">No Watermarks</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Advanced Features</span>
              </li>
            </ul>
            
            <form action={checkoutAction}>
              <input type="hidden" name="priceId" value={proPrice?.id} />
              <SubmitButton />
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your billing period.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards through Stripe. Your payment information is secure and encrypted.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes! You can try all Pro features for free. No credit card required to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
