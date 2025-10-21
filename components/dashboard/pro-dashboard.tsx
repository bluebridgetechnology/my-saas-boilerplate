'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TierManager } from '@/lib/image-processing/download-manager';
import { UsageTracker, PerformanceMonitor } from '@/lib/image-processing/usage-tracking';

interface ProDashboardProps {
  userId: string;
  subscriptionStatus?: string;
  trialEnd?: string;
}

export function ProDashboard({ userId, subscriptionStatus, trialEnd }: ProDashboardProps) {
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load usage statistics
      const stats = UsageTracker.getAllStats();
      setUsageStats(stats);

      // Load performance metrics
      const metrics = PerformanceMonitor.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTrialActive = trialEnd && new Date(trialEnd) > new Date();
  const daysLeftInTrial = trialEnd ? Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAveragePerformance = (operationName: string): number => {
    const metrics = performanceMetrics[operationName];
    if (!metrics || metrics.length === 0) return 0;
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pro Dashboard</h2>
          <p className="text-gray-600">Monitor your usage and performance metrics</p>
        </div>
        
        {isTrialActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold-duotone" className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-semibold text-blue-900">Trial Active</div>
                <div className="text-xs text-blue-700">{daysLeftInTrial} days remaining</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pro Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="solar:folder-bold-duotone" className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Folder Upload</div>
              <div className="text-xs text-gray-500">Batch processing</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="solar:flash-bold-duotone" className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Priority Queue</div>
              <div className="text-xs text-gray-500">Faster processing</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="solar:archive-bold-duotone" className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">ZIP Downloads</div>
              <div className="text-xs text-gray-500">Batch downloads</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon icon="solar:settings-bold-duotone" className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Project Management</div>
              <div className="text-xs text-gray-500">Save & load projects</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
        
        {usageStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="solar:chart-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No usage data available yet</p>
            <p className="text-sm">Start using Pro features to see statistics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usageStats.map((stat) => (
              <div key={stat.featureName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:activity-bold-duotone" className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {stat.featureName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last used: {new Date(stat.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{stat.totalUsage}</div>
                  <div className="text-xs text-gray-500">total uses</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        
        {Object.keys(performanceMetrics).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="solar:speedometer-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No performance data available yet</p>
            <p className="text-sm">Process images to see performance metrics</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(performanceMetrics).map(([operation, times]) => {
              const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
              const minTime = Math.min(...times);
              const maxTime = Math.max(...times);
              
              return (
                <div key={operation} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <span className="text-xs text-gray-500">{times.length} samples</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-medium">{averageTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Min:</span>
                      <span className="font-medium">{minTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Max:</span>
                      <span className="font-medium">{maxTime.toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tier Limits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Pro Limits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max Images per Batch</span>
              <span className="text-sm font-semibold text-gray-900">100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max File Size</span>
              <span className="text-sm font-semibold text-gray-900">50 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Supported Formats</span>
              <span className="text-sm font-semibold text-gray-900">JPG, PNG, WebP, GIF, TIFF, SVG, PDF</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Folder Upload</span>
              <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Priority Processing</span>
              <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ZIP Downloads</span>
              <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Project Management</span>
              <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => window.open('/dashboard/billing', '_blank')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Icon icon="solar:card-bold-duotone" className="h-4 w-4" />
          Manage Billing
        </Button>
        
        <Button
          onClick={() => window.open('/dashboard/settings', '_blank')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Icon icon="solar:settings-bold-duotone" className="h-4 w-4" />
          Settings
        </Button>
        
        <Button
          onClick={() => {
            PerformanceMonitor.clearMarks();
            UsageTracker.clearAllData();
            loadDashboardData();
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
