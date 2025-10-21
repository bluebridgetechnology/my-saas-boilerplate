'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  title: string;
  description: string;
}

export function FAQAccordion({ faqs, title, description }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {description}
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
                onClick={() => {
                  const newOpenItems = openItems.includes(index) 
                    ? openItems.filter(item => item !== index)
                    : [...openItems, index];
                  setOpenItems(newOpenItems);
                }}
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

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Icon icon="solar:letter-unread-bold-duotone" className="h-5 w-5 mr-2" />
                Contact Support
              </a>
              <a 
                href="/docs"
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-300"
              >
                <Icon icon="solar:book-bold-duotone" className="h-5 w-5 mr-2" />
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
