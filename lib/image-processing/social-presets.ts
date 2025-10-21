/**
 * Comprehensive Social Media Presets System
 * Based on reference design with free/pro tier limitations
 */

export interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  isPro: boolean;
  category: 'story' | 'post' | 'profile' | 'banner' | 'ad' | 'thumbnail' | 'cover' | 'other';
  downloadIcon?: string;
}

export interface PlatformCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  presets: SocialPreset[];
  freeCount: number;
  totalCount: number;
}

// Facebook Presets
const FACEBOOK_PRESETS: SocialPreset[] = [
  {
    id: 'facebook-story',
    name: 'Story',
    platform: 'Facebook',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Facebook Stories',
    isPro: false,
    category: 'story'
  },
  {
    id: 'facebook-vertical-post',
    name: 'Vertical post',
    platform: 'Facebook',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Vertical posts for Facebook',
    isPro: false,
    category: 'post'
  },
  {
    id: 'facebook-shared-image',
    name: 'Shared image',
    platform: 'Facebook',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Shared images in Facebook feed',
    isPro: false,
    category: 'post'
  },
  {
    id: 'facebook-page-cover',
    name: 'Page cover',
    platform: 'Facebook',
    width: 820,
    height: 312,
    aspectRatio: '2.63:1',
    description: 'Facebook page cover photo',
    isPro: true,
    category: 'cover'
  },
  {
    id: 'facebook-event-cover',
    name: 'Event cover',
    platform: 'Facebook',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Facebook event cover photo',
    isPro: true,
    category: 'cover'
  },
  {
    id: 'facebook-group-cover',
    name: 'Group cover',
    platform: 'Facebook',
    width: 1640,
    height: 859,
    aspectRatio: '1.91:1',
    description: 'Facebook group cover photo',
    isPro: true,
    category: 'cover'
  },
  {
    id: 'facebook-profile',
    name: 'Profile image',
    platform: 'Facebook',
    width: 180,
    height: 180,
    aspectRatio: '1:1',
    description: 'Facebook profile picture',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'facebook-ad-carousel',
    name: 'Ad (Carousel)',
    platform: 'Facebook',
    width: 600,
    height: 600,
    aspectRatio: '1:1',
    description: 'Facebook carousel ad',
    isPro: true,
    category: 'ad'
  },
  {
    id: 'facebook-ad-link',
    name: 'Ad (Link)',
    platform: 'Facebook',
    width: 1200,
    height: 628,
    aspectRatio: '1.91:1',
    description: 'Facebook link ad',
    isPro: true,
    category: 'ad'
  },
  {
    id: 'facebook-news-feed',
    name: 'News feed',
    platform: 'Facebook',
    width: 1200,
    height: 628,
    aspectRatio: '1.91:1',
    description: 'Facebook news feed post',
    isPro: true,
    category: 'post'
  }
];

// Instagram Presets
const INSTAGRAM_PRESETS: SocialPreset[] = [
  {
    id: 'instagram-story',
    name: 'Story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Instagram Stories',
    isPro: false,
    category: 'story'
  },
  {
    id: 'instagram-vertical-post',
    name: 'Vertical post',
    platform: 'Instagram',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Vertical posts for Instagram',
    isPro: false,
    category: 'post'
  },
  {
    id: 'instagram-square-post',
    name: 'Square post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Square posts for Instagram feed',
    isPro: false,
    category: 'post'
  },
  {
    id: 'instagram-horizontal-post',
    name: 'Horizontal post',
    platform: 'Instagram',
    width: 1080,
    height: 566,
    aspectRatio: '1.91:1',
    description: 'Horizontal posts for Instagram',
    isPro: true,
    category: 'post'
  },
  {
    id: 'instagram-profile',
    name: 'Profile image',
    platform: 'Instagram',
    width: 110,
    height: 110,
    aspectRatio: '1:1',
    description: 'Instagram profile picture',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'instagram-thumbnail',
    name: 'Thumbnail',
    platform: 'Instagram',
    width: 161,
    height: 161,
    aspectRatio: '1:1',
    description: 'Instagram thumbnail',
    isPro: true,
    category: 'thumbnail'
  }
];

