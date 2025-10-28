import { createClient } from "@/lib/supabase/server"

export interface Customer {
  id: string
  customer: string
  contact: string
  email: string
  orders_count: number
  services_count: number
}

export interface CustomersFilters {
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CustomersResponse {
  data: Customer[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export async function getCustomersWithDetails(
  page: number = 1,
  limit: number = 10,
  filters: CustomersFilters = {}
): Promise<CustomersResponse> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  // First, get all customers (users with user_types = 'customer')
  let customersQuery = supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("user_type", "customer")

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    customersQuery = customersQuery.or(
      `full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    )
  }

  // Apply sorting
  const sortBy = filters.sortBy || "full_name"
  const sortOrder = filters.sortOrder || "asc"
  customersQuery = customersQuery.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  customersQuery = customersQuery.range(offset, offset + limit - 1)

  const { data: customers, error: customersError, count } = await customersQuery

  if (customersError) {
    throw new Error(`Failed to fetch customers: ${customersError.message}`)
  }

  if (!customers || customers.length === 0) {
    return {
      data: [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  // Get customer IDs for counting orders and services
  const customerIds = customers.map(customer => customer.id)

  // Count orders for each customer
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id")
    .in("customer_id", customerIds)

  if (ordersError) {
    throw new Error(`Failed to fetch orders count: ${ordersError.message}`)
  }

  // Count services for each customer (assuming services are tracked in orders with service_type)
  const { data: servicesData, error: servicesError } = await supabase
    .from("orders")
    .select("customer_id, service_type")
    .in("customer_id", customerIds)
    .neq("service_type", "delivery") // Exclude delivery orders, only count actual services

  if (servicesError) {
    throw new Error(`Failed to fetch services count: ${servicesError.message}`)
  }

  // Create lookup maps for counts
  const ordersCountMap = new Map<string, number>()
  const servicesCountMap = new Map<string, number>()

  // Count orders per customer
  ordersData?.forEach(order => {
    const currentCount = ordersCountMap.get(order.customer_id) || 0
    ordersCountMap.set(order.customer_id, currentCount + 1)
  })

  // Count services per customer
  servicesData?.forEach(service => {
    const currentCount = servicesCountMap.get(service.customer_id) || 0
    servicesCountMap.set(service.customer_id, currentCount + 1)
  })

  // Combine customer data with counts
  const customersWithCounts: Customer[] = customers.map(customer => ({
    id: customer.id,
    customer: customer.full_name,
    contact: customer.phone_number,
    email: customer.email || "",
    orders_count: ordersCountMap.get(customer.id) || 0,
    services_count: servicesCountMap.get(customer.id) || 0,
  }))

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: customersWithCounts,
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  
  // Get customer data
  const { data: customer, error: customerError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("user_type", "customer")
    .single()

  if (customerError || !customer) {
    return null
  }

  // Count orders for this customer
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("customer_id", id)

  if (ordersError) {
    throw new Error(`Failed to fetch orders count: ${ordersError.message}`)
  }

  // Count services for this customer
  const { data: servicesData, error: servicesError } = await supabase
    .from("orders")
    .select("customer_id, service_type")
    .eq("customer_id", id)
    .neq("service_type", "delivery")

  if (servicesError) {
    throw new Error(`Failed to fetch services count: ${servicesError.message}`)
  }

  return {
    id: customer.id,
    customer: customer.full_name,
    contact: customer.phone_number,
    email: customer.email || "",
    orders_count: ordersData?.length || 0,
    services_count: servicesData?.length || 0,
  }
}

export async function getCustomerStats(): Promise<{
  totalCustomers: number
  totalOrders: number
  totalServices: number
  averageOrdersPerCustomer: number
  averageServicesPerCustomer: number
}> {
  const supabase = await createClient()
  
  // Get total customers count
  const { count: totalCustomers, error: customersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "customer")

  if (customersError) {
    throw new Error(`Failed to fetch customers count: ${customersError.message}`)
  }

  // Get total orders count
  const { count: totalOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })

  if (ordersError) {
    throw new Error(`Failed to fetch orders count: ${ordersError.message}`)
  }

  // Get total services count (excluding delivery orders)
  const { count: totalServices, error: servicesError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .neq("service_type", "delivery")

  if (servicesError) {
    throw new Error(`Failed to fetch services count: ${servicesError.message}`)
  }

  const customers = totalCustomers || 0
  const orders = totalOrders || 0
  const services = totalServices || 0
  
  return {
    totalCustomers: customers,
    totalOrders: orders,
    totalServices: services,
    averageOrdersPerCustomer: customers > 0 ? Math.round(orders / customers * 100) / 100 : 0,
    averageServicesPerCustomer: customers > 0 ? Math.round(services / customers * 100) / 100 : 0
  }
}