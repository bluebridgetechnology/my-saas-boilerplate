"use client"

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AdminStats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  imagesProcessed: number
  activeUsers: number
  supportTickets: number
  userGrowth: number
  revenueGrowth: number
  conversionRate: number
  processingGrowth: number
}

export function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      // Load analytics and revenue data in parallel
      const [analyticsResponse, revenueResponse, supportResponse] = await Promise.all([
        fetch('/api/admin/analytics?timeRange=30d'),
        fetch('/api/admin/revenue?timeRange=30d'),
        fetch('/api/admin/support-tickets')
      ]);

      const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null;
      const revenue = revenueResponse.ok ? await revenueResponse.json() : null;
      const support = supportResponse.ok ? await supportResponse.json() : null;

      if (analytics && revenue) {
        // Calculate growth percentages (mock for now)
        const userGrowth = 12.5;
        const revenueGrowth = 8.3;
        const processingGrowth = 23.1;

        setStats({
          totalUsers: analytics.totalUsers || 0,
          proUsers: analytics.proUsers || 0,
          freeUsers: (analytics.totalUsers || 0) - (analytics.proUsers || 0),
          totalRevenue: revenue.totalRevenue || 0,
          monthlyRevenue: revenue.monthlyRevenue || 0,
          imagesProcessed: analytics.imagesProcessed || 0,
          activeUsers: analytics.activeUsers || 0,
          supportTickets: support?.pagination?.total || 0,
          userGrowth,
          revenueGrowth,
          conversionRate: analytics.conversionRate || 0,
          processingGrowth,
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Failed to load stats</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/20 dark:to-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="size-4 text-blue-600" />
            Total Users
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.totalUsers)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Icon icon="solar:arrow-up-bold-duotone" className="size-3" />
              +{stats.userGrowth}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growing steadily this month <Icon icon="solar:chart-2-bold-duotone" className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {formatNumber(stats.proUsers)} Pro • {formatNumber(stats.freeUsers)} Free
          </div>
        </CardContent>
      </Card>

      <Card className="@container/card bg-gradient-to-t from-green-50/50 to-card dark:from-green-950/20 dark:to-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon icon="solar:dollar-bold-duotone" className="size-4 text-green-600" />
            Monthly Revenue
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.monthlyRevenue)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Icon icon="solar:arrow-up-bold-duotone" className="size-3" />
              +{stats.revenueGrowth}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenue trending up <Icon icon="solar:chart-2-bold-duotone" className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {stats.conversionRate.toFixed(1)}% conversion rate
          </div>
        </CardContent>
      </Card>

      <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/20 dark:to-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon icon="solar:image-bold-duotone" className="size-4 text-purple-600" />
            Images Processed
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.imagesProcessed)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Icon icon="solar:arrow-up-bold-duotone" className="size-3" />
              +{stats.processingGrowth}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            High processing volume <Icon icon="solar:chart-2-bold-duotone" className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Platform usage growing
          </div>
        </CardContent>
      </Card>

      <Card className="@container/card bg-gradient-to-t from-orange-50/50 to-card dark:from-orange-950/20 dark:to-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon icon="solar:headphones-round-sound-bold-duotone" className="size-4 text-orange-600" />
            Support Tickets
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.supportTickets)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Icon icon="solar:check-circle-bold-duotone" className="size-3" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Support queue managed <Icon icon="solar:chat-round-dots-bold-duotone" className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {formatNumber(stats.activeUsers)} active users today
          </div>
        </CardContent>
      </Card>
    </div>
  )
}