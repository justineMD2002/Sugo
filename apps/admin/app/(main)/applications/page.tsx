"use client"

import { useEffect, useState } from "react"
import { Applications } from "@/components/applications/applications"
import { getApplicationsWithDetails } from "@/lib/api/applications"
import { ApplicationsSkeleton } from "@/components/skeletons/applications-skeleton"
import type { Application } from "@/lib/api/applications"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
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

  const fetchApplications = async (page?: number, size?: number, query?: string) => {
    // Use provided parameters or fall back to current state
    const pageNum = page ?? currentPage
    const pageSizeNum = size ?? pageSize
    const searchQuery = query ?? search
    
    try {
      if (!hasLoaded) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)
      const filters: { search?: string; status?: "pending" | "approved" | "rejected" } = {}
      if (searchQuery) {
        filters.search = searchQuery
      }
      if (statusFilter) {
        filters.status = statusFilter as "pending" | "approved" | "rejected"
      }
      const { data, count, totalPages } = await getApplicationsWithDetails(pageNum, pageSizeNum, filters)
      setApplications(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(pageNum)
      setPageSize(pageSizeNum)
      setHasLoaded(true)
    } catch (err) {
      console.error("Failed to fetch applications:", err)
      setError("Failed to load applications. Please try again later.")
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
      const filters: { search?: string; status?: "pending" | "approved" | "rejected" } = {}
      if (search) {
        filters.search = search
      }
      if (statusFilter) {
        filters.status = statusFilter as "pending" | "approved" | "rejected"
      }
      getApplicationsWithDetails(1, pageSize, filters).then(({ data, count, totalPages }) => {
        setApplications(data)
        setTotalCount(count)
        setTotalPages(totalPages)
        setCurrentPage(1)
        setIsRefreshing(false)
      }).catch((err) => {
        console.error("Failed to fetch applications:", err)
        setError("Failed to load applications. Please try again later.")
        setIsRefreshing(false)
      })
      setIsRefreshing(true)
    }
  }, [statusFilter, pageSize, search, hasLoaded])

  // Initial fetch
  useEffect(() => {
    fetchApplications()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <ApplicationsSkeleton />
      </div>
    )
  }

  if (error) {
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
    
  const handleRefresh = () => {
    const filters: { search?: string; status?: "pending" | "approved" | "rejected" } = {}
    if (search) {
      filters.search = search
    }
    if (statusFilter) {
      filters.status = statusFilter as "pending" | "approved" | "rejected"
    }
    getApplicationsWithDetails(currentPage, pageSize, filters).then(({ data, count, totalPages }) => {
      setApplications(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setIsRefreshing(false)
    }).catch((err) => {
      console.error("Failed to fetch applications:", err)
      setError("Failed to load applications. Please try again later.")
      setIsRefreshing(false)
    })
    setIsRefreshing(true)
  }

  return (
    <div className="w-full px-4 lg:px-6 py-4 md:py-6">
      <Applications 
        initialApplications={applications} 
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={(page) => {
          const filters: { search?: string; status?: "pending" | "approved" | "rejected" } = {}
          if (search) {
            filters.search = search
          }
          if (statusFilter) {
            filters.status = statusFilter as "pending" | "approved" | "rejected"
          }
          getApplicationsWithDetails(page, pageSize, filters).then(({ data, count, totalPages }) => {
            setApplications(data)
            setTotalCount(count)
            setTotalPages(totalPages)
            setCurrentPage(page)
            setIsRefreshing(false)
          }).catch((err) => {
            console.error("Failed to fetch applications:", err)
            setError("Failed to load applications. Please try again later.")
            setIsRefreshing(false)
          })
          setIsRefreshing(true)
        }}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        statusFilter={statusFilter}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
