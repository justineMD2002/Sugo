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

  // Mark messages as read when modal opens
  React.useEffect(() => {
    if (isOpen) {
      markAsRead()
    }
  }, [isOpen, markAsRead])

  const handleSendMessage = async (messageText: string, messageType?: "text" | "image" | "document", attachmentUrl?: string) => {
    try {
      await sendMessage(messageText, messageType, attachmentUrl)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0" showCloseButton={false}>
        <Card className="border-0 shadow-none h-full flex flex-col w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  <Droplets className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
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
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon"><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
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
              <MessageList 
                messages={messages} 
                currentUserId={currentUserId}
                className="p-4"
              />
            )}
          </CardContent>
          <CardFooter>
            <MessageInput 
              onSendMessage={handleSendMessage}
              placeholder="Type your message..."
              className="w-full"
            />
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
