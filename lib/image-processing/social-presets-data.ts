export interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  isPro: boolean;
}

export interface PlatformCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  presets: SocialPreset[];
}

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/facebook.png',
    color: 'bg-blue-600',
    presets: [
      { id: 'facebook-story', name: 'Story', platform: 'Facebook', width: 1080, height: 1920, aspectRatio: '9:16', isPro: true },
      { id: 'facebook-vertical-post', name: 'Vertical post', platform: 'Facebook', width: 1080, height: 1350, aspectRatio: '4:5', isPro: true },
      { id: 'facebook-shared-image', name: 'Shared image', platform: 'Facebook', width: 1200, height: 630, aspectRatio: '1.91:1', isPro: false },
      { id: 'facebook-page-cover', name: 'Page cover', platform: 'Facebook', width: 820, height: 312, aspectRatio: '2.63:1', isPro: true },
      { id: 'facebook-event-cover', name: 'Event cover', platform: 'Facebook', width: 1920, height: 1080, aspectRatio: '16:9', isPro: true },
      { id: 'facebook-group-cover', name: 'Group cover', platform: 'Facebook', width: 1640, height: 859, aspectRatio: '1.91:1', isPro: true },
      { id: 'facebook-profile-image', name: 'Profile image', platform: 'Facebook', width: 180, height: 180, aspectRatio: '1:1', isPro: false },
      { id: 'facebook-ad-carousel', name: 'Ad (Carousel)', platform: 'Facebook', width: 600, height: 600, aspectRatio: '1:1', isPro: true },
      { id: 'facebook-ad-link', name: 'Ad (Link)', platform: 'Facebook', width: 1200, height: 628, aspectRatio: '1.91:1', isPro: true },
      { id: 'facebook-news-feed', name: 'News feed', platform: 'Facebook', width: 1200, height: 628, aspectRatio: '1.91:1', isPro: false }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/instagram.png',
    color: 'bg-pink-600',
    presets: [
      { id: 'instagram-story', name: 'Story', platform: 'Instagram', width: 1080, height: 1920, aspectRatio: '9:16', isPro: false },
      { id: 'instagram-vertical-post', name: 'Vertical post', platform: 'Instagram', width: 1080, height: 1350, aspectRatio: '4:5', isPro: true },
      { id: 'instagram-square-post', name: 'Square post', platform: 'Instagram', width: 1080, height: 1080, aspectRatio: '1:1', isPro: false },
      { id: 'instagram-horizontal-post', name: 'Horizontal post', platform: 'Instagram', width: 1080, height: 566, aspectRatio: '1.91:1', isPro: true },
      { id: 'instagram-profile-image', name: 'Profile image', platform: 'Instagram', width: 110, height: 110, aspectRatio: '1:1', isPro: true },
      { id: 'instagram-thumbnail', name: 'Thumbnail', platform: 'Instagram', width: 161, height: 161, aspectRatio: '1:1', isPro: true }
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/twitter.png',
    color: 'bg-sky-500',
    presets: [
      { id: 'twitter-share-image', name: 'Share image', platform: 'Twitter', width: 1200, height: 675, aspectRatio: '16:9', isPro: false },
      { id: 'twitter-link-image', name: 'Link with image', platform: 'Twitter', width: 800, height: 418, aspectRatio: '1.91:1', isPro: true },
      { id: 'twitter-header', name: 'Header', platform: 'Twitter', width: 1500, height: 500, aspectRatio: '3:1', isPro: true },
      { id: 'twitter-website-card', name: 'Website card', platform: 'Twitter', width: 1024, height: 512, aspectRatio: '2:1', isPro: true },
      { id: 'twitter-profile-image', name: 'Profile image', platform: 'Twitter', width: 400, height: 400, aspectRatio: '1:1', isPro: false },
      { id: 'twitter-instream-photo', name: 'In-stream photo', platform: 'Twitter', width: 440, height: 220, aspectRatio: '2:1', isPro: true }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/youtube.png',
    color: 'bg-red-600',
    presets: [
      { id: 'youtube-channel-icon', name: 'Channel icon', platform: 'YouTube', width: 800, height: 800, aspectRatio: '1:1', isPro: true },
      { id: 'youtube-channel-art', name: 'Channel art', platform: 'YouTube', width: 2560, height: 1440, aspectRatio: '16:9', isPro: true },
      { id: 'youtube-banner', name: 'Banner', platform: 'YouTube', width: 2560, height: 1140, aspectRatio: '2.25:1', isPro: true },
      { id: 'youtube-thumbnail', name: 'Thumbnail', platform: 'YouTube', width: 1280, height: 720, aspectRatio: '16:9', isPro: false }
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/pinterest.png',
    color: 'bg-red-500',
    presets: [
      { id: 'pinterest-pin', name: 'Pin', platform: 'Pinterest', width: 800, height: 1200, aspectRatio: '2:3', isPro: false },
      { id: 'pinterest-board-cover', name: 'Board cover', platform: 'Pinterest', width: 222, height: 150, aspectRatio: '1.48:1', isPro: true },
      { id: 'pinterest-big-thumbnail', name: 'Big Thumbnail', platform: 'Pinterest', width: 222, height: 150, aspectRatio: '1.48:1', isPro: true },
      { id: 'pinterest-profile-image', name: 'Profile image', platform: 'Pinterest', width: 165, height: 165, aspectRatio: '1:1', isPro: true },
      { id: 'pinterest-small-thumbnail', name: 'Small thumbnail', platform: 'Pinterest', width: 55, height: 55, aspectRatio: '1:1', isPro: true }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/linkedin.png',
    color: 'bg-blue-700',
    presets: [
      { id: 'linkedin-square-image', name: 'Square image', platform: 'LinkedIn', width: 1140, height: 736, aspectRatio: '1.55:1', isPro: false },
      { id: 'linkedin-image', name: 'LinkedIn image', platform: 'LinkedIn', width: 1200, height: 628, aspectRatio: '1.91:1', isPro: false },
      { id: 'linkedin-profile', name: 'Profile image', platform: 'LinkedIn', width: 400, height: 400, aspectRatio: '1:1', isPro: true },
      { id: 'linkedin-company-logo', name: 'Company logo', platform: 'LinkedIn', width: 300, height: 300, aspectRatio: '1:1', isPro: true },
      { id: 'linkedin-company-banner', name: 'Company banner', platform: 'LinkedIn', width: 646, height: 220, aspectRatio: '2.94:1', isPro: true },
      { id: 'linkedin-square-logo', name: 'Square logo', platform: 'LinkedIn', width: 60, height: 60, aspectRatio: '1:1', isPro: true },
      { id: 'linkedin-personal-background', name: 'Personal background', platform: 'LinkedIn', width: 1584, height: 396, aspectRatio: '4:1', isPro: true },
      { id: 'linkedin-company-background', name: 'Company background', platform: 'LinkedIn', width: 1536, height: 768, aspectRatio: '2:1', isPro: true },
      { id: 'linkedin-company-hero', name: 'Company hero', platform: 'LinkedIn', width: 1128, height: 376, aspectRatio: '3:1', isPro: true }
    ]
  },
  {
    id: 'google-display',
    name: 'Google Display',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: '/icons/google.png',
    color: 'bg-green-600',
    presets: [
      { id: 'google-skyscraper', name: 'Skyscraper', platform: 'Google Display', width: 120, height: 600, aspectRatio: '1:5', isPro: false },
      { id: 'google-leaderboard', name: 'Leaderboard', platform: 'Google Display', width: 728, height: 90, aspectRatio: '8.09:1', isPro: false },
      { id: 'google-banner', name: 'Banner', platform: 'Google Display', width: 468, height: 68, aspectRatio: '6.88:1', isPro: false },
      { id: 'google-medium-rectangle', name: 'Medium rectangle', platform: 'Google Display', width: 300, height: 250, aspectRatio: '1.2:1', isPro: true },
      { id: 'google-large-rectangle', name: 'Large rectangle', platform: 'Google Display', width: 336, height: 280, aspectRatio: '1.2:1', isPro: true },
      { id: 'google-half-page', name: 'Half page', platform: 'Google Display', width: 300, height: 600, aspectRatio: '1:2', isPro: true },
      { id: 'google-half-banner', name: 'Half banner', platform: 'Google Display', width: 300, height: 400, aspectRatio: '3:4', isPro: true },
      { id: 'google-wide-skyscraper', name: 'Wide Skyscraper', platform: 'Google Display', width: 160, height: 600, aspectRatio: '4:15', isPro: true }
    ]
  },
  {
    id: 'email-blog',
    name: 'Email & blog',
    description: 'Choose from 2 standard sizes or download them all at once',
    icon: '/icons/email.png',
    color: 'bg-orange-600',
    presets: [
      { id: 'blog-image', name: 'Blog image', platform: 'Email & blog', width: 750, height: 750, aspectRatio: '1:1', isPro: false },
      { id: 'email-header', name: 'Email header', platform: 'Email & blog', width: 600, height: 200, aspectRatio: '3:1', isPro: true },
      { id: 'blog-header', name: 'Blog header', platform: 'Email & blog', width: 1200, height: 600, aspectRatio: '2:1', isPro: true }
    ]
  }
];

// Helper function to get free presets for each platform
export function getFreePresetsForPlatform(platformId: string): SocialPreset[] {
  const platform = PLATFORM_CATEGORIES.find(p => p.id === platformId);
  if (!platform) return [];
  return platform.presets.filter(preset => !preset.isPro);
}

// Helper function to get all presets for a platform
export function getAllPresetsForPlatform(platformId: string): SocialPreset[] {
  const platform = PLATFORM_CATEGORIES.find(p => p.id === platformId);
  if (!platform) return [];
  return platform.presets;
}
