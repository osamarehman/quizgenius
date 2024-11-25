'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from '@tremor/react'

const performanceData = [
  { date: 'Mon', score: 85 },
  { date: 'Tue', score: 78 },
  { date: 'Wed', score: 90 },
  { date: 'Thu', score: 88 },
  { date: 'Fri', score: 92 },
  { date: 'Sat', score: 85 },
  { date: 'Sun', score: 94 },
]

export function PerformanceGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <LineChart
            data={performanceData}
            index="date"
            categories={["score"]}
            colors={["#4F46E5"]}
            yAxisWidth={40}
            showLegend={false}
            showXAxis={true}
            showYAxis={true}
            showGridLines={false}
            valueFormatter={(value) => `${value}%`}
          />
        </div>
      </CardContent>
    </Card>
  )
} 