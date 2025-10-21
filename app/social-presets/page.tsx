import { Metadata } from 'next';
import { SocialPresetsPageContent } from '@/components/social-presets-page-content';

export const metadata: Metadata = {
  title: 'Social Media Presets - ResizeSuite',
  description: 'Free online image resizer for social media and custom sizes. Optimize images for Facebook, Instagram, Twitter, YouTube, LinkedIn, Pinterest, Google Display and more with perfect aspect ratios.',
  keywords: 'social media presets, instagram, youtube, linkedin, facebook, twitter, pinterest, image optimization, aspect ratio, free image resizer',
  openGraph: {
  title: 'Social Media Presets - ResizeSuite',
    description: 'Free online image resizer for social media and custom sizes. Optimize images for Facebook, Instagram, Twitter, YouTube, LinkedIn, Pinterest, Google Display and more with perfect aspect ratios.',
    type: 'website',
  },
};

export default function SocialPresetsPage() {
  return <SocialPresetsPageContent />;
}
