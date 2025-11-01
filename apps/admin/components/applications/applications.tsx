"use client"

import * as React from "react"
import { toast } from "sonner"
import { ApplicationsTable } from "./applications-table"
import { ApplicationDetailModal } from "./application-detail-modal"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { Check, X } from "lucide-react"
import type { Application } from "@/lib/api/applications"
import { updateApplicationStatus } from "@/lib/api/applications"

interface ApplicationsProps {
  initialApplications: Application[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSearch: (query: string) => void
  onStatusFilter?: (status: string | undefined) => void
  statusFilter?: string | undefined
  isRefreshing?: boolean
  onRefresh?: () => void
}

export function Applications({ 
  initialApplications, 
  totalCount, 
  currentPage, 
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onStatusFilter,
  statusFilter,
  isRefreshing,
  onRefresh
}: ApplicationsProps) {
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false)
  const [confirmationAction, setConfirmationAction] = React.useState<{
    type: 'approve' | 'reject'
    application: Application | null
  }>({ type: 'approve', application: null })
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const handleApproveApplication = (application: Application) => {
    // Ensure only the confirmation modal is visible
    setIsDetailModalOpen(false)
    setSelectedApplication(application)
    setConfirmationAction({ type: 'approve', application })
    setIsConfirmationModalOpen(true)
  }

  const handleRejectApplication = (application: Application) => {
    // Ensure only the confirmation modal is visible
    setIsDetailModalOpen(false)
    setSelectedApplication(application)
    setConfirmationAction({ type: 'reject', application })
    setIsConfirmationModalOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!confirmationAction.application) return

    setIsProcessing(true)
    try {
      const status = confirmationAction.type === 'approve' ? 'approved' : 'rejected'
      
      // Update the application status in the database
      await updateApplicationStatus(confirmationAction.application.id, status)
      
      // Refresh the data to reflect the changes
      onRefresh?.()
      
      // Show success toast
      toast.success(
        `Application ${confirmationAction.type === 'approve' ? 'approved' : 'rejected'} successfully`,
        {
          description: `${confirmationAction.application.applicant}'s application has been ${confirmationAction.type === 'approve' ? 'approved' : 'rejected'}.`,
        }
      )
      
      setIsConfirmationModalOpen(false)
      setConfirmationAction({ type: 'approve', application: null })
    } catch (error) {
      console.error('Error processing application:', error)
      toast.error(
        `Failed to ${confirmationAction.type === 'approve' ? 'approve' : 'reject'} application`,
        {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        }
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedApplication(null)
  }

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false)
    setConfirmationAction({ type: 'approve', application: null })
  }

  return (
    <>
      <ApplicationsTable 
        data={initialApplications} 
        onViewApplication={handleViewApplication}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSearch={onSearch}
        onStatusFilter={onStatusFilter}
        statusFilter={statusFilter}
        isRefreshing={isRefreshing}
      />
      
      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        application={selectedApplication}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmAction}
        title={`${confirmationAction.type === 'approve' ? 'Approve' : 'Reject'} Application?`}
        description={
          confirmationAction.type === 'approve'
            ? "Are you sure you want to approve this rider application? This will grant them access to the platform."
            : "Are you sure you want to reject this application? This action cannot be undone."
        }
        confirmText={confirmationAction.type === 'approve' ? 'Approve' : 'Reject'}
        confirmVariant={confirmationAction.type === 'approve' ? 'default' : 'destructive'}
        confirmIcon={confirmationAction.type === 'approve' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        isLoading={isProcessing}
      />
    </>
  )
}
