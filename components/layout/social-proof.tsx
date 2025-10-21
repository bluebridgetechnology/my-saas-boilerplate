import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';

export function SocialProof() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "TechCorp",
      content: "ResizeSuite has saved us hours every week. The batch processing is incredible!",
      avatar: "👩‍💼"
    },
    {
      name: "Mike Chen",
      role: "Designer",
      company: "Creative Studio",
      content: "Finally, a tool that respects privacy. No uploads, instant results!",
      avatar: "👨‍🎨"
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      company: "Social Media Agency",
      content: "The social media presets are perfect. My workflow is so much faster now.",
      avatar: "👩‍💻"
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Loved by Creators Worldwide
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of professionals who trust ResizeSuite
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <blockquote className="text-gray-700 mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} icon="solar:star-bold-duotone" className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500K+</div>
            <div className="text-sm text-gray-600">Images Processed Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
            <div className="text-sm text-gray-600">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
            <div className="text-sm text-gray-600">User Rating</div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-6">Trusted and secure</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Icon icon="solar:shield-check-bold-duotone" className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="solar:lock-bold-duotone" className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">No Data Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="solar:flash-bold-duotone" className="h-6 w-6 text-yellow-600" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="solar:server-bold-duotone" className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Always Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
