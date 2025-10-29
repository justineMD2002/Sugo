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

  return (
    <div className={cn(
      "flex gap-2 max-w-[75%]",
      isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback className={cn("text-white text-xs", getSenderTypeColor(message.sender?.user_type))}>
            {getSenderInitials(message.sender)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col gap-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {!isOwnMessage && showAvatar && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{getSenderName(message.sender)}</span>
            {message.sender?.user_type && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {message.sender.user_type}
              </Badge>
            )}
          </div>
        )}
        
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm",
          isOwnMessage 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {message.message_type === "image" && message.attachment_url ? (
            <div className="space-y-2">
              <img
                src={message.attachment_url}
                alt="Shared image"
                className="max-w-xs rounded-lg border"
              />
              {message.message_text && (
                <p className="text-sm">{message.message_text}</p>
              )}
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
