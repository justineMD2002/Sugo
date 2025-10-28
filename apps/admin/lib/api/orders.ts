import { createClient } from "@/lib/supabase/server"
import type { Order, Delivery, OrdersResponse, OrdersFilters, OrderStats, User } from "../types"

export async function getOrders(
  page: number = 1,
  limit: number = 10,
  filters: OrdersFilters = {}
): Promise<OrdersResponse> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.service_type) {
    query = query.eq("service_type", filters.service_type)
  }

  if (filters.customer_id) {
    query = query.eq("customer_id", filters.customer_id)
  }

  if (filters.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,item_description.ilike.%${filters.search}%,receiver_name.ilike.%${filters.search}%`)
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte("created_at", filters.date_to)
  }

  // Apply sorting
  const sortBy = filters.sortBy || "created_at"
  const sortOrder = filters.sortOrder || "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  return data
}

export async function updateOrderStatus(
  id: string, 
  status: Order["status"]
): Promise<Order> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`)
  }

  return data
}

export async function createOrder(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return data
}

export async function getOrdersByCustomer(customer_id: string, page: number = 1, limit: number = 10): Promise<OrdersResponse> {
  return getOrders(page, limit, { customer_id })
}

export async function getDeliveriesByRider(rider_id: string, page: number = 1, limit: number = 10): Promise<{
  data: Delivery[]
  count: number
  page: number
  limit: number
  totalPages: number
}> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from("deliveries")
    .select("*", { count: "exact" })
    .eq("rider_id", rider_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch deliveries: ${error.message}`)
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getOrdersWithDetails(
  page: number = 1,
  limit: number = 10,
  filters: OrdersFilters = {}
): Promise<{
  data: Array<Order & {
    customer: User
    rider?: User
    delivery?: Delivery
  }>
  count: number
  page: number
  limit: number
  totalPages: number
}> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  // First, get the orders
  let ordersQuery = supabase
    .from("orders")
    .select("*", { count: "exact" })

  // Apply filters
  if (filters.status) {
    ordersQuery = ordersQuery.eq("status", filters.status)
  }

  if (filters.service_type) {
    ordersQuery = ordersQuery.eq("service_type", filters.service_type)
  }

  if (filters.customer_id) {
    ordersQuery = ordersQuery.eq("customer_id", filters.customer_id)
  }

  if (filters.search) {
    ordersQuery = ordersQuery.or(`order_number.ilike.%${filters.search}%,item_description.ilike.%${filters.search}%,receiver_name.ilike.%${filters.search}%`)
  }

  if (filters.date_from) {
    ordersQuery = ordersQuery.gte("created_at", filters.date_from)
  }

  if (filters.date_to) {
    ordersQuery = ordersQuery.lte("created_at", filters.date_to)
  }

  // Apply sorting
  const sortBy = filters.sortBy || "created_at"
  const sortOrder = filters.sortOrder || "desc"
  ordersQuery = ordersQuery.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  ordersQuery = ordersQuery.range(offset, offset + limit - 1)

  const { data: orders, error: ordersError, count } = await ordersQuery

  if (ordersError) {
    throw new Error(`Failed to fetch orders: ${ordersError.message}`)
  }

  if (!orders || orders.length === 0) {
    return {
      data: [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  // Get unique customer IDs and rider IDs
  const customerIds = [...new Set(orders.map(order => order.customer_id))]
  const orderIds = orders.map(order => order.id)

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from("users")
    .select("*")
    .in("id", customerIds)

  if (customersError) {
    throw new Error(`Failed to fetch customers: ${customersError.message}`)
  }

  // Fetch deliveries
  const { data: deliveries, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("*")
    .in("order_id", orderIds)

  if (deliveriesError) {
    throw new Error(`Failed to fetch deliveries: ${deliveriesError.message}`)
  }

  // Get unique rider IDs from deliveries
  const riderIds = [...new Set(deliveries?.map(delivery => delivery.rider_id).filter(Boolean) || [])]

  // Fetch riders
  let riders: User[] = []
  if (riderIds.length > 0) {
    const { data: ridersData, error: ridersError } = await supabase
      .from("users")
      .select("*")
      .in("id", riderIds)

    if (ridersError) {
      throw new Error(`Failed to fetch riders: ${ridersError.message}`)
    }
    riders = ridersData || []
  }

  // Create lookup maps
  const customersMap = new Map(customers?.map(customer => [customer.id, customer]) || [])
  const ridersMap = new Map(riders.map(rider => [rider.id, rider]))
  const deliveriesMap = new Map(deliveries?.map(delivery => [delivery.order_id, delivery]) || [])

  // Combine the data
  const ordersWithDetails = orders.map(order => {
    const customer = customersMap.get(order.customer_id)
    const delivery = deliveriesMap.get(order.id)
    const rider = delivery?.rider_id ? ridersMap.get(delivery.rider_id) : undefined

    if (!customer) {
      throw new Error(`Customer not found for order ${order.id}`)
    }

    return {
      ...order,
      customer,
      rider,
      delivery
    }
  })

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: ordersWithDetails,
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getOrderStats(): Promise<OrderStats> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("orders")
    .select("status, total_amount")

  if (error) {
    throw new Error(`Failed to fetch order stats: ${error.message}`)
  }

  const stats = {
    total: data.length,
    pending: 0,
    in_progress: 0,
    delivered: 0,
    cancelled: 0,
    total_revenue: 0,
    average_order_value: 0
  }

  data.forEach(order => {
    switch (order.status) {
      case "Pending":
        stats.pending++
        break
      case "In Progress":
      case "Picked Up":
        stats.in_progress++
        break
      case "Delivered":
        stats.delivered++
        stats.total_revenue += order.total_amount
        break
      case "Cancelled":
        stats.cancelled++
        break
    }
  })

  stats.average_order_value = stats.delivered > 0 ? stats.total_revenue / stats.delivered : 0

  return stats
}
