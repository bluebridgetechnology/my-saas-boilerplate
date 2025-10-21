'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

interface AdBanner {
  id: string;
  banner_name: string;
  banner_type: 'image' | 'code' | 'google_adsense';
  banner_content: string;
  banner_position: 'header' | 'sidebar' | 'footer' | 'between_content';
  is_active: boolean;
  display_pages: string[];
  click_url?: string;
  alt_text?: string;
}

interface AdBannerDisplayProps {
  position: 'header' | 'sidebar' | 'footer' | 'between_content';
  currentPath?: string;
}

export function AdBannerDisplay({ position, currentPath }: AdBannerDisplayProps) {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/ad-banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
        <Icon icon="solar:refresh-bold-duotone" className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Filter banners by position and current path
  const relevantBanners = banners.filter(banner => 
    banner.is_active && 
    banner.banner_position === position &&
    (banner.display_pages.length === 0 || banner.display_pages.includes(currentPath || ''))
  );

  if (relevantBanners.length === 0) {
    return (
      <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Google AdSense Banner</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relevantBanners.map((banner) => (
        <div key={banner.id} className="ad-banner-container">
          {banner.banner_type === 'google_adsense' && (
            <div 
              className="banner-content"
              dangerouslySetInnerHTML={{ __html: banner.banner_content }}
            />
          )}
          
          {banner.banner_type === 'image' && (
            <div className="banner-image-container">
              {banner.click_url ? (
                <a 
                  href={banner.click_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={banner.banner_content} 
                    alt={banner.alt_text || banner.banner_name}
                    className="w-full h-auto rounded-lg"
                  />
                </a>
              ) : (
                <img 
                  src={banner.banner_content} 
                  alt={banner.alt_text || banner.banner_name}
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          )}
          
          {banner.banner_type === 'code' && (
            <div 
              className="banner-content"
              dangerouslySetInnerHTML={{ __html: banner.banner_content }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Convenience components for different positions
export function HeaderAdBanner() {
  return <AdBannerDisplay position="header" />;
}

export function SidebarAdBanner() {
  return <AdBannerDisplay position="sidebar" />;
}

export function FooterAdBanner() {
  return <AdBannerDisplay position="footer" />;
}

export function BetweenContentAdBanner({ currentPath }: { currentPath?: string }) {
  return <AdBannerDisplay position="between_content" currentPath={currentPath} />;
}
