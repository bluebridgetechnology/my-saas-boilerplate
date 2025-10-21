'use client';

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      value: '500K+',
      label: 'Images Processed Monthly',
      icon: 'solar:chart-bold-duotone',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Every month, professionals trust us with their most important images'
    },
    {
      value: '50K+',
      label: 'Happy Users',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Join a growing community of satisfied creators and businesses'
    },
    {
      value: '99.9%',
      label: 'Uptime',
      icon: 'solar:server-bold-duotone',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Reliable service you can count on, whenever you need it'
    },
    {
      value: '4.9/5',
      label: 'User Rating',
      icon: 'solar:star-bold-duotone',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Consistently high ratings from users across all platforms'
    }
  ];

  const trustFeatures = [
    {
      icon: 'solar:shield-check-bold-duotone',
      title: 'GDPR Compliant',
      description: 'Your data privacy is our priority',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: 'solar:server-minimalistic-bold-duotone',
      title: 'No Data Storage',
      description: 'Files processed locally, never stored',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: 'solar:bolt-bold-duotone',
      title: 'Lightning Fast',
      description: 'Process images in milliseconds',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: 'solar:clock-circle-bold-duotone',
      title: 'Always Available',
      description: '24/7 service with 99.9% uptime',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <section id="stats-section" className="relative py-12 bg-gray-50">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center group ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon Container */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} mb-3 group-hover:scale-105 transition-transform duration-300`}>
                <Icon icon={stat.icon} className={`h-5 w-5 ${stat.color}`} />
              </div>
              
              {/* Stats Content */}
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl group-hover:text-blue-600 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
