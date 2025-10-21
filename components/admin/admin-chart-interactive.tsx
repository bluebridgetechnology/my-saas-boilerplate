"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Icon } from '@iconify/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  users: {
    label: "Users",
    color: "var(--primary)",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function AdminChartInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d")
  const [chartData, setChartData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadChartData()
  }, [timeRange])

  const loadChartData = async () => {
    setIsLoading(true)
    try {
      // Load analytics and revenue data in parallel
      const [analyticsResponse, revenueResponse] = await Promise.all([
        fetch(`/api/admin/analytics?timeRange=${timeRange}`),
        fetch(`/api/admin/revenue?timeRange=${timeRange}`)
      ]);

      const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null;
      const revenue = revenueResponse.ok ? await revenueResponse.json() : null;

      if (analytics && revenue) {
        // Combine user growth and revenue growth data
        const userGrowth = analytics.userGrowth || [];
        const revenueGrowth = revenue.revenueGrowth || [];

        // Merge the data by date
        const combinedData = userGrowth.map((userPoint: any) => {
          const revenuePoint = revenueGrowth.find((r: any) => r.date === userPoint.date);
          return {
            date: userPoint.date,
            users: userPoint.users,
            revenue: revenuePoint?.revenue || 0,
          };
        });

        setChartData(combinedData);
      } else {
        // Fallback data if APIs fail
        setChartData([
          { date: "2024-01-01", users: 1000, revenue: 500 },
          { date: "2024-01-08", users: 1050, revenue: 650 },
          { date: "2024-01-15", users: 1100, revenue: 750 },
          { date: "2024-01-22", users: 1200, revenue: 820 },
          { date: "2024-01-29", users: 1247, revenue: 890 },
        ]);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Fallback data on error
      setChartData([
        { date: "2024-01-01", users: 1000, revenue: 500 },
        { date: "2024-01-08", users: 1050, revenue: 650 },
        { date: "2024-01-15", users: 1100, revenue: 750 },
        { date: "2024-01-22", users: 1200, revenue: 820 },
        { date: "2024-01-29", users: 1247, revenue: 890 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Growth Overview</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[250px] w-full animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:chart-2-bold-duotone" className="size-5 text-blue-600" />
              Growth Overview
            </CardTitle>
            <CardDescription>
              User growth and revenue trends over time
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" size="sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: any) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="users"
              type="natural"
              fill="url(#fillUsers)"
              stroke="var(--color-users)"
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}