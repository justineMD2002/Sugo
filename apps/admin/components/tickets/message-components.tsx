"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { TicketMessageWithSender } from "@/lib/api/tickets"

interface MessageBubbleProps {
  message: TicketMessageWithSender
  isOwnMessage: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isOwnMessage, showAvatar = true }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const getSenderInitials = (sender?: TicketMessageWithSender["sender"]) => {
    if (!sender) return "?"
    return sender.full_name.charAt(0).toUpperCase()
  }

  const getSenderName = (sender?: TicketMessageWithSender["sender"]) => {
    if (!sender) return "Unknown"
    return sender.full_name
  }

  const getSenderTypeColor = (userType?: string) => {
    switch (userType) {
      case "admin":
        return "bg-blue-600"
      case "customer":
        return "bg-green-600"
      case "rider":
        return "bg-purple-600"
      default:
        return "bg-gray-600"
    }
  }

  const senderAny = message.sender as any
  const isCustomer = senderAny?.user_type === "customer"
  const shouldShowIdentity = !isOwnMessage && showAvatar && !isCustomer

  return (
    <div className={cn(
      "flex max-w-[75%]",
      shouldShowIdentity ? "gap-2" : "gap-0",
      isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {shouldShowIdentity && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAny?.avatar_url} />
          <AvatarFallback className={cn("text-white text-xs", getSenderTypeColor(senderAny?.user_type))}>
            {getSenderInitials(message.sender)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col gap-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {!isOwnMessage && shouldShowIdentity && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{getSenderName(message.sender)}</span>
            {senderAny?.user_type && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {senderAny.user_type}
              </Badge>
            )}
          </div>
        )}
        
        <div className={cn(
          "rounded-lg text-sm",
          message.message_type === "image" && message.attachment_url
            ? "bg-transparent"
            : isOwnMessage
              ? "bg-primary text-primary-foreground px-3 py-2"
              : "bg-muted px-3 py-2"
        )}>
          {message.message_type === "image" && message.attachment_url ? (
            <div className="space-y-2">
              {/* If there's text, show it first inside a standard bubble */}
              {message.message_text && (
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm w-fit max-w-[75vw]",
                    isOwnMessage ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                  )}
                >
                  {message.message_text}
                </div>
              )}
              <img
                src={message.attachment_url}
                alt="Shared image"
                className="max-w-xs rounded-lg border bg-background object-contain"
              />
            </div>
          ) : message.message_type === "document" && message.attachment_url ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded border">
                <div className="text-xs">📄</div>
                <span className="text-xs">Document attached</span>
              </div>
              {message.message_text && (
                <p className="text-sm">{message.message_text}</p>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(message.created_at)}</span>
          {message.is_read && isOwnMessage && (
            <span className="text-blue-500">✓</span>
          )}
        </div>
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: TicketMessageWithSender[]
  currentUserId: string
  className?: string
}

export function MessageList({ messages, currentUserId, className }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className={cn("space-y-4", className)}>
      {messages.map((message, index) => {
        const isOwnMessage = message.sender_id === currentUserId
        const prevMessage = messages[index - 1]
        const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id
        
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showAvatar={showAvatar}
          />
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
