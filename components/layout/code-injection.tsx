'use client';

import { useEffect, useState } from 'react';

interface CodeInjection {
  id: string;
  injection_name: string;
  injection_type: 'head' | 'body_start' | 'body_end' | 'analytics';
  injection_code: string;
  is_active: boolean;
  target_pages: string[];
  priority: number;
}

interface CodeInjectionProps {
  type: 'head' | 'body_start' | 'body_end' | 'analytics';
  currentPath?: string;
}

export function CodeInjection({ type, currentPath }: CodeInjectionProps) {
  const [injections, setInjections] = useState<CodeInjection[]>([]);

  useEffect(() => {
    fetchInjections();
  }, []);

  const fetchInjections = async () => {
    try {
      const response = await fetch('/api/admin/code-injections');
      if (response.ok) {
        const data = await response.json();
        setInjections(data);
      }
    } catch (error) {
      console.error('Error fetching code injections:', error);
    }
  };

  // Filter injections by type and current path
  const relevantInjections = injections
    .filter(injection => 
      injection.is_active && 
      injection.injection_type === type &&
      (injection.target_pages.length === 0 || injection.target_pages.includes(currentPath || ''))
    )
    .sort((a, b) => b.priority - a.priority); // Sort by priority (higher first)

  if (relevantInjections.length === 0) {
    return null;
  }

  return (
    <>
      {relevantInjections.map((injection) => (
        <div 
          key={injection.id}
          dangerouslySetInnerHTML={{ __html: injection.injection_code }}
        />
      ))}
    </>
  );
}

// Convenience components for different injection types
export function HeadCodeInjection({ currentPath }: { currentPath?: string }) {
  return <CodeInjection type="head" currentPath={currentPath} />;
}

export function BodyStartCodeInjection({ currentPath }: { currentPath?: string }) {
  return <CodeInjection type="body_start" currentPath={currentPath} />;
}

export function BodyEndCodeInjection({ currentPath }: { currentPath?: string }) {
  return <CodeInjection type="body_end" currentPath={currentPath} />;
}

export function AnalyticsCodeInjection({ currentPath }: { currentPath?: string }) {
  return <CodeInjection type="analytics" currentPath={currentPath} />;
}
