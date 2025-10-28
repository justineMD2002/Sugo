import { getOrdersWithDetails } from "@/lib/api/orders"
import { Orders } from "@/components/orders/orders"

interface OrdersPageProps {
  searchParams: {
    page?: string
    limit?: string
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  try {
    const page = parseInt(searchParams.page || "1", 10)
    const limit = parseInt(searchParams.limit || "10", 10)
    
    const { data: orders, count, totalPages } = await getOrdersWithDetails(page, limit)
    
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <Orders 
          initialOrders={orders} 
          totalCount={count}
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
        />
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Failed to load orders
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error loading the orders data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
