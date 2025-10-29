import { createClient } from "@/lib/supabase/client"

export interface Rider {
  id: string
  rider: string
  contact: string
  email: string
  vehicle: string
  status: "online" | "offline" | "busy"
  rating: number
  ratingCount: number
  earnings: number
  plateNumber: string
}

export interface RidersFilters {
  search?: string
  status?: "online" | "offline" | "busy"
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface RidersResponse {
  data: Rider[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export async function getRidersWithDetails(
  page: number = 1,
  limit: number = 10,
  filters: RidersFilters = {}
): Promise<RidersResponse> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  // First, get all riders (users with user_type = 'rider')
  let ridersQuery = supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("user_type", "rider")

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    ridersQuery = ridersQuery.or(
      `full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    )
  }

  // Note: Status filtering will be applied after fetching rider profiles
  // since status is determined by is_online and is_available in rider_profiles table

  // Apply sorting
  const sortBy = filters.sortBy || "full_name"
  const sortOrder = filters.sortOrder || "asc"
  ridersQuery = ridersQuery.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  ridersQuery = ridersQuery.range(offset, offset + limit - 1)

  const { data: riders, error: ridersError, count } = await ridersQuery

  if (ridersError) {
    throw new Error(`Failed to fetch riders: ${ridersError.message}`)
  }

  if (!riders || riders.length === 0) {
    return {
      data: [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  // Get rider IDs for counting deliveries and calculating earnings
  const riderIds = riders.map(rider => rider.id)

  // Get deliveries for each rider to calculate earnings and delivery count
  const { data: deliveriesData, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("rider_id, earnings, status")
    .in("rider_id", riderIds)

  if (deliveriesError) {
    throw new Error(`Failed to fetch deliveries: ${deliveriesError.message}`)
  }

  // Get rider profiles for additional data (vehicle, plate number, etc.)
  const { data: profilesData, error: profilesError } = await supabase
    .from("rider_profiles")
    .select("user_id, service_type, vehicle_brand, vehicle_model, vehicle_color, plate_number, is_available, is_verified, is_online")
    .in("user_id", riderIds)

  if (profilesError) {
    throw new Error(`Failed to fetch rider profiles: ${profilesError.message}`)
  }

  // Create lookup maps
  const deliveriesMap = new Map<string, { earnings: number; deliveryCount: number }>()
  const profilesMap = new Map<string, { vehicle: string; plateNumber: string; status: string; serviceType: string }>()

  // Process deliveries data
  deliveriesData?.forEach(delivery => {
    const current = deliveriesMap.get(delivery.rider_id) || { earnings: 0, deliveryCount: 0 }
    deliveriesMap.set(delivery.rider_id, {
      earnings: current.earnings + (delivery.earnings || 0),
      deliveryCount: current.deliveryCount + 1
    })
  })

  // Process profiles data
  profilesData?.forEach(profile => {
    const vehicleName = profile.vehicle_brand && profile.vehicle_model 
      ? `${profile.vehicle_brand} ${profile.vehicle_model}` 
      : profile.vehicle_brand || profile.vehicle_model || "Unknown Vehicle"
    
    const status = profile.is_online ? "online" : profile.is_available ? "busy" : "offline"
    
    profilesMap.set(profile.user_id, {
      vehicle: vehicleName,
      plateNumber: profile.plate_number || "N/A",
      status: status,
      serviceType: profile.service_type
    })
  })

  // Combine rider data with statistics
  let ridersWithDetails: Rider[] = riders.map(rider => {
    const deliveryStats = deliveriesMap.get(rider.id) || { earnings: 0, deliveryCount: 0 }
    const profile = profilesMap.get(rider.id) || { vehicle: "Unknown Vehicle", plateNumber: "N/A", status: "offline", serviceType: "delivery" }
    
    return {
      id: rider.id,
      rider: rider.full_name,
      contact: rider.phone_number,
      email: rider.email || "",
      vehicle: profile.vehicle,
      status: profile.status as "online" | "offline" | "busy",
      rating: rider.rating || 0,
      ratingCount: deliveryStats.deliveryCount, // Using delivery count as rating count for now
      earnings: deliveryStats.earnings,
      plateNumber: profile.plateNumber,
    }
  })

  // Apply status filtering after combining data
  if (filters.status) {
    ridersWithDetails = ridersWithDetails.filter(rider => rider.status === filters.status)
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: ridersWithDetails,
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getRiderById(id: string): Promise<Rider | null> {
  const supabase = createClient()
  
  // Get rider data
  const { data: rider, error: riderError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("user_type", "rider")
    .single()

  if (riderError || !rider) {
    return null
  }

  // Get rider profile
  const { data: profile, error: profileError } = await supabase
    .from("rider_profiles")
    .select("service_type, vehicle_brand, vehicle_model, vehicle_color, plate_number, is_available, is_verified, is_online")
    .eq("user_id", id)
    .single()

  // Get delivery statistics
  const { data: deliveriesData, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("earnings")
    .eq("rider_id", id)

  if (deliveriesError) {
    throw new Error(`Failed to fetch deliveries: ${deliveriesError.message}`)
  }

  const totalEarnings = deliveriesData?.reduce((sum, delivery) => sum + (delivery.earnings || 0), 0) || 0
  const deliveryCount = deliveriesData?.length || 0

  const vehicleName = profile?.vehicle_brand && profile?.vehicle_model 
    ? `${profile.vehicle_brand} ${profile.vehicle_model}` 
    : profile?.vehicle_brand || profile?.vehicle_model || "Unknown Vehicle"
  
  const status = profile?.is_online ? "online" : profile?.is_available ? "busy" : "offline"

  return {
    id: rider.id,
    rider: rider.full_name,
    contact: rider.phone_number,
    email: rider.email || "",
    vehicle: vehicleName,
    status: status as "online" | "offline" | "busy",
    rating: rider.rating || 0,
    ratingCount: deliveryCount,
    earnings: totalEarnings,
    plateNumber: profile?.plate_number || "N/A",
  }
}

export async function getRiderStats(): Promise<{
  totalRiders: number
  onlineRiders: number
  offlineRiders: number
  busyRiders: number
  totalEarnings: number
  averageEarningsPerRider: number
}> {
  const supabase = createClient()
  
  // Get total riders count
  const { count: totalRiders, error: ridersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "rider")

  if (ridersError) {
    throw new Error(`Failed to fetch riders count: ${ridersError.message}`)
  }

  // Get rider status counts
  const { data: statusData, error: statusError } = await supabase
    .from("rider_profiles")
    .select("is_online, is_available")

  if (statusError) {
    throw new Error(`Failed to fetch rider status: ${statusError.message}`)
  }

  const statusCounts = statusData?.reduce((acc, profile) => {
    const status = profile.is_online ? "online" : profile.is_available ? "busy" : "offline"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Get total earnings
  const { data: earningsData, error: earningsError } = await supabase
    .from("deliveries")
    .select("earnings")

  if (earningsError) {
    throw new Error(`Failed to fetch earnings: ${earningsError.message}`)
  }

  const totalEarnings = earningsData?.reduce((sum, delivery) => sum + (delivery.earnings || 0), 0) || 0
  const riders = totalRiders || 0

  return {
    totalRiders: riders,
    onlineRiders: statusCounts.online || 0,
    offlineRiders: statusCounts.offline || 0,
    busyRiders: statusCounts.busy || 0,
    totalEarnings,
    averageEarningsPerRider: riders > 0 ? Math.round(totalEarnings / riders * 100) / 100 : 0
  }
}