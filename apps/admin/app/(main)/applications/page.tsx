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

  const fetchApplications = async (page: number = currentPage, size: number = pageSize, query: string = search) => {
    try {
      if (!hasLoaded) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)
      const { data, count, totalPages } = await getApplicationsWithDetails(page, size, { search: query })
      setApplications(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(page)
      setPageSize(size)
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
    fetchApplications(1, newSize)
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    fetchApplications(1, pageSize, query)
  }

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
    
  return (
    <div className="w-full px-4 lg:px-6 py-4 md:py-6">
      <Applications 
        initialApplications={applications} 
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={fetchApplications}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}
