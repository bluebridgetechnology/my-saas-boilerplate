'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface AnalyticsData {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  proUsers: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  imagesProcessed: number;
  averageProcessingTime: number;
  supportTickets: number;
  userGrowth: Array<{ date: string; users: number }>;
  revenueGrowth: Array<{ date: string; revenue: number }>;
  featureUsage: Array<{ feature: string; usage: number }>;
  topCountries: Array<{ country: string; users: number }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to null on error
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:chart-bold-duotone" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Analytics data is not available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Icon icon="solar:users-group-rounded-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.newUsers || 0} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Icon icon="solar:user-check-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.activeUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(analytics?.totalUsers ? ((analytics?.activeUsers || 0) / analytics.totalUsers) * 100 : 0)} of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Icon icon="solar:chart-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics?.conversionRate || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Free to Pro conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Icon icon="solar:dollar-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <Icon icon="solar:wallet-money-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.averageRevenuePerUser || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly ARPU
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Icon icon="solar:user-minus-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics?.churnRate || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly churn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Processed</CardTitle>
            <Icon icon="solar:image-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.imagesProcessed || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.averageProcessingTime || 0}s avg processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:chart-2-bold-duotone" className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Icon icon="solar:chart-bold-duotone" className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Chart visualization would go here</p>
                <p className="text-xs text-gray-500">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:dollar-bold-duotone" className="h-5 w-5" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Icon icon="solar:chart-bold-duotone" className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Chart visualization would go here</p>
                <p className="text-xs text-gray-500">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:settings-bold-duotone" className="h-5 w-5" />
            Feature Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.featureUsage?.length > 0 ? (
              analytics.featureUsage.map((feature, index) => (
                <div key={feature.feature} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{feature.feature}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${analytics?.totalUsers ? (feature.usage / analytics.totalUsers) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {formatNumber(feature.usage)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No feature usage data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:globe-bold-duotone" className="h-5 w-5" />
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.topCountries?.length > 0 ? (
              analytics.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${analytics?.totalUsers ? (country.users / analytics.totalUsers) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {formatNumber(country.users)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No country data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
