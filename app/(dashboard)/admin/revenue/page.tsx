'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
  lifetimeValue: number;
  revenueGrowth: Array<{ date: string; revenue: number }>;
  subscriptionBreakdown: Array<{ plan: string; count: number; revenue: number }>;
  monthlyRecurringRevenue: Array<{ month: string; mrr: number }>;
  topCustomers: Array<{ email: string; revenue: number; plan: string }>;
  refunds: Array<{ date: string; amount: number; reason: string }>;
}

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadRevenueData();
  }, [timeRange]);

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/revenue?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      setRevenue(data);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      // Fallback to null on error
      setRevenue(null);
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

  if (!revenue) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:dollar-bold-duotone" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data</h3>
        <p className="text-gray-600">Revenue data is not available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600">Track revenue, subscriptions, and financial metrics</p>
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
          <Button onClick={loadRevenueData} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Icon icon="solar:wallet-money-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All-time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Icon icon="solar:dollar-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <Icon icon="solar:chart-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly Recurring Revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Icon icon="solar:user-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue.averageRevenuePerUser)}</div>
            <p className="text-xs text-muted-foreground">
              Average Revenue Per User
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Icon icon="solar:arrow-up-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(revenue.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              Free to Pro conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Icon icon="solar:arrow-down-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(revenue.churnRate)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly churn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV</CardTitle>
            <Icon icon="solar:star-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue.lifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              Customer Lifetime Value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:chart-2-bold-duotone" className="h-5 w-5" />
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

        {/* MRR Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:chart-bold-duotone" className="h-5 w-5" />
              MRR Trend
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

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="h-5 w-5" />
            Subscription Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenue.subscriptionBreakdown.map((subscription) => (
              <div key={subscription.plan} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon icon="solar:crown-bold-duotone" className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{subscription.plan}</div>
                    <div className="text-sm text-gray-600">{formatNumber(subscription.count)} subscribers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(subscription.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">monthly revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:star-bold-duotone" className="h-5 w-5" />
            Top Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenue.topCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-600">{customer.plan}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(customer.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">total revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refunds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5" />
            Recent Refunds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenue.refunds.map((refund, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">{formatCurrency(refund.amount)}</div>
                    <div className="text-sm text-red-700">{refund.reason}</div>
                  </div>
                </div>
                <div className="text-sm text-red-600">
                  {new Date(refund.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
