"use client"

import * as React from "react"
import { Send, Image as ImageIcon, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface MessageInputProps {
  onSendMessage: (messageText: string, messageType?: "text" | "image" | "document", attachmentUrl?: string) => Promise<void>
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message...",
  className 
}: MessageInputProps) {
  const [input, setInput] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isSending, setIsSending] = React.useState(false)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  const inputLength = input.trim().length
  const hasContent = inputLength > 0 || selectedImage || selectedFile

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!hasContent || isSending) return
    
    setIsSending(true)
    try {
      if (selectedImage) {
        await onSendMessage(input.trim() || "Image shared", "image", selectedImage)
        setSelectedImage(null)
      } else if (selectedFile) {
        // For now, we'll just send the filename as text
        // In a real app, you'd upload the file first and get a URL
        await onSendMessage(input.trim() || `Document: ${selectedFile.name}`, "document")
        setSelectedFile(null)
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
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected attachments preview */}
      {(selectedImage || selectedFile) && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          {selectedImage && (
            <>
              <img
                src={selectedImage}
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
          {selectedFile && (
            <>
              <div className="h-12 w-12 rounded border bg-background flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeSelectedFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
        <div className="flex-1">
          <Textarea
            placeholder={placeholder}
            className="min-h-[40px] max-h-[120px] resize-none"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
            disabled={isSending}
          />
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
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
            className="h-10 w-10"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="sr-only">Add image</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleFileButtonClick}
            disabled={isSending}
            className="h-10 w-10"
          >
            <FileText className="h-4 w-4" />
            <span className="sr-only">Add document</span>
          </Button>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!hasContent || isSending}
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
