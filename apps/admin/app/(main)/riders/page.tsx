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
  const [error, setError] = useState<string | null>(null)
  
  const [pageSize, setPageSize] = useState(10)

  const fetchRiders = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, count, totalPages } = await getRidersWithDetails(page, size, {})
      setRiders(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(page)
      setPageSize(size)
    } catch (err) {
      console.error("Failed to fetch riders:", err)
      setError("Failed to load riders. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    fetchRiders(1, newSize)
  }

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
        onPageChange={fetchRiders}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
