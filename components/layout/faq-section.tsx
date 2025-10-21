'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "Is ResizeSuite really free to use?",
      answer: "Yes! Our free plan includes 5 images per batch, up to 10MB each, with support for JPG, PNG, WEBP, GIF, and BMP formats. No registration required and your images are processed locally in your browser - never uploaded to our servers."
    },
    {
      question: "How does the Pro plan differ from Free?",
      answer: "Pro plan includes 100 images per batch, up to 50MB each, all file formats including TIFF and SVG, unlimited social media presets, watermarking, ZIP downloads, project saving, priority processing, and API access. Perfect for professionals and businesses."
    },
    {
      question: "Are my images secure and private?",
      answer: "Absolutely! All image processing happens locally in your browser using client-side JavaScript. Your images are never uploaded to our servers, ensuring complete privacy and security. We don't store, access, or have any way to see your images."
    },
    {
      question: "What file formats do you support?",
      answer: "Free users can process JPG, PNG, WEBP, GIF, and BMP files. Pro users get access to all formats including TIFF, SVG, PDF, and more. We're constantly adding support for new formats based on user feedback."
    },
    {
      question: "Can I use ResizeSuite for commercial purposes?",
      answer: "Yes! Both free and pro plans allow commercial use. The free plan is perfect for small businesses and freelancers, while the pro plan offers advanced features for larger commercial operations and agencies."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all Pro subscriptions. If you're not satisfied with the pro features, contact our support team within 30 days for a full refund, no questions asked."
    },
    {
      question: "How does the annual discount work?",
      answer: "Save 20% by choosing our annual Pro plan at $99/year instead of $9.99/month. That's just $8.25/month - a savings of $20.88 per year compared to monthly billing."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your Pro subscription at any time from your account dashboard. Your pro features will remain active until the end of your current billing period, and you'll automatically return to the free plan."
    },
    {
      question: "Do you have an API for developers?",
      answer: "Yes! Pro users get access to our REST API, allowing you to integrate ResizeSuite's image processing capabilities into your own applications. Perfect for developers building custom solutions."
    },
    {
      question: "What browsers are supported?",
      answer: "ResizeSuite works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version of your browser for the best performance and security."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about ResizeSuite. Can't find what you're looking for? 
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact our support team</a>.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <Icon 
                  icon={openItems.includes(index) ? "solar:minus-circle-bold-duotone" : "solar:add-circle-bold-duotone"}
                  className={`h-6 w-6 text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-5">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
