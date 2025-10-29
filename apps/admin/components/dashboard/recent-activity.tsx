"use client"

import { IconPackage, IconUser, IconTools, IconFilter, IconCheck, IconX, IconClock, IconMapPin } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { RecentOrder, RecentApplication, RecentTicket } from "@/lib/api/dashboard"

interface RecentActivityProps {
  recentOrders: RecentOrder[]
  recentApplications: RecentApplication[]
  recentTickets: RecentTicket[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
    case "Assigned":
    case "in_progress":
    case "assigned":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Delivered":
    case "Completed":
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Pending":
    case "New":
    case "pending":
    case "new":
    case "open":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Picked Up":
    case "picked_up":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "Medium":
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Low":
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export function RecentActivity({ recentOrders, recentApplications, recentTickets }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 items-stretch">
      {/* Recent Orders */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconPackage className="size-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Delivery orders and their status</CardDescription>
            </div>
            <Button variant="ghost" className="h-10">
              See all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer_address}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₱{order.total_amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Applications */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-5" />
                Applications
              </CardTitle>
              <CardDescription>Rider applications awaiting review</CardDescription>
            </div>
            <Button variant="ghost" className="h-10">
              Review All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.applicant_name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{app.email}</div>
                      <div className="text-sm text-muted-foreground">{app.phone_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>{app.experience}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <IconCheck className="size-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Service Tickets */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconTools className="size-5" />
                Recent Services
              </CardTitle>
              <CardDescription>Plumbing, electrician, and aircon services</CardDescription>
            </div>
            <Button variant="ghost" className="h-10">
              Manage All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{ticket.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.service_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
