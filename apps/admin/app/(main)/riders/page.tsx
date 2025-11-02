"use client"

import { useEffect, useState } from "react"
import { Riders } from "@/components/riders/riders"
import { getRidersWithDetails } from "@/lib/api/riders"
import { RidersSkeleton } from "@/components/skeletons/riders-skeleton"
import type { Rider } from "@/lib/api/riders"

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
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

  const fetchRiders = async (page?: number, size?: number, query?: string) => {
    // Use provided parameters or fall back to current state
    const pageNum = page ?? currentPage
    const pageSizeNum = size ?? pageSize
    const searchQuery = query ?? search
    
    try {
      if (!hasLoaded) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)
      const filters: { search?: string; status?: "online" | "offline" | "busy" } = {}
      if (searchQuery) {
        filters.search = searchQuery
      }
      if (statusFilter) {
        filters.status = statusFilter as "online" | "offline" | "busy"
      }
      const { data, count, totalPages } = await getRidersWithDetails(pageNum, pageSizeNum, filters)
      setRiders(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(pageNum)
      setPageSize(pageSizeNum)
      setHasLoaded(true)
    } catch (err) {
      console.error("Failed to fetch riders:", err)
      setError("Failed to load riders. Please try again later.")
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
      const filters: { search?: string; status?: "online" | "offline" | "busy" } = {}
      if (search) {
        filters.search = search
      }
      if (statusFilter) {
        filters.status = statusFilter as "online" | "offline" | "busy"
      }
      getRidersWithDetails(1, pageSize, filters).then(({ data, count, totalPages }) => {
        setRiders(data)
        setTotalCount(count)
        setTotalPages(totalPages)
        setCurrentPage(1)
        setIsRefreshing(false)
      }).catch((err) => {
        console.error("Failed to fetch riders:", err)
        setError("Failed to load riders. Please try again later.")
        setIsRefreshing(false)
      })
      setIsRefreshing(true)
    }
  }, [statusFilter, pageSize, search, hasLoaded])

  // Initial fetch
  useEffect(() => {
    fetchRiders()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <RidersSkeleton />
      </div>
    )
  }

  if (error) {
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
    
  return (
    <div className="w-full px-4 lg:px-6 py-4 md:py-6">
      <Riders 
        initialRiders={riders} 
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={(page) => {
          const filters: { search?: string; status?: "online" | "offline" | "busy" } = {}
          if (search) {
            filters.search = search
          }
          if (statusFilter) {
            filters.status = statusFilter as "online" | "offline" | "busy"
          }
          getRidersWithDetails(page, pageSize, filters).then(({ data, count, totalPages }) => {
            setRiders(data)
            setTotalCount(count)
            setTotalPages(totalPages)
            setCurrentPage(page)
            setIsRefreshing(false)
          }).catch((err) => {
            console.error("Failed to fetch riders:", err)
            setError("Failed to load riders. Please try again later.")
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
