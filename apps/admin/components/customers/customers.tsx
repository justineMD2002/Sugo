"use client"

import * as React from "react"
import { CustomersTable } from "./customers-table"
import { CustomerDetailModal } from "./customer-detail-modal"
import type { Customer } from "@/lib/api/customers"

interface CustomersProps {
  initialCustomers: Customer[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export function Customers({ 
  initialCustomers, 
  totalCount, 
  currentPage, 
  totalPages,
  pageSize
}: CustomersProps) {
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedCustomer(null)
  }

  return (
    <>
      <CustomersTable 
        data={initialCustomers} 
        onViewCustomer={handleViewCustomer}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
      />
      
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        customer={selectedCustomer}
      />
    </>
  )
}
