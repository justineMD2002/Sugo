"use client"

import * as React from "react"
import { OrderDetailModal } from "./order-detail-modal"
import { OrdersTable } from "./orders-table"
import type { Order, User, Delivery } from "@/lib/types/database"

interface OrderWithDetails extends Order {
  customer: User
  rider?: User
  delivery?: Delivery
}

interface OrdersProps {
  initialOrders: OrderWithDetails[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function Orders({ 
  initialOrders, 
  totalCount, 
  currentPage, 
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}: OrdersProps) {
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithDetails | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)

  const handleViewOrder = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedOrder(null)
  }

  return (
    <>
      <OrdersTable 
        data={initialOrders} 
        onViewOrder={handleViewOrder}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
      
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        order={selectedOrder}
      />
    </>
  )
}
