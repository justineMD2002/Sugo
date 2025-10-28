import { createClient } from "@/lib/supabase/server"

export interface Application {
  id: string
  applicant: string
  contact: string
  address: string
  vehicle: string
  plateNumber: string
  appliedDate: string
  status: "pending" | "under_review" | "approved" | "rejected"
  email: string
  serviceType: string
}

export interface ApplicationsFilters {
  search?: string
  status?: "pending" | "under_review" | "approved" | "rejected"
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
  const supabase = await createClient()
  const offset = (page - 1) * limit

  // First, get all applications (rider_profiles with is_verified = false)
  let applicationsQuery = supabase
    .from("rider_profiles")
    .select(`
      *,
      user:users!rider_profiles_user_id_fkey(*)
    `, { count: "exact" })
    .eq("is_verified", false)

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    applicationsQuery = applicationsQuery.or(
      `plate_number.ilike.%${searchTerm}%,vehicle_brand.ilike.%${searchTerm}%,vehicle_model.ilike.%${searchTerm}%`
    )
  }

  // Apply status filter
  if (filters.status) {
    // Map application status to database status
    const statusMap = {
      pending: "pending",
      under_review: "under_review", 
      approved: "approved",
      rejected: "rejected"
    }
    applicationsQuery = applicationsQuery.eq("status", statusMap[filters.status])
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
      status: app.status as "pending" | "under_review" | "approved" | "rejected",
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
  const supabase = await createClient()
  
  // Get application data
  const { data: application, error: applicationError } = await supabase
    .from("rider_profiles")
    .select(`
      *,
      user:users!rider_profiles_user_id_fkey(*)
    `)
    .eq("id", id)
    .eq("is_verified", false)
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
    status: application.status as "pending" | "under_review" | "approved" | "rejected",
    email: user?.email || "N/A",
    serviceType: application.service_type
  }
}

export async function updateApplicationStatus(
  id: string, 
  status: "pending" | "under_review" | "approved" | "rejected"
): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("rider_profiles")
    .update({ 
      status,
      is_verified: status === "approved",
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
  underReviewApplications: number
  approvedApplications: number
  rejectedApplications: number
}> {
  const supabase = await createClient()
  
  // Get total applications count
  const { count: totalApplications, error: applicationsError } = await supabase
    .from("rider_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", false)

  if (applicationsError) {
    throw new Error(`Failed to fetch applications count: ${applicationsError.message}`)
  }

  // Get status counts
  const { data: statusData, error: statusError } = await supabase
    .from("rider_profiles")
    .select("status")
    .eq("is_verified", false)

  if (statusError) {
    throw new Error(`Failed to fetch application status: ${statusError.message}`)
  }

  const statusCounts = statusData?.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    totalApplications: totalApplications || 0,
    pendingApplications: statusCounts.pending || 0,
    underReviewApplications: statusCounts.under_review || 0,
    approvedApplications: statusCounts.approved || 0,
    rejectedApplications: statusCounts.rejected || 0
  }
}