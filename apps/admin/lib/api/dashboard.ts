import { createClient } from "@/lib/supabase/client"
import { getApplicationStats } from "./applications"
import { getCustomerStats } from "./customers"
import { getOrderStats } from "./orders"
import { getRiderStats } from "./riders"
import { getTicketStats } from "./tickets"

export interface DashboardStats {
  // Overview stats
  totalOrders: number
  activeOrders: number
  totalRiders: number
  activeRiders: number
  totalTickets: number
  activeTickets: number
  pendingApplications: number
  
  // Revenue stats
  totalRevenue: number
  averageOrderValue: number
  
  // Growth stats
  ordersToday: number
  ridersThisWeek: number
  ticketsToday: number
  applicationsToday: number
}

export interface DashboardChartData {
  date: string
  orders: number
  serviceRequests: number
}

export interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  customer_address: string
  status: string
  total_amount: number
  created_at: string
  rider_name?: string
}

export interface RecentApplication {
  id: string
  applicant_name: string
  email: string
  phone_number: string
  experience: string
  status: string
  applied_at: string
}

export interface RecentTicket {
  id: string
  ticket_number: string
  customer_name: string
  service_type: string
  description: string
  priority: string
  status: string
  created_at: string
  technician_name?: string
}

export interface DashboardData {
  stats: DashboardStats
  chartData: DashboardChartData[]
  recentOrders: RecentOrder[]
  recentApplications: RecentApplication[]
  recentTickets: RecentTicket[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClient()
  
  // Get all stats in parallel
  const [
    applicationStats,
    customerStats,
    orderStats,
    riderStats,
    ticketStats
  ] = await Promise.all([
    getApplicationStats(),
    getCustomerStats(),
    getOrderStats(),
    getRiderStats(),
    getTicketStats()
  ])

  // Get chart data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: chartData, error: chartError } = await supabase
    .from("orders")
    .select("created_at, service_type")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true })

  if (chartError) {
    throw new Error(`Failed to fetch chart data: ${chartError.message}`)
  }

  // Process chart data
  const chartDataMap = new Map<string, { orders: number; serviceRequests: number }>()
  
  chartData?.forEach(order => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    const current = chartDataMap.get(date) || { orders: 0, serviceRequests: 0 }
    
    if (order.service_type === "delivery") {
      current.orders += 1
    } else {
      current.serviceRequests += 1
    }
    
    chartDataMap.set(date, current)
  })

  // Fill in missing dates with zeros
  const chartDataArray: DashboardChartData[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const data = chartDataMap.get(dateStr) || { orders: 0, serviceRequests: 0 }
    
    chartDataArray.push({
      date: dateStr,
      orders: data.orders,
      serviceRequests: data.serviceRequests
    })
  }

  // Get recent orders (last 4)
  const { data: recentOrdersData, error: recentOrdersError } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      total_amount,
      status,
      service_type,
      created_at,
      pickup_address,
      delivery_address,
      customer:users!orders_customer_id_fkey(full_name),
      delivery:deliveries!deliveries_order_id_fkey(
        rider:users!deliveries_rider_id_fkey(full_name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(4)

  if (recentOrdersError) {
    throw new Error(`Failed to fetch recent orders: ${recentOrdersError.message}`)
  }

  const recentOrders: RecentOrder[] = recentOrdersData?.map(order => {
    // Choose address based on service type
    const customer_address = order.service_type === "delivery" 
      ? order.delivery_address || order.pickup_address || "N/A"
      : order.pickup_address || order.delivery_address || "N/A"
    
    return {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer?.[0]?.full_name || "Unknown Customer",
      customer_address,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      rider_name: order.delivery?.[0]?.rider?.[0]?.full_name
    }
  }) || []

  // Get recent applications (last 3)
  const { data: recentApplicationsData, error: recentApplicationsError } = await supabase
    .from("rider_profiles")
    .select(`
      id,
      status,
      created_at,
      user:users!rider_profiles_user_id_fkey(full_name, email, phone_number)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(3)

  if (recentApplicationsError) {
    throw new Error(`Failed to fetch recent applications: ${recentApplicationsError.message}`)
  }

  const recentApplications: RecentApplication[] = recentApplicationsData?.map(app => ({
    id: app.id,
    applicant_name: app.user?.[0]?.full_name || "Unknown Applicant",
    email: app.user?.[0]?.email || "N/A",
    phone_number: app.user?.[0]?.phone_number || "N/A",
    experience: "N/A", // This would need to be calculated or stored separately
    status: app.status,
    applied_at: app.created_at
  })) || []

  // Get recent tickets (last 4)
  const { data: recentTicketsData, error: recentTicketsError } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      service_type,
      status,
      created_at,
      customer:users!tickets_customer_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(4)

  if (recentTicketsError) {
    throw new Error(`Failed to fetch recent tickets: ${recentTicketsError.message}`)
  }

  const recentTickets: RecentTicket[] = recentTicketsData?.map(ticket => ({
    id: ticket.id,
    ticket_number: ticket.ticket_number,
    customer_name: ticket.customer?.[0]?.full_name || "Unknown Customer",
    service_type: ticket.service_type,
    description: "N/A", // Not available in schema
    priority: "N/A", // Not available in schema
    status: ticket.status,
    created_at: ticket.created_at,
    technician_name: undefined // Not available in schema
  })) || []

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0]
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)

  const { count: ordersToday } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today)

  const { count: ticketsToday } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today)

  const { count: applicationsToday } = await supabase
    .from("rider_profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .gte("created_at", today)

  const { count: ridersThisWeek } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "rider")
    .gte("created_at", thisWeek.toISOString())

  // Combine all stats
  const stats: DashboardStats = {
    totalOrders: orderStats.total,
    activeOrders: orderStats.in_progress,
    totalRiders: riderStats.totalRiders,
    activeRiders: riderStats.onlineRiders,
    totalTickets: ticketStats.total,
    activeTickets: ticketStats.open + ticketStats.in_progress,
    pendingApplications: applicationStats.pendingApplications,
    totalRevenue: orderStats.total_revenue,
    averageOrderValue: orderStats.average_order_value,
    ordersToday: ordersToday || 0,
    ridersThisWeek: ridersThisWeek || 0,
    ticketsToday: ticketsToday || 0,
    applicationsToday: applicationsToday || 0
  }

  return {
    stats,
    chartData: chartDataArray,
    recentOrders,
    recentApplications,
    recentTickets
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const dashboardData = await getDashboardData()
  return dashboardData.stats
}

