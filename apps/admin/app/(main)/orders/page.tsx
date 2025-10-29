"use client"

import { useEffect, useState } from "react"
import { Orders } from "@/components/orders/orders"
import { getOrdersWithDetails } from "@/lib/api/orders"
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton"
import type { Order } from "@/lib/api/orders"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  const fetchOrders = async (page: number = currentPage, size: number = pageSize, query: string = search) => {
    try {
      if (!hasLoaded) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)
      const { data, count, totalPages } = await getOrdersWithDetails(page, size, { search: query })
      setOrders(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(page)
      setPageSize(size)
      setHasLoaded(true)
    } catch (err) {
      console.error("Failed to fetch orders:", err)
      setError("Failed to load orders. Please try again later.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    fetchOrders(1, newSize)
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    fetchOrders(1, pageSize, query)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <OrdersSkeleton />
      </div>
    )
  }

  if (error) {
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
    
  return (
    <div className="w-full px-4 lg:px-6 py-4 md:py-6">
      <Orders 
        initialOrders={orders} 
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={fetchOrders}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}