// Twitter Presets
const TWITTER_PRESETS: SocialPreset[] = [
  {
    id: 'twitter-share-image',
    name: 'Share image',
    platform: 'Twitter',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    description: 'Twitter share image',
    isPro: false,
    category: 'post'
  },
  {
    id: 'twitter-link-image',
    name: 'Link with image',
    platform: 'Twitter',
    width: 800,
    height: 418,
    aspectRatio: '1.91:1',
    description: 'Twitter link with image',
    isPro: false,
    category: 'post'
  },
  {
    id: 'twitter-header',
    name: 'Header',
    platform: 'Twitter',
    width: 1500,
    height: 500,
    aspectRatio: '3:1',
    description: 'Twitter header image',
    isPro: false,
    category: 'banner'
  },
  {
    id: 'twitter-website-card',
    name: 'Website card',
    platform: 'Twitter',
    width: 1024,
    height: 512,
    aspectRatio: '2:1',
    description: 'Twitter website card',
    isPro: true,
    category: 'post'
  },
  {
    id: 'twitter-profile',
    name: 'Profile image',
    platform: 'Twitter',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
    description: 'Twitter profile picture',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'twitter-instream-photo',
    name: 'In-stream photo',
    platform: 'Twitter',
    width: 440,
    height: 220,
    aspectRatio: '2:1',
    description: 'Twitter in-stream photo',
    isPro: true,
    category: 'post'
  }
];

// YouTube Presets
const YOUTUBE_PRESETS: SocialPreset[] = [
  {
    id: 'youtube-channel-icon',
    name: 'Channel icon',
    platform: 'YouTube',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    description: 'YouTube channel icon',
    isPro: false,
    category: 'profile'
  },
  {
    id: 'youtube-channel-art',
    name: 'Channel art',
    platform: 'YouTube',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'YouTube channel art',
    isPro: false,
    category: 'banner'
  },
  {
    id: 'youtube-banner',
    name: 'Banner',
    platform: 'YouTube',
    width: 2560,
    height: 1140,
    aspectRatio: '2.25:1',
    description: 'YouTube banner',
    isPro: false,
    category: 'banner'
  },
  {
    id: 'youtube-thumbnail',
    name: 'Thumbnail',
    platform: 'YouTube',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'YouTube video thumbnail',
    isPro: true,
    category: 'thumbnail'
  }
];

// Pinterest Presets
const PINTEREST_PRESETS: SocialPreset[] = [
  {
    id: 'pinterest-pin',
    name: 'Pin',
    platform: 'Pinterest',
    width: 800,
    height: 1200,
    aspectRatio: '2:3',
    description: 'Pinterest pin',
    isPro: false,
    category: 'post'
  },
  {
    id: 'pinterest-board-cover',
    name: 'Board cover',
    platform: 'Pinterest',
    width: 222,
    height: 150,
    aspectRatio: '1.48:1',
    description: 'Pinterest board cover',
    isPro: false,
    category: 'cover'
  },
  {
    id: 'pinterest-big-thumbnail',
    name: 'Big Thumbnail',
    platform: 'Pinterest',
    width: 222,
    height: 150,
    aspectRatio: '1.48:1',
    description: 'Pinterest big thumbnail',
    isPro: false,
    category: 'thumbnail'
  },
  {
    id: 'pinterest-profile',
    name: 'Profile image',
    platform: 'Pinterest',
    width: 165,
    height: 165,
    aspectRatio: '1:1',
    description: 'Pinterest profile picture',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'pinterest-small-thumbnail',
    name: 'Small thumbnail',
    platform: 'Pinterest',
    width: 55,
    height: 55,
    aspectRatio: '1:1',
    description: 'Pinterest small thumbnail',
    isPro: true,
    category: 'thumbnail'
  }
];

