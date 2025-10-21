import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/lib/auth/auth-context';
import { HeadCodeInjection, BodyStartCodeInjection, BodyEndCodeInjection } from '@/components/layout/code-injection';
import { PWAManager } from '@/components/layout/pwa-manager';
import { Toaster } from 'sonner';
import { AuthDebug } from '@/components/debug/auth-debug';

export const metadata: Metadata = {
  title: 'Free Image Resizer Online - Resize Photos Instantly | ResizeSuite',
  description: 'Free online image resizer tool. Resize, compress & optimize photos instantly without uploads. Perfect for social media, web & print. 100% private & secure.',
  keywords: 'image resize, image compress, image optimization, image converter, social media presets, watermark, batch processing, free image resizer, online photo editor, image resizer tool',
  authors: [{ name: 'ResizeSuite Team' }],
  creator: 'ResizeSuite',
  publisher: 'ResizeSuite',
  robots: 'index, follow',
  openGraph: {
    title: 'Free Image Resizer Online - Resize Photos Instantly | ResizeSuite',
    description: 'Free online image resizer tool. Resize, compress & optimize photos instantly without uploads. Perfect for social media, web & print. 100% private & secure.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Resizer Online - Resize Photos Instantly | ResizeSuite',
    description: 'Free online image resizer tool. Resize, compress & optimize photos instantly without uploads. Perfect for social media, web & print. 100% private & secure.',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ResizeSuite',
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  width: 'device-width',
  initialScale: 1,
};

const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
  preload: true,
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${beVietnamPro.variable}`}
    >
      <head>
        <HeadCodeInjection />
      </head>
      <body className={`min-h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-green-50 ${beVietnamPro.className}`} suppressHydrationWarning>
        <BodyStartCodeInjection />
        <AuthProvider>
          {children}
          <ToastProvider />
          <Toaster position="top-right" richColors />
          <AuthDebug />
        </AuthProvider>
        <BodyEndCodeInjection />
        <PWAManager />
      </body>
    </html>
  );
}