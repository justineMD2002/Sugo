import { createClient } from "@/lib/supabase/client"

export interface Application {
  id: string
  applicant: string
  contact: string
  address: string
  vehicle: string
  plateNumber: string
  appliedDate: string
  status: "pending" | "approved" | "rejected"
  email: string
  serviceType: string
}

export interface ApplicationsFilters {
  search?: string
  status?: "pending" | "approved" | "rejected"
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface ApplicationsResponse {
  data: Application[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export async function getApplicationsWithDetails(
  page: number = 1,
  limit: number = 10,
  filters: ApplicationsFilters = {}
): Promise<ApplicationsResponse> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  // First, get all applications (rider_profiles with status = 'pending')
  let applicationsQuery = supabase
    .from("rider_profiles")
    .select(`
      *,
      user:users!rider_profiles_user_id_fkey(*)
    `, { count: "exact" })
    .eq("status", "pending")

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    applicationsQuery = applicationsQuery.or(
      `plate_number.ilike.%${searchTerm}%,vehicle_brand.ilike.%${searchTerm}%,vehicle_model.ilike.%${searchTerm}%`
    )
  }

  // Apply status filter (only pending applications are shown)
  if (filters.status && filters.status !== "pending") {
    // If filtering for non-pending status, return empty results
    return {
      data: [],
      count: 0,
      page,
      limit,
      totalPages: 0
    }
  }

  // Apply sorting
  const sortBy = filters.sortBy || "created_at"
  const sortOrder = filters.sortOrder || "desc"
  applicationsQuery = applicationsQuery.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  applicationsQuery = applicationsQuery.range(offset, offset + limit - 1)

  const { data: applications, error: applicationsError, count } = await applicationsQuery

  if (applicationsError) {
    throw new Error(`Failed to fetch applications: ${applicationsError.message}`)
  }

  if (!applications || applications.length === 0) {
    return {
      data: [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  // Transform the data to match Application interface
  const applicationsWithDetails: Application[] = applications.map(app => {
    const user = app.user
    const vehicleName = app.vehicle_brand && app.vehicle_model 
      ? `${app.vehicle_brand} ${app.vehicle_model}` 
      : app.vehicle_brand || app.vehicle_model || "Unknown Vehicle"
    
    return {
      id: app.id,
      applicant: user?.full_name || "Unknown Applicant",
      contact: user?.phone_number || "N/A",
      address: user?.address || "N/A", // Assuming address is stored in users table
      vehicle: vehicleName,
      plateNumber: app.plate_number || "N/A",
      appliedDate: app.created_at,
      status: "pending",
      email: user?.email || "N/A",
      serviceType: app.service_type
    }
  })

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: applicationsWithDetails,
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const supabase = createClient()
  
  // Get application data
  const { data: application, error: applicationError } = await supabase
    .from("rider_profiles")
    .select(`
      *,
      user:users!rider_profiles_user_id_fkey(*)
    `)
    .eq("id", id)
    .eq("status", "pending")
    .single()

  if (applicationError || !application) {
    return null
  }

  const user = application.user
  const vehicleName = application.vehicle_brand && application.vehicle_model 
    ? `${application.vehicle_brand} ${application.vehicle_model}` 
    : application.vehicle_brand || application.vehicle_model || "Unknown Vehicle"

  return {
    id: application.id,
    applicant: user?.full_name || "Unknown Applicant",
    contact: user?.phone_number || "N/A",
    address: user?.address || "N/A",
    vehicle: vehicleName,
    plateNumber: application.plate_number || "N/A",
    appliedDate: application.created_at,
    status: "pending",
    email: user?.email || "N/A",
    serviceType: application.service_type
  }
}

export async function updateApplicationStatus(
  id: string, 
  status: "pending" | "approved" | "rejected"
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("rider_profiles")
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    throw new Error(`Failed to update application status: ${error.message}`)
  }
}

export async function getApplicationStats(): Promise<{
  totalApplications: number
  pendingApplications: number
}> {
  const supabase = createClient()
  
  // Get total applications count (only pending)
  const { count: totalApplications, error: applicationsError } = await supabase
    .from("rider_profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  if (applicationsError) {
    throw new Error(`Failed to fetch applications count: ${applicationsError.message}`)
  }

  return {
    totalApplications: totalApplications || 0,
    pendingApplications: totalApplications || 0
  }
}