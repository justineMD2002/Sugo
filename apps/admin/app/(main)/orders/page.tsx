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
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  const fetchOrders = async (page?: number, size?: number, query?: string) => {
    // Use provided parameters or fall back to current state
    const pageNum = page ?? currentPage
    const pageSizeNum = size ?? pageSize
    const searchQuery = query ?? search
    
    try {
      if (!hasLoaded) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)
      const filters: { search?: string; status?: string } = {}
      if (searchQuery) {
        filters.search = searchQuery
      }
      if (statusFilter) {
        filters.status = statusFilter
      }
      const { data, count, totalPages } = await getOrdersWithDetails(pageNum, pageSizeNum, filters)
      setOrders(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(pageNum)
      setPageSize(pageSizeNum)
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
    setPageSize(newSize)
  }

  const handleSearch = (query: string) => {
    setSearch(query)
  }

  const handleStatusFilter = (status: string | undefined) => {
    setStatusFilter(status)
  }

  // Refetch when filters or page size change (but not on initial load)
  useEffect(() => {
    if (hasLoaded) {
      // Create a fresh filters object with current state values
      const filters: { search?: string; status?: string } = {}
      if (search) {
        filters.search = search
      }
      if (statusFilter) {
        filters.status = statusFilter
      }
      getOrdersWithDetails(1, pageSize, filters).then(({ data, count, totalPages }) => {
        setOrders(data)
        setTotalCount(count)
        setTotalPages(totalPages)
        setCurrentPage(1)
        setIsRefreshing(false)
      }).catch((err) => {
        console.error("Failed to fetch orders:", err)
        setError("Failed to load orders. Please try again later.")
        setIsRefreshing(false)
      })
      setIsRefreshing(true)
    }
  }, [statusFilter, pageSize, search, hasLoaded])

  // Initial fetch
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
        onPageChange={(page) => {
          const filters: { search?: string; status?: string } = {}
          if (search) {
            filters.search = search
          }
          if (statusFilter) {
            filters.status = statusFilter
          }
          getOrdersWithDetails(page, pageSize, filters).then(({ data, count, totalPages }) => {
            setOrders(data)
            setTotalCount(count)
            setTotalPages(totalPages)
            setCurrentPage(page)
            setIsRefreshing(false)
          }).catch((err) => {
            console.error("Failed to fetch orders:", err)
            setError("Failed to load orders. Please try again later.")
            setIsRefreshing(false)
          })
          setIsRefreshing(true)
        }}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        statusFilter={statusFilter}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}
