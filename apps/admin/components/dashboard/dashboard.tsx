"use client"

import * as React from "react"
import { ChartAreaInteractive } from "./chart-area-interactive"
import { RecentActivity } from "./recent-activity"
import { SectionCards } from "./section-cards"
import type { DashboardData, RecentApplication } from "@/lib/api/dashboard"

interface DashboardProps {
  data: DashboardData
}

// Memoize stable props to prevent unnecessary rerenders
const MemoizedSectionCards = React.memo(SectionCards)
const MemoizedChartArea = React.memo(ChartAreaInteractive)

export function Dashboard({ data: initialData }: DashboardProps) {
  // Only manage applications state locally - this is the only changing data
  const [recentApplications, setRecentApplications] = React.useState(initialData.recentApplications)
  
  React.useEffect(() => {
    setRecentApplications(initialData.recentApplications)
  }, [initialData.recentApplications])
  
  const handleApplicationsRefresh = React.useCallback((updatedApplications: RecentApplication[]) => {
    setRecentApplications(updatedApplications)
  }, [])
  
  // Memoize stable props
  const stats = React.useMemo(() => initialData.stats, [initialData.stats])
  const chartData = React.useMemo(() => initialData.chartData, [initialData.chartData])
  const recentOrders = React.useMemo(() => initialData.recentOrders, [initialData.recentOrders])
  const recentTickets = React.useMemo(() => initialData.recentTickets, [initialData.recentTickets])
  
  console.log(initialData)
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <MemoizedSectionCards stats={stats} />
          <div className="px-4 lg:px-6">
            <MemoizedChartArea chartData={chartData} />
          </div>
          <div className="px-4 lg:px-6">
            <RecentActivity 
              recentOrders={recentOrders}
              recentApplications={recentApplications}
              recentTickets={recentTickets}
              onApplicationsUpdate={handleApplicationsRefresh}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
