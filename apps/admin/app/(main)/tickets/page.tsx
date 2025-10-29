"use client"

import { useEffect, useState } from "react"
import { Tickets } from "@/components/tickets/tickets"
import { getTickets } from "@/lib/api/tickets"
import { TicketsSkeleton } from "@/components/skeletons/tickets-skeleton"
import type { Ticket } from "@/lib/api/tickets"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  const fetchTickets = async (page: number = currentPage, size: number = pageSize, query: string = search) => {
    try {
      if (!hasLoaded) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)
      const { data, count, totalPages } = await getTickets(page, size, { search: query })
      setTickets(data)
      setTotalCount(count)
      setTotalPages(totalPages)
      setCurrentPage(page)
      setPageSize(size)
      setHasLoaded(true)
    } catch (err) {
      console.error("Failed to fetch tickets:", err)
      setError("Failed to load tickets. Please try again later.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    fetchTickets(1, newSize)
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    fetchTickets(1, pageSize, query)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <TicketsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full px-4 lg:px-6 py-4 md:py-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Failed to load tickets
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error loading the tickets data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
    
  return (
    <div className="w-full px-4 lg:px-6 py-4 md:py-6">
      <Tickets 
        initialTickets={tickets} 
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={fetchTickets}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
      />
    </div>
  )
}