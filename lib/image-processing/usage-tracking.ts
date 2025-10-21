/**
 * Usage tracking and analytics utilities for Sprint 4
 */

export interface UsageEvent {
  userId: string;
  featureName: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface FeatureUsageStats {
  featureName: string;
  totalUsage: number;
  lastUsed: string;
  averageUsagePerDay: number;
  peakUsageDay: string;
}

export class UsageTracker {
  private static readonly STORAGE_KEY = 'resizesuite-usage-tracking';
  private static readonly MAX_LOCAL_EVENTS = 1000;

  /**
   * Track a feature usage event
   */
  static trackUsage(event: UsageEvent): void {
    try {
      const events = this.getStoredEvents();
      const newEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      };
      
      events.push(newEvent);
      
      // Keep only recent events to prevent storage bloat
      if (events.length > this.MAX_LOCAL_EVENTS) {
        events.splice(0, events.length - this.MAX_LOCAL_EVENTS);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
      
      // Send to server if user is authenticated
      this.sendToServer(newEvent);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  /**
   * Track image processing usage
   */
  static trackImageProcessing(
    userId: string,
    toolType: string,
    fileCount: number,
    totalSize: number,
    processingTime: number
  ): void {
    this.trackUsage({
      userId,
      featureName: `image_processing_${toolType}`,
      metadata: {
        fileCount,
        totalSize,
        processingTime,
        averageFileSize: totalSize / fileCount,
        filesPerSecond: fileCount / (processingTime / 1000)
      }
    });
  }

  /**
   * Track Pro feature usage
   */
  static trackProFeature(
    userId: string,
    featureName: string,
    metadata?: Record<string, any>
  ): void {
    this.trackUsage({
      userId,
      featureName: `pro_feature_${featureName}`,
      metadata: {
        ...metadata,
        isProFeature: true
      }
    });
  }

  /**
   * Track upgrade conversion events
   */
  static trackUpgradeConversion(
    userId: string,
    triggerFeature: string,
    planType: 'monthly' | 'yearly'
  ): void {
    this.trackUsage({
      userId,
      featureName: 'upgrade_conversion',
      metadata: {
        triggerFeature,
        planType,
        conversionValue: planType === 'yearly' ? 99 : 9.99
      }
    });
  }

  /**
   * Track error events
   */
  static trackError(
    userId: string,
    errorType: string,
    errorMessage: string,
    context?: Record<string, any>
  ): void {
    this.trackUsage({
      userId,
      featureName: 'error_occurred',
      metadata: {
        errorType,
        errorMessage,
        context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get usage statistics for a feature
   */
  static getFeatureStats(featureName: string): FeatureUsageStats | null {
    try {
      const events = this.getStoredEvents();
      const featureEvents = events.filter(e => e.featureName === featureName);
      
      if (featureEvents.length === 0) {
        return null;
      }

      const totalUsage = featureEvents.length;
      const lastUsed = featureEvents[featureEvents.length - 1].timestamp || '';
      
      // Calculate average usage per day
      const firstEvent = featureEvents[0];
      const lastEvent = featureEvents[featureEvents.length - 1];
      const daysDiff = Math.max(1, 
        (new Date(lastEvent.timestamp || '').getTime() - new Date(firstEvent.timestamp || '').getTime()) / (1000 * 60 * 60 * 24)
      );
      const averageUsagePerDay = totalUsage / daysDiff;

      // Find peak usage day
      const usageByDay = featureEvents.reduce((acc, event) => {
        const day = new Date(event.timestamp || '').toDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const peakUsageDay = Object.entries(usageByDay)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return {
        featureName,
        totalUsage,
        lastUsed,
        averageUsagePerDay: Math.round(averageUsagePerDay * 100) / 100,
        peakUsageDay
      };
    } catch (error) {
      console.error('Error getting feature stats:', error);
      return null;
    }
  }

  /**
   * Get all usage statistics
   */
  static getAllStats(): FeatureUsageStats[] {
    try {
      const events = this.getStoredEvents();
      const featureNames = [...new Set(events.map(e => e.featureName))];
      
      return featureNames
        .map(featureName => this.getFeatureStats(featureName))
        .filter((stats): stats is FeatureUsageStats => stats !== null);
    } catch (error) {
      console.error('Error getting all stats:', error);
      return [];
    }
  }

  /**
   * Clear all usage data
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing usage data:', error);
    }
  }

  /**
   * Export usage data
   */
  static exportData(): string {
    try {
      const events = this.getStoredEvents();
      return JSON.stringify(events, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '[]';
    }
  }

  /**
   * Get stored events from localStorage
   */
  private static getStoredEvents(): UsageEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored events:', error);
      return [];
    }
  }

  /**
   * Send usage event to server
   */
  private static async sendToServer(event: UsageEvent): Promise<void> {
    try {
      // In a real app, this would send to your analytics API
      // For now, we'll just log it
      console.log('Usage event:', event);
      
      // Example of what the API call would look like:
      // await fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Error sending to server:', error);
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static readonly PERFORMANCE_MARKS = 'resizesuite-performance-marks';

  /**
   * Start performance monitoring
   */
  static startTiming(operationName: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${operationName}-start`);
    }
  }

  /**
   * End performance monitoring and record metrics
   */
  static endTiming(operationName: string, userId?: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${operationName}-end`);
      performance.measure(operationName, `${operationName}-start`, `${operationName}-end`);
      
      const measures = performance.getEntriesByName(operationName, 'measure');
      const duration = measures[measures.length - 1]?.duration || 0;
      
      // Track performance metrics
      if (userId) {
        UsageTracker.trackUsage({
          userId,
          featureName: 'performance_metrics',
          metadata: {
            operationName,
            duration,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      return duration;
    }
    return 0;
  }

  /**
   * Get performance metrics
   */
  static getPerformanceMetrics(): Record<string, number[]> {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const measures = performance.getEntriesByType('measure');
      const metrics: Record<string, number[]> = {};
      
      measures.forEach(measure => {
        if (!metrics[measure.name]) {
          metrics[measure.name] = [];
        }
        metrics[measure.name].push(measure.duration);
      });
      
      return metrics;
    }
    return {};
  }

  /**
   * Clear performance marks
   */
  static clearMarks(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

/**
 * Error tracking utilities
 */
export class ErrorTracker {
  /**
   * Track JavaScript errors
   */
  static trackError(error: Error, context?: Record<string, any>): void {
    UsageTracker.trackError(
      'anonymous', // Would be actual user ID in real app
      'javascript_error',
      error.message,
      {
        stack: error.stack,
        ...context
      }
    );
  }

  /**
   * Track image processing errors
   */
  static trackProcessingError(
    userId: string,
    toolType: string,
    error: Error,
    fileInfo?: { name: string; size: number; type: string }
  ): void {
    UsageTracker.trackError(
      userId,
      'image_processing_error',
      error.message,
      {
        toolType,
        fileInfo,
        stack: error.stack
      }
    );
  }

  /**
   * Initialize global error tracking
   */
  static initialize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.trackError(event.error, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error(event.reason), {
          type: 'unhandled_promise_rejection'
        });
      });
    }
  }
}
