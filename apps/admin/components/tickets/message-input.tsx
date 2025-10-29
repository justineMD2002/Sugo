"use client"

import * as React from "react"
import { Send, Image as ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface MessageInputProps {
  ticketId: string
  onSendMessage: (messageText: string, messageType?: "text" | "image", attachmentUrl?: string) => Promise<void>
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({ 
  ticketId,
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message...",
  className 
}: MessageInputProps) {
  const [input, setInput] = React.useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [isSending, setIsSending] = React.useState(false)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const inputLength = input.trim().length
  const hasContent = inputLength > 0 || !!imageFile

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!hasContent || isSending) return
    
    setIsSending(true)
    try {
      if (imageFile) {
        const supabase = createClient()
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
        const path = `${ticketId}/${Date.now()}_${safeName}`
        const { error: uploadError } = await supabase
          .storage
          .from("ticket_message_images")
          .upload(path, imageFile, { upsert: false, cacheControl: "3600", contentType: imageFile.type || "image/*" })
        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase
          .storage
          .from("ticket_message_images")
          .getPublicUrl(path)
        const url = publicUrlData.publicUrl

        await onSendMessage(input.trim(), "image", url)
        setImageFile(null)
        setImagePreviewUrl(null)
      } else {
        await onSendMessage(input.trim())
      }
      setInput("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeSelectedImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImagePreviewUrl(null)
    setImageFile(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected attachments preview */}
      {imagePreviewUrl && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          {imagePreviewUrl && (
            <>
              <img
              src={imagePreviewUrl}
                alt="Selected image"
                className="h-12 w-12 rounded border object-cover"
              />
              <span className="text-sm text-muted-foreground">Image selected</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeSelectedImage}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder={placeholder}
            className="h-9 text-sm"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleSubmit(event as unknown as React.FormEvent)
              }
            }}
            disabled={isSending}
          />
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        {/* Action buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleImageButtonClick}
            disabled={isSending}
            className="h-9 w-9"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="sr-only">Add image</span>
          </Button>
          
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!hasContent || isSending}
            className="h-9 w-9"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
