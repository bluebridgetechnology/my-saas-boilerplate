'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';

interface UpgradePromptProps {
  title?: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  features?: string[];
  onUpgrade?: () => void;
  variant?: 'default' | 'compact' | 'modal';
}

export function UpgradePrompt({ 
  title = 'Upgrade to Pro',
  message,
  ctaText = 'Upgrade Now',
  ctaLink = '/pricing',
  features = [],
  onUpgrade,
  variant = 'default'
}: UpgradePromptProps) {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else if (ctaLink) {
      window.open(ctaLink, '_blank');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">{title}</span>
          </div>
          <Button 
            onClick={handleUpgrade}
            size="sm"
            className="bg-white hover:bg-gray-50 text-blue-600 text-xs px-3 py-1"
          >
            {ctaText}
          </Button>
        </div>
        <p className="text-xs text-white/90 mt-1">{message}</p>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="p-6 max-w-md mx-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:crown-bold-duotone" className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {features.length > 0 && (
              <div className="text-left mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Pro Features:</h4>
                <ul className="space-y-1">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={handleUpgrade}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {ctaText}
              </Button>
              <Button 
                onClick={() => window.close()}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Default variant
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:crown-bold-duotone" className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-blue-100 mb-4">{message}</p>
          
          {features.length > 0 && (
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-blue-100">
                  <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="bg-white hover:bg-gray-50 text-blue-600 ml-4"
        >
          {ctaText}
        </Button>
      </div>
    </Card>
  );
}

interface TierLimitPromptProps {
  limitType: 'maxImages' | 'maxFileSize' | 'maxPaletteColors' | 'maxTemplates';
  currentCount?: number;
  variant?: 'default' | 'compact' | 'modal';
}

export function TierLimitPrompt({ 
  limitType, 
  currentCount = 0,
  variant = 'compact'
}: TierLimitPromptProps) {
  const getLimitInfo = () => {
    switch (limitType) {
      case 'maxImages':
        return {
          message: `Free tier limited to 5 images. You've used ${currentCount}/5.`,
          features: ['100 images per batch', '50MB file size limit', 'Advanced processing options']
        };
      case 'maxFileSize':
        return {
          message: 'File too large for free tier. Maximum size: 10MB.',
          features: ['50MB file size limit', 'Batch processing', 'Priority support']
        };
      case 'maxPaletteColors':
        return {
          message: `Free tier limited to 5 colors per palette. You've used ${currentCount}/5.`,
          features: ['20 colors per palette', 'Save palettes', 'Advanced color tools']
        };
      case 'maxTemplates':
        return {
          message: `Free tier limited to 2 templates. You've used ${currentCount}/2.`,
          features: ['10+ templates', 'Custom templates', 'Template sharing']
        };
      default:
        return {
          message: 'Upgrade to Pro for more features!',
          features: ['Unlimited usage', 'Advanced features', 'Priority support']
        };
    }
  };

  const { message, features } = getLimitInfo();

  return (
    <UpgradePrompt
      title="Upgrade to Pro"
      message={message}
      ctaText="Upgrade Now"
      ctaLink="/pricing"
      features={features}
      variant={variant}
    />
  );
}
