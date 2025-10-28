import { ChartAreaInteractive } from "./chart-area-interactive"
import { RecentActivity } from "./recent-activity"
import { SectionCards } from "./section-cards"
import type { DashboardData } from "@/lib/api/dashboard"

interface DashboardProps {
  data: DashboardData
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards stats={data.stats} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive chartData={data.chartData} />
          </div>
          <div className="px-4 lg:px-6">
            <RecentActivity 
              recentOrders={data.recentOrders}
              recentApplications={data.recentApplications}
              recentTickets={data.recentTickets}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
