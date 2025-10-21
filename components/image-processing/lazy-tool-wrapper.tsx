'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';

interface LazyToolWrapperProps {
  toolName: string;
  children: React.ReactNode;
}

// Loading skeleton component
function ToolLoadingSkeleton({ toolName }: { toolName: string }) {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-500 mb-2">
          Loading {toolName}...
        </h4>
        <p className="text-gray-400 text-sm">
          Initializing image processing tools
        </p>
        <div className="mt-4 space-y-2">
          <div className="h-2 bg-gray-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
          <div className="h-2 bg-gray-200 rounded-full w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
}

// Error boundary component
class ToolErrorBoundary extends React.Component<
  { children: React.ReactNode; toolName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; toolName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error loading ${this.props.toolName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <div className="text-center py-12">
            <Icon 
              icon="solar:danger-circle-bold-duotone" 
              className="h-16 w-16 text-red-400 mx-auto mb-4" 
            />
            <h4 className="text-lg font-medium text-gray-500 mb-2">
              Failed to Load {this.props.toolName}
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              There was an error loading the image processing tool. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Main lazy wrapper component
export function LazyToolWrapper({ toolName, children }: LazyToolWrapperProps) {
  return (
    <ToolErrorBoundary toolName={toolName}>
      <Suspense fallback={<ToolLoadingSkeleton toolName={toolName} />}>
        {children}
      </Suspense>
    </ToolErrorBoundary>
  );
}

// Higher-order component for lazy loading tools
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  toolName: string
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return function LazyLoadedComponent(props: T) {
    return (
      <LazyToolWrapper toolName={toolName}>
        <LazyComponent {...props} />
      </LazyToolWrapper>
    );
  };
}

// Utility function to create lazy-loaded tool components
export function createLazyTool<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  toolName: string
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyTool(props: T) {
    return (
      <LazyToolWrapper toolName={toolName}>
        <LazyComponent {...props} />
      </LazyToolWrapper>
    );
  };
}
