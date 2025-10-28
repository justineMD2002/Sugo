"use client"

import * as React from "react"
import { RidersTable } from "./riders-table"
import { RiderDetailModal } from "./rider-detail-modal"
import type { Rider } from "@/lib/api/riders"

interface RidersProps {
  initialRiders: Rider[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export function Riders({ 
  initialRiders, 
  totalCount, 
  currentPage, 
  totalPages,
  pageSize
}: RidersProps) {
  const [selectedRider, setSelectedRider] = React.useState<Rider | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)

  const handleViewRider = (rider: Rider) => {
    setSelectedRider(rider)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedRider(null)
  }

  const handleToggleStatus = (rider: Rider) => {
    console.log("Toggling status for rider:", rider.id)
    // Add your toggle status logic here
  }

  return (
    <>
      <RidersTable 
        data={initialRiders} 
        onViewRider={handleViewRider}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
      />
      
      <RiderDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        rider={selectedRider}
        onToggleStatus={handleToggleStatus}
      />
    </>
  )
}
