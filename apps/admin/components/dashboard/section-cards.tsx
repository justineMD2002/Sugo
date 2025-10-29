import { IconTrendingDown, IconTrendingUp, IconUsers, IconClipboardList, IconShoppingCart, IconTicket } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardStats } from "@/lib/api/dashboard"

interface SectionCardsProps {
  stats: DashboardStats
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShoppingCart className="size-4" />
              +{stats.ordersToday} today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            In progress <IconTrendingUp className="size-5" />
          </div>
          <div className="text-muted-foreground">
            Orders being delivered now
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Riders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeRiders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              +{stats.ridersThisWeek} this week
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Currently online <IconTrendingUp className="size-5" />
          </div>
          <div className="text-muted-foreground">
            Riders available for delivery
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Tickets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeTickets}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTicket className="size-4" />
              +{stats.ticketsToday} today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Service requests pending <IconTrendingUp className="size-5" />
          </div>
          <div className="text-muted-foreground">
            Plumbing, electrician, aircon repair
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Applications</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingApplications}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClipboardList className="size-4" />
              +{stats.applicationsToday} today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Awaiting review <IconTrendingUp className="size-5" />
          </div>
          <div className="text-muted-foreground">
            New rider applications pending
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
