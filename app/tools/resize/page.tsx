'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResizeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new SEO-friendly URL
    router.replace('/image-resizer');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Image Resizer...</p>
      </div>
    </div>
  );
}