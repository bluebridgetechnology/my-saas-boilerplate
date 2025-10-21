import { Navigation } from '@/components/layout/navigation';
import { HeroImageConverter } from '@/components/hero-image-converter';
import { StatsSection } from '@/components/layout/stats-section';
import { FreeToolsSection } from '@/components/image-processing/free-tools-section';
import { FeatureComparison } from '@/components/layout/feature-comparison';
import { TestimonialsSection } from '@/components/layout/testimonials-section';
import { FAQSection } from '@/components/layout/faq-section';
import { Footer } from '@/components/layout/footer';
import { AdBannerDisplay } from '@/components/layout/ad-banner-display';

export default function LandingPage() {
  return (
    <>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Image Converter Hero */}
      <HeroImageConverter />
      
      {/* Ad Section 1 - After Hero */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBannerDisplay position="between_content" currentPath="/" />
        </div>
      </div>
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Free Tools Section */}
      <FreeToolsSection />
      
      {/* Ad Section 2 - After Free Tools */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBannerDisplay position="between_content" currentPath="/" />
        </div>
      </div>
      
      {/* Feature Comparison Table */}
      <FeatureComparison />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Ad Section 3 - Before Footer */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBannerDisplay position="between_content" currentPath="/" />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
}
