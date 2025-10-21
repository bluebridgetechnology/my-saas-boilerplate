'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const checkDismissed = () => {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        // Show again after 24 hours
        if (Date.now() - dismissedTime < oneDayInMs) {
          setIsDismissed(true);
          return true;
        } else {
          localStorage.removeItem('pwa-install-dismissed');
        }
      }
      return false;
    };

    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show prompt if:
      // 1. On mobile device
      // 2. Not previously dismissed recently
      // 3. Not already installed
      if (isMobile && !checkDismissed() && !isInstalled) {
        // Delay showing the prompt by 3 seconds to avoid immediate popup
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    checkMobile();
    checkInstalled();
    checkDismissed();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    setIsDismissed(true);
    // Remember user dismissed for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showInstallPrompt || !isMobile || isDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 md:left-auto md:right-4 md:max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon icon="solar:smartphone-bold-duotone" className="h-5 w-5 text-blue-600" />
          Install ResizeSuite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          Install ResizeSuite as a PWA for quick access to all your image processing tools!
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
            Install
          </Button>
          <Button 
            onClick={handleDismiss}
            size="sm"
            variant="outline"
          >
            <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PWAManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setSwRegistration(registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center py-2 text-sm">
          <Icon icon="solar:wifi-router-minimalistic-bold-duotone" className="h-4 w-4 inline mr-1" />
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Update available notification */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center gap-2">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4" />
            <span>Update available!</span>
            <Button 
              onClick={handleUpdate}
              size="sm"
              variant="outline"
              className="ml-2 text-green-500 bg-white hover:bg-gray-100"
            >
              Update
            </Button>
          </div>
        </div>
      )}

      {/* PWA Installer */}
      <PWAInstaller />
    </>
  );
}
