"use client"

import * as React from "react"
import { Droplets, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageList } from "./message-components"
import { MessageInput } from "./message-input"
import { useRealtimeTicketMessages } from "@/hooks/use-realtime-ticket-messages"
import type { TicketMessageWithSender } from "@/lib/api/tickets"

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  ticketNumber: string
  service: string
  customerName: string
  customerContact: string
  status: string
  onStatusChange: (status: string) => void
  currentUserId: string
}

export function ChatModal({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  service,
  customerName,
  customerContact,
  status,
  onStatusChange,
  currentUserId,
}: ChatModalProps) {
  const { messages, isLoading, error, sendMessage, markAsRead } = useRealtimeTicketMessages({
    ticketId,
    currentUserId
  })

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Track pending status update to disable the dropdown until the parent reflects the change
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (pendingStatus && status === pendingStatus) {
      setPendingStatus(null)
    }
  }, [status, pendingStatus])

  const handleStatusSelect = (value: string) => {
    setPendingStatus(value)
    onStatusChange(value)
  }

  // Scroll to bottom when modal opens or messages change
  const scrollToBottom = React.useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [])

  // Scroll to bottom when modal opens or when messages change
  React.useEffect(() => {
    if (isOpen && !isLoading && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, isLoading, messages, scrollToBottom])

  // Mark messages as read when modal opens
  React.useEffect(() => {
    if (isOpen) {
      markAsRead()
    }
  }, [isOpen, markAsRead])

  const handleSendMessage = async (messageText: string, messageType?: "text" | "image" | "document", attachmentUrl?: string) => {
    try {
      await sendMessage(messageText, messageType, attachmentUrl)
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] h-[85vh] p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Chat for {ticketNumber}</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none h-full flex flex-col w-full min-h-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium leading-none">{ticketNumber} - {service}</p>
                <p className="text-sm text-muted-foreground">{customerName}</p>
                {/* <p className="text-xs text-muted-foreground">{customerContact}</p> */}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* <div className="text-right">
                <p className="text-sm text-muted-foreground">{customerContact}</p>
              </div> */}
              <Select value={status} onValueChange={handleStatusSelect} disabled={!!pendingStatus || status === "resolved"}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-destructive mb-2">Failed to load messages</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl">
                <MessageList 
                  messages={messages} 
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </CardContent>
          {status !== "resolved" && (
            <CardFooter>
              <MessageInput 
                ticketId={ticketId}
                onSendMessage={handleSendMessage}
                placeholder="Type your message..."
                className="w-full"
              />
            </CardFooter>
          )}
          {status === "resolved" && (
            <CardFooter className="justify-center gap-2">
              <span className="text-sm text-muted-foreground">This ticket is resolved. Chat is disabled.</span>
            </CardFooter>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  )
}
