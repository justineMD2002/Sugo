import { getApplicationsWithDetails } from "@/lib/api/applications"
import { Applications } from "@/components/applications/applications"

interface ApplicationsPageProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    status?: string
  }
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  try {
    const page = parseInt(searchParams.page || "1", 10)
    const limit = parseInt(searchParams.limit || "10", 10)
    const search = searchParams.search || ""
    const status = searchParams.status as "pending" | "under_review" | "approved" | "rejected" | undefined
    
    const { data: applications, count, totalPages } = await getApplicationsWithDetails(page, limit, { 
      search,
      status 
    })
    
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <Applications 
          initialApplications={applications} 
          totalCount={count}
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
        />
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch applications:", error)
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Failed to load applications
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error loading the applications data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
