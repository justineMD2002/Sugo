"use client"

import * as React from "react"
import { Send, Droplets, Image as ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Message {
  id: string
  text: string
  timestamp: string
  sender: "admin" | "customer"
  senderName?: string
  imageUrl?: string
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  ticketNumber: string
  service: string
  customerName: string
  customerContact: string
  status: string
  onStatusChange: (status: string) => void
  messages: Message[]
  onSendMessage: (message: string, imageUrl?: string) => void
}

export function ChatModal({
  isOpen,
  onClose,
  ticketNumber,
  service,
  customerName,
  customerContact,
  status,
  onStatusChange,
  messages,
  onSendMessage,
}: ChatModalProps) {
  const [input, setInput] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const inputLength = input.trim().length
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (inputLength === 0 && !selectedImage) return
    
    if (selectedImage) {
      // Send image as separate message
      onSendMessage("", selectedImage)
      setSelectedImage(null)
    } else {
      // Send text message
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const getSenderInitials = (sender: string, senderName?: string) => {
    switch (sender) {
      case "admin":
        return "A"
      case "customer":
        return senderName?.[0] || "C"
      default:
        return "?"
    }
  }

  const getSenderName = (sender: string, senderName?: string) => {
    switch (sender) {
      case "admin":
        return "Admin"
      case "customer":
        return senderName || "Customer"
      default:
        return "Unknown"
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
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                    message.sender === "admin"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.imageUrl ? (
                    <div>
                      <img
                        src={message.imageUrl}
                        alt="Shared image"
                        className="max-w-xs rounded-lg border"
                      />
                    </div>
                  ) : (
                    <div>{message.text}</div>
                  )}
                  <div className="text-xs opacity-70">
                    {message.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Input
                id="message"
                placeholder="Type your message..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleImageButtonClick}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Add image</span>
              </Button>
              <Button type="submit" size="icon" disabled={inputLength === 0 && !selectedImage}>
                <Send />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            {selectedImage && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={selectedImage}
                  alt="Selected image"
                  className="h-16 w-16 rounded-lg border object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