// LinkedIn Presets
const LINKEDIN_PRESETS: SocialPreset[] = [
  {
    id: 'linkedin-square-image',
    name: 'Square image',
    platform: 'LinkedIn',
    width: 1140,
    height: 736,
    aspectRatio: '1.55:1',
    description: 'LinkedIn square image',
    isPro: false,
    category: 'post'
  },
  {
    id: 'linkedin-image',
    name: 'LinkedIn image',
    platform: 'LinkedIn',
    width: 1200,
    height: 628,
    aspectRatio: '1.91:1',
    description: 'LinkedIn feed image',
    isPro: false,
    category: 'post'
  },
  {
    id: 'linkedin-profile',
    name: 'Profile image',
    platform: 'LinkedIn',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
    description: 'LinkedIn profile picture',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'linkedin-company-logo',
    name: 'Company logo',
    platform: 'LinkedIn',
    width: 300,
    height: 300,
    aspectRatio: '1:1',
    description: 'LinkedIn company logo',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'linkedin-company-banner',
    name: 'Company banner',
    platform: 'LinkedIn',
    width: 646,
    height: 220,
    aspectRatio: '2.94:1',
    description: 'LinkedIn company banner',
    isPro: true,
    category: 'banner'
  },
  {
    id: 'linkedin-square-logo',
    name: 'Square logo',
    platform: 'LinkedIn',
    width: 60,
    height: 60,
    aspectRatio: '1:1',
    description: 'LinkedIn square logo',
    isPro: true,
    category: 'profile'
  },
  {
    id: 'linkedin-personal-background',
    name: 'Personal background',
    platform: 'LinkedIn',
    width: 1584,
    height: 396,
    aspectRatio: '4:1',
    description: 'LinkedIn personal background',
    isPro: true,
    category: 'banner'
  },
  {
    id: 'linkedin-company-background',
    name: 'Company background',
    platform: 'LinkedIn',
    width: 1536,
    height: 768,
    aspectRatio: '2:1',
    description: 'LinkedIn company background',
    isPro: true,
    category: 'banner'
  },
  {
    id: 'linkedin-company-hero',
    name: 'Company hero',
    platform: 'LinkedIn',
    width: 1128,
    height: 376,
    aspectRatio: '3:1',
    description: 'LinkedIn company hero',
    isPro: true,
    category: 'banner'
  }
];

// Google Display Presets
const GOOGLE_DISPLAY_PRESETS: SocialPreset[] = [
  {
    id: 'google-skyscraper',
    name: 'Skyscraper',
    platform: 'Google Display',
    width: 120,
    height: 600,
    aspectRatio: '1:5',
    description: 'Google Display skyscraper ad',
    isPro: false,
    category: 'ad'
  },
  {
    id: 'google-leaderboard',
    name: 'Leaderboard',
    platform: 'Google Display',
    width: 728,
    height: 90,
    aspectRatio: '8.09:1',
    description: 'Google Display leaderboard ad',
    isPro: false,
    category: 'ad'
  },
  {
    id: 'google-banner',
    name: 'Banner',
    platform: 'Google Display',
    width: 468,
    height: 68,
    aspectRatio: '6.88:1',
    description: 'Google Display banner ad',
    isPro: false,
    category: 'ad'
  },
  {
    id: 'google-medium-rectangle',
    name: 'Medium rectangle',
    platform: 'Google Display',
    width: 300,
    height: 250,
    aspectRatio: '1.2:1',
    description: 'Google Display medium rectangle ad',
    isPro: true,
    category: 'ad'
  },
  {
    id: 'google-large-rectangle',
    name: 'Large rectangle',
    platform: 'Google Display',
    width: 336,
    height: 280,
    aspectRatio: '1.2:1',
    description: 'Google Display large rectangle ad',
    isPro: true,
    category: 'ad'
  },
  {
    id: 'google-half-page',
    name: 'Half page',
    platform: 'Google Display',
    width: 300,
    height: 600,
    aspectRatio: '1:2',
    description: 'Google Display half page ad',
    isPro: true,
    category: 'ad'
  },
  {
    id: 'google-half-banner',
    name: 'Half banner',
    platform: 'Google Display',
    width: 300,
    height: 400,
    aspectRatio: '3:4',
    description: 'Google Display half banner ad',
    isPro: true,
    category: 'ad'
  },
  {
    id: 'google-wide-skyscraper',
    name: 'Wide Skyscraper',
    platform: 'Google Display',
    width: 160,
    height: 600,
    aspectRatio: '4:15',
    description: 'Google Display wide skyscraper ad',
    isPro: true,
    category: 'ad'
  }
];

