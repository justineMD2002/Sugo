"use client"

import { useEffect, useState } from "react"
import { Dashboard } from "@/components/dashboard/dashboard"
import { getDashboardData } from "@/lib/api/dashboard"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"
import type { DashboardData } from "@/lib/api/dashboard"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const dashboardData = await getDashboardData()
      setData(dashboardData)
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Failed to load dashboard
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                There was an error loading the dashboard data. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }
  
  return <Dashboard data={data} />
}
