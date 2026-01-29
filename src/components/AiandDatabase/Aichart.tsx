
import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bot, User, Send, Loader2, Paperclip, ImageIcon, Mic, Square } from "lucide-react"
import { aiQueryApi } from "@/api/aichartApi"
import { AIQueryType } from "@/lib/schemas/chatai/Chataireport"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: Date
  attachments?: { type: "image" | "audio"; name: string; url: string }[]
  isStreaming?: boolean
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I can help you find products in our multi-mart marketplace. You can search for anything, upload product images or audio to find what you need, or ask me questions about our products. What are you looking for today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: "audio/wav" })
        setAttachments((prev) => [...prev, file])
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("audio/"))
    setAttachments((prev) => [...prev, ...validFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Helper function to upload file and get URL
  const uploadFile = async (file: File): Promise<string> => {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', file)

    try {
      // You'll need to implement a file upload endpoint
      // This is a placeholder - replace with your actual upload endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('File upload failed')
      }
      
      const result = await response.json()
      return result.url // Assuming your upload endpoint returns { url: "..." }
    } catch (error) {
      console.error('File upload error:', error)
      // Fallback to object URL for demo purposes
      return URL.createObjectURL(file)
    }
  }

  const streamText = (text: string, messageId: number) => {
    let currentIndex = 0
    const streamInterval = setInterval(
      () => {
        if (currentIndex < text.length) {
          const chunk = text.slice(0, currentIndex + Math.floor(Math.random() * 5) + 3)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, content: chunk, isStreaming: currentIndex < text.length - 1 } : msg,
            ),
          )
          currentIndex = chunk.length
        } else {
          setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg)))
          clearInterval(streamInterval)
          setIsLoading(false)
        }
      },
      15 + Math.random() * 20,
    )
  }
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if ((!input.trim() && attachments.length === 0) || isLoading) return

  try {
    setIsLoading(true)

    // Process attachments and upload files
    const messageAttachments = await Promise.all(
      attachments.map(async (file) => {
        const url = await uploadFile(file)
        return {
          type: file.type.startsWith("image/") ? ("image" as const) : ("audio" as const),
          name: file.name,
          url: url,
        }
      })
    )

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setAttachments([])

    // Create AI message placeholder with stored ID
    const aiMessageId = Date.now() + 1
    const aiMessage: Message = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, aiMessage])

    // Prepare API request data
    const queryData: AIQueryType = {
      query: currentInput || "Please analyze the uploaded file(s)",
    }

    // Add image/audio URLs if available
    const imageAttachment = messageAttachments.find(att => att.type === "image")
    if (imageAttachment) queryData.image_url = imageAttachment.url

    const audioAttachment = messageAttachments.find(att => att.type === "audio")
    if (audioAttachment) queryData.audio_url = audioAttachment.url

    try {
      // Make API call
      const response = await aiQueryApi(queryData)
      // Stream the AI response
      streamText(response.message, aiMessageId)
    } catch (error) {
      console.error("AI API Error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

      // Fix: use stored AI message ID
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: `Sorry, I encountered an error: ${errorMessage}`, isStreaming: false }
            : msg
        )
      )
    }

  } catch (error) {
    console.error("AI Query Setup Error:", error)
  } finally {
    setIsLoading(false)
  }
}







  return (
    <Card className="h-[600px] flex flex-col bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">Ask questions about our products and marketplace</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <div className="max-w-[80%] min-w-0 flex flex-col gap-2">
                <div
                  className={`rounded-lg px-3 py-2 text-sm break-words hyphens-auto word-wrap overflow-wrap-anywhere ${
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                  style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                  {message.content}
                  {message.isStreaming && <span className="animate-pulse">|</span>}
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-secondary rounded px-2 py-1 text-xs min-w-0"
                      >
                        {attachment.type === "image" ? (
                          <ImageIcon className="h-3 w-3 flex-shrink-0" />
                        ) : (
                          <Mic className="h-3 w-3 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[100px]">{attachment.name}</span>
                        {attachment.type === "audio" && (
                          <audio controls className="h-6 max-w-[120px]">
                            <source src={attachment.url} />
                            Your browser does not support audio playback.
                          </audio>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg overflow-hidden">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-background rounded px-2 py-1 text-xs min-w-0">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <Mic className="h-3 w-3 flex-shrink-0" />
                )}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative min-w-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your database..."
              className="flex-1 min-h-[40px] max-h-[100px] resize-none bg-input border-border pr-20"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${isRecording ? "text-red-500" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                {isRecording ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}