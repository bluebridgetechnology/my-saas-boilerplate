'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface ToolHeaderProps {
  title: string;
  description: string;
  subtitle: string;
  icon: string;
  stats: Array<{
    icon: string;
    value: string;
    label: string;
    color: string;
  }>;
}

export function ToolPageHeader({ title, description, subtitle, icon, stats }: ToolHeaderProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-400';
      case 'green':
        return 'bg-green-500/20 border-green-400/30 text-green-400';
      case 'yellow':
        return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400';
      case 'purple':
        return 'bg-purple-500/20 border-purple-400/30 text-purple-400';
      case 'orange':
        return 'bg-orange-500/20 border-orange-400/30 text-orange-400';
      case 'emerald':
        return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400';
      default:
        return 'bg-blue-500/20 border-blue-400/30 text-blue-400';
    }
  };

  return (
    <section className="relative pt-24 pb-12 overflow-hidden">
      {/* Dashed Grid Background */}
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e7e5e4 1px, transparent 1px),
              linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)
            `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
      </div>
      
      {/* Content matching social-presets structure */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 text-center lg:text-left">
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
              {title}
            </h1>
            
            {/* Value Proposition */}
            <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
              {description}
            </p>
            
            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-1">
            {/* Mobile: Horizontal layout */}
            <div className="flex lg:hidden justify-center gap-6 mb-6">
              {stats.slice(0, 3).map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl border ${getColorClasses(stat.color)}`}>
                    <Icon icon={stat.icon} className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-300">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Vertical layout */}
            <div className="hidden lg:block space-y-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl border ${getColorClasses(stat.color)}`}>
                    <Icon icon={stat.icon} className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-300">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
