'use client';

import React from 'react';
import { Icon } from '@iconify/react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Graphic Designer",
      company: "Creative Studio",
      avatar: "SC",
      content: "ResizeSuite has completely transformed my workflow. I can process hundreds of images in minutes instead of hours. The quality is outstanding and the privacy aspect gives me peace of mind.",
      rating: 5,
      verified: true
    },
    {
      name: "Marcus Rodriguez",
      role: "E-commerce Manager",
      company: "TechStore",
      avatar: "MR",
      content: "The batch processing feature is a game-changer for our product photography. We upload 50+ images daily and ResizeSuite handles everything perfectly. Customer support is also fantastic.",
      rating: 5,
      verified: true
    },
    {
      name: "Emily Watson",
      role: "Social Media Manager",
      company: "Digital Agency",
      avatar: "EW",
      content: "I love how ResizeSuite optimizes images for different social platforms automatically. It saves me so much time and the results are always perfect. Highly recommend to any content creator.",
      rating: 5,
      verified: true
    },
    {
      name: "David Kim",
      role: "Photographer",
      company: "Freelance",
      avatar: "DK",
      content: "As a photographer, image quality is everything. ResizeSuite maintains perfect quality while reducing file sizes dramatically. The watermarking feature is also incredibly useful for client previews.",
      rating: 5,
      verified: true
    },
    {
      name: "Lisa Thompson",
      role: "Marketing Director",
      company: "StartupCo",
      avatar: "LT",
      content: "We needed a reliable image processing solution for our marketing campaigns. ResizeSuite delivers consistently excellent results and the API integration made it easy to automate our workflow.",
      rating: 5,
      verified: true
    },
    {
      name: "James Wilson",
      role: "Web Developer",
      company: "DevStudio",
      avatar: "JW",
      content: "The API integration is seamless and the documentation is excellent. We've integrated ResizeSuite into our client projects and everyone loves the results. Great tool for developers.",
      rating: 5,
      verified: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
            <Icon icon="solar:star-bold-duotone" className="h-4 w-4 mr-2" />
            Customer Stories
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Creators Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users say about ResizeSuite. From designers to developers, 
            everyone loves the quality and speed of our image processing tools.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon key={i} icon="solar:star-bold-duotone" className="h-4 w-4 text-yellow-500" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-semibold text-sm mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} icon="solar:star-bold-duotone" className="h-4 w-4 text-yellow-500" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500K+</div>
              <div className="text-gray-600 font-medium">Images Processed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
