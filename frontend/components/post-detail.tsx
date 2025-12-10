"use client"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, MessageCircle } from "lucide-react"

// Define interfaces based on what was in mockPostData
interface Reaction {
  emoji: string
  count: number
  label: string
}

interface Thread {
  id: string
  author: string
  timestamp: string
  content: string
  reactions: number
}

export interface PostDetailData {
  id: string
  title: string
  url: string
  timestamp: string
  content: string
  summary: string
  sentiment: "positive" | "neutral" | "negative"
  reactions: Reaction[]
  threads: Thread[]
}

interface PostDetailProps {
  post: PostDetailData | null
}

export function PostDetail({ post }: PostDetailProps) {
  if (!post) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        Select a post to view details
      </div>
    )
  }

  const sentimentColors = {
    positive: "bg-chart-3 text-chart-3",
    neutral: "bg-chart-2 text-chart-2",
    negative: "bg-destructive text-destructive",
  }

  return (
    <div className="flex-1 bg-background">
      <ScrollArea className="h-[calc(100vh-3rem)]">
        <div className="mx-auto max-w-4xl p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-foreground">{post.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono">{post.timestamp}</span>
                <Separator orientation="vertical" className="h-4" />
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {"View Source"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("border-0 bg-opacity-10 font-medium", sentimentColors[post.sentiment])}
            >
              {post.sentiment.toUpperCase()}
            </Badge>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">{"Summary"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{post.summary}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">{"Emoji Reactions"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {post.reactions.map((reaction, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <span className="text-2xl">{reaction.emoji}</span>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-foreground">{reaction.count}</div>
                      <div className="text-xs text-muted-foreground">{reaction.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {post.threads && post.threads.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-4 w-4" />
                  {"Thread Discussions"}
                  <Badge variant="secondary" className="ml-auto">
                    {post.threads.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.threads.map((thread) => (
                  <div key={thread.id} className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-primary">{thread.author}</span>
                        <span className="text-xs text-muted-foreground">{thread.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-accent px-2 py-1">
                        <span className="text-xs text-muted-foreground">👍</span>
                        <span className="text-xs font-medium text-foreground">{thread.reactions}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{thread.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{"Content"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none text-foreground">
                {post.content.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="mb-4 mt-6 text-2xl font-bold text-foreground">
                        {line.substring(2)}
                      </h1>
                    )
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="mb-3 mt-5 text-xl font-semibold text-foreground">
                        {line.substring(3)}
                      </h2>
                    )
                  }
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={index} className="mb-2 font-semibold text-foreground">
                        {line.substring(2, line.length - 2)}
                      </p>
                    )
                  }
                  if (line.startsWith("> ")) {
                    return (
                      <blockquote
                        key={index}
                        className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground"
                      >
                        {line.substring(2)}
                      </blockquote>
                    )
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <li key={index} className="mb-1 ml-4 text-foreground">
                        {line.substring(line.indexOf(".") + 2)}
                      </li>
                    )
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="mb-1 ml-4 text-foreground">
                        {line.substring(2)}
                      </li>
                    )
                  }
                  if (line.trim() === "") {
                    return <div key={index} className="h-2" />
                  }
                  return (
                    <p key={index} className="mb-3 leading-relaxed text-foreground">
                      {line}
                    </p>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
