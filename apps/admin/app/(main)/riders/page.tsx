import { getRidersWithDetails } from "@/lib/api/riders"
import { Riders } from "@/components/riders/riders"

interface RidersPageProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    status?: string
  }
}

export default async function RidersPage({ searchParams }: RidersPageProps) {
  try {
    const page = parseInt(searchParams.page || "1", 10)
    const limit = parseInt(searchParams.limit || "10", 10)
    const search = searchParams.search || ""
    const status = searchParams.status as "online" | "offline" | "busy" | undefined
    
    const { data: riders, count, totalPages } = await getRidersWithDetails(page, limit, { 
      search,
      status 
    })
    
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <Riders 
          initialRiders={riders} 
          totalCount={count}
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
        />
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch riders:", error)
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Failed to load riders
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error loading the riders data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
