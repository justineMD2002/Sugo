import { getCustomersWithDetails } from "@/lib/api/customers"
import { Customers } from "@/components/customers/customers"

interface CustomersPageProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
  }
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  try {
    const page = parseInt(searchParams.page || "1", 10)
    const limit = parseInt(searchParams.limit || "10", 10)
    const search = searchParams.search || ""
    
    const { data: customers, count, totalPages } = await getCustomersWithDetails(page, limit, { search })
    
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <Customers 
          initialCustomers={customers} 
          totalCount={count}
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
        />
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Failed to load customers
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error loading the customers data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