// Email & Blog Presets
const EMAIL_BLOG_PRESETS: SocialPreset[] = [
  {
    id: 'blog-image',
    name: 'Blog image',
    platform: 'Email & Blog',
    width: 750,
    height: 750,
    aspectRatio: '1:1',
    description: 'Blog post image',
    isPro: false,
    category: 'post'
  },
  {
    id: 'email-header',
    name: 'Email header',
    platform: 'Email & Blog',
    width: 600,
    height: 200,
    aspectRatio: '3:1',
    description: 'Email header image',
    isPro: false,
    category: 'banner'
  },
  {
    id: 'blog-header',
    name: 'Blog header',
    platform: 'Email & Blog',
    width: 1200,
    height: 600,
    aspectRatio: '2:1',
    description: 'Blog header image',
    isPro: true,
    category: 'banner'
  }
];

// Platform Categories
export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:facebook-bold-duotone',
    color: 'text-blue-600',
    presets: FACEBOOK_PRESETS,
    freeCount: 3,
    totalCount: FACEBOOK_PRESETS.length
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:instagram-bold-duotone',
    color: 'text-pink-600',
    presets: INSTAGRAM_PRESETS,
    freeCount: 3,
    totalCount: INSTAGRAM_PRESETS.length
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:twitter-bold-duotone',
    color: 'text-blue-400',
    presets: TWITTER_PRESETS,
    freeCount: 3,
    totalCount: TWITTER_PRESETS.length
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:youtube-bold-duotone',
    color: 'text-red-600',
    presets: YOUTUBE_PRESETS,
    freeCount: 3,
    totalCount: YOUTUBE_PRESETS.length
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:pinterest-bold-duotone',
    color: 'text-red-500',
    presets: PINTEREST_PRESETS,
    freeCount: 3,
    totalCount: PINTEREST_PRESETS.length
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:linkedin-bold-duotone',
    color: 'text-blue-700',
    presets: LINKEDIN_PRESETS,
    freeCount: 3,
    totalCount: LINKEDIN_PRESETS.length
  },
  {
    id: 'google-display',
    name: 'Google Display',
    description: 'Choose from 3 standard sizes or download them all at once',
    icon: 'solar:google-bold-duotone',
    color: 'text-green-600',
    presets: GOOGLE_DISPLAY_PRESETS,
    freeCount: 3,
    totalCount: GOOGLE_DISPLAY_PRESETS.length
  },
  {
    id: 'email-blog',
    name: 'Email & Blog',
    description: 'Choose from 2 standard sizes or download them all at once',
    icon: 'solar:letter-unread-bold-duotone',
    color: 'text-purple-600',
    presets: EMAIL_BLOG_PRESETS,
    freeCount: 2,
    totalCount: EMAIL_BLOG_PRESETS.length
  }
];

// Get all presets
export const ALL_PRESETS: SocialPreset[] = [
  ...FACEBOOK_PRESETS,
  ...INSTAGRAM_PRESETS,
  ...TWITTER_PRESETS,
  ...YOUTUBE_PRESETS,
  ...PINTEREST_PRESETS,
  ...LINKEDIN_PRESETS,
  ...GOOGLE_DISPLAY_PRESETS,
  ...EMAIL_BLOG_PRESETS
];

// Get free presets only
export const FREE_PRESETS: SocialPreset[] = ALL_PRESETS.filter(preset => !preset.isPro);

// Get pro presets only
export const PRO_PRESETS: SocialPreset[] = ALL_PRESETS.filter(preset => preset.isPro);

// Get presets by platform
export const getPresetsByPlatform = (platformId: string): SocialPreset[] => {
  const category = PLATFORM_CATEGORIES.find(cat => cat.id === platformId);
  return category ? category.presets : [];
};

// Get free presets by platform
export const getFreePresetsByPlatform = (platformId: string): SocialPreset[] => {
  return getPresetsByPlatform(platformId).filter(preset => !preset.isPro);
};

// Get pro presets by platform
export const getProPresetsByPlatform = (platformId: string): SocialPreset[] => {
  return getPresetsByPlatform(platformId).filter(preset => preset.isPro);
};
