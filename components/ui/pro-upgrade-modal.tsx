'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
}

export function ProUpgradeModal({ isOpen, onClose, toolName }: ProUpgradeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: 'solar:infinity-bold-duotone',
      title: 'Unlimited Processing',
      description: 'Process unlimited images without restrictions',
    },
    {
      icon: 'solar:layers-bold-duotone',
      title: 'Batch Processing',
      description: 'Process up to 100 images simultaneously',
    },
    {
      icon: 'solar:magic-stick-bold-duotone',
      title: 'Advanced AI Features',
      description: 'Access AI-powered background removal and smart cropping',
    },
    {
      icon: 'solar:lightbulb-bolt-bold-duotone',
      title: 'Priority Processing',
      description: 'Faster processing speeds and priority queue',
    },
    {
      icon: 'solar:download-square-bold-duotone',
      title: 'High Quality Exports',
      description: 'Export up to 50MB files with maximum quality',
    },
    {
      icon: 'solar:shield-check-bold-duotone',
      title: 'Commercial License',
      description: 'Use for commercial projects without attribution',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4">
                <Icon icon="solar:crown-bold" className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-gray-600">
            {toolName ? (
              <>
                <span className="font-semibold text-gray-900">{toolName}</span> is a Pro feature. Unlock all premium tools and features with ResizeSuite Pro.
              </>
            ) : (
              'Unlock all premium tools and features with ResizeSuite Pro.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-purple-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2">
                    <Icon icon={feature.icon} className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Highlight */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">$9.99</span>
              <span className="text-lg text-gray-600">/month</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/pricing" className="flex-1">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg py-6 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all duration-300"
                onClick={onClose}
              >
                <Icon icon="solar:crown-bold" className="h-5 w-5 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex-1 py-6 border-2 hover:bg-gray-50"
              onClick={onClose}
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5 text-green-600" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 text-blue-600" />
              <span>30-Day Refund</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon icon="solar:star-bold-duotone" className="h-5 w-5 text-yellow-600" />
              <span>5,000+ Users</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

