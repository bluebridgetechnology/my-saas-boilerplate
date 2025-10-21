'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { AdminChartInteractive } from '@/components/admin/admin-chart-interactive';

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'user' | 'payment' | 'support' | 'system';
}

export default function AdminDashboard() {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load recent activity from actual data sources
      const response = await fetch('/api/admin/analytics/recent-activity');
      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }
      
      const data = await response.json();
      setRecentActivity(data.activities || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty array on error
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return 'solar:dollar-bold-duotone';
      case 'support':
        return 'solar:headphones-round-sound-bold-duotone';
      case 'user':
        return 'solar:user-bold-duotone';
      case 'system':
        return 'solar:settings-bold-duotone';
      default:
        return 'solar:info-circle-bold-duotone';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-green-600';
      case 'support':
        return 'text-orange-600';
      case 'user':
        return 'text-blue-600';
      case 'system':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of ResizeSuite performance and metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/settings">
              <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards />

      {/* Interactive Chart */}
      <AdminChartInteractive />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:activity-bold-duotone" className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 animate-pulse">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Icon 
                    icon={getActivityIcon(activity.type)} 
                    className={`h-5 w-5 ${getActivityColor(activity.type)}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/analytics">
                View All Activity
                <Icon icon="solar:arrow-right-bold-duotone" className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:lightning-bold-duotone" className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/users">
                <div className="text-center">
                  <Icon icon="solar:users-group-rounded-bold-duotone" className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Manage Users</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/support">
                <div className="text-center">
                  <Icon icon="solar:headphones-round-sound-bold-duotone" className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Support Tickets</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/feature-flags">
                <div className="text-center">
                  <Icon icon="solar:flag-bold-duotone" className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Feature Flags</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/admin/settings">
                <div className="text-center">
                  <Icon icon="solar:settings-bold-duotone" className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Settings</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}