"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TicketMessageWithSender, RealtimeMessagePayload } from "@/lib/api/tickets"

interface UseRealtimeTicketMessagesProps {
  ticketId: string
  currentUserId: string
}

interface UseRealtimeTicketMessagesReturn {
  messages: TicketMessageWithSender[]
  isLoading: boolean
  error: string | null
  sendMessage: (messageText: string, messageType?: "text" | "image" | "document", attachmentUrl?: string) => Promise<void>
  markAsRead: () => Promise<void>
}

export function useRealtimeTicketMessages({
  ticketId,
  currentUserId
}: UseRealtimeTicketMessagesProps): UseRealtimeTicketMessagesReturn {
  const [messages, setMessages] = useState<TicketMessageWithSender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from("ticket_messages")
        .select(`
          *,
          sender:users!ticket_messages_sender_id_fkey(
            id,
            full_name,
            user_type,
            avatar_url
          )
        `)
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }, [ticketId, supabase])

  // Send a new message
  const sendMessage = useCallback(async (
    messageText: string, 
    messageType: "text" | "image" | "document" = "text",
    attachmentUrl?: string
  ) => {
    try {
      setError(null)
      
      const { data, error: insertError } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticketId,
          sender_id: currentUserId,
          message_text: messageText,
          message_type: messageType,
          attachment_url: attachmentUrl
        })
        .select(`
          *,
          sender:users!ticket_messages_sender_id_fkey(
            id,
            full_name,
            user_type,
            avatar_url
          )
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      // Add the new message to the local state immediately for better UX
      setMessages(prev => [...prev, data])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
      throw err
    }
  }, [ticketId, currentUserId, supabase])

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      const { error: updateError } = await supabase
        .from("ticket_messages")
        .update({ is_read: true })
        .eq("ticket_id", ticketId)
        .neq("sender_id", currentUserId) // Don't mark own messages as read

      if (updateError) {
        throw updateError
      }
    } catch (err) {
      console.error("Failed to mark messages as read:", err)
    }
  }, [ticketId, currentUserId, supabase])

  // Set up realtime subscription
  useEffect(() => {
    if (!ticketId) return

    // Load initial messages
    loadMessages()

    // Set up realtime subscription
    const channel = supabase
      .channel(`ticket_messages:${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`
        },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === "INSERT" && newRecord) {
            // Fetch the full message with sender info
            const { data: fullMessage, error: fetchError } = await supabase
              .from("ticket_messages")
              .select(`
                *,
                sender:users!ticket_messages_sender_id_fkey(
                  id,
                  full_name,
                  user_type,
                  avatar_url
                )
              `)
              .eq("id", newRecord.id)
              .single()

            if (!fetchError && fullMessage) {
              setMessages(prev => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(msg => msg.id === fullMessage.id)
                if (exists) return prev
                return [...prev, fullMessage]
              })
            }
          } else if (eventType === "UPDATE" && newRecord) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === newRecord.id 
                  ? { ...msg, ...newRecord }
                  : msg
              )
            )
          } else if (eventType === "DELETE" && oldRecord) {
            setMessages(prev => prev.filter(msg => msg.id !== oldRecord.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, loadMessages, supabase])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead
  }
}
