'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"
import { BarChart2, Users, Clock, Star } from 'lucide-react'

interface TemplateAnalytics {
  templateId: string
  usageCount: number
  successRate: number
  averageGenerationTime: number
  userRating: number
  lastUsed: string
}

export function TemplateAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [analytics, setAnalytics] = useState<TemplateAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('template_analytics')
        .select('*')
        .gte('created_at', getDateRange(timeRange))
        .order('created_at', { ascending: false })

      if (error) throw error

      setAnalytics(data || [])
    } catch (fetchError) {
      console.error('Failed to fetch analytics:', fetchError)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, timeRange, toast])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const getDateRange = (range: 'week' | 'month' | 'year') => {
    const date = new Date()
    switch (range) {
      case 'week':
        date.setDate(date.getDate() - 7)
        break
      case 'month':
        date.setMonth(date.getMonth() - 1)
        break
      case 'year':
        date.setFullYear(date.getFullYear() - 1)
        break
    }
    return date.toISOString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Template Analytics</h3>
        <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Usage</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {analytics.reduce((sum, a) => sum + a.usageCount, 0)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {Math.round(
              (analytics.reduce((sum, a) => sum + a.successRate, 0) / analytics.length) * 100
            )}%
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Avg. Generation Time</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {Math.round(
              analytics.reduce((sum, a) => sum + a.averageGenerationTime, 0) / analytics.length
            )}s
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Avg. Rating</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {(
              analytics.reduce((sum, a) => sum + a.userRating, 0) / analytics.length
            ).toFixed(1)}
          </p>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Usage Over Time</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics}>
              <XAxis dataKey="lastUsed" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usageCount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
} 