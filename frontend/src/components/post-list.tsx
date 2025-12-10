"use client"

import { cn } from "@/lib/utils"
import { FileText, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Post {
  id: string
  title: string
  timestamp: string
  type: "article" | "discussion" | "news"
  date: string
  reactions: number
  threadCount: number
  summary?: string
  content?: string
  url?: string
  sentiment?: "positive" | "neutral" | "negative"
  // Add other fields as needed
}

interface PostListProps {
  posts: Post[]
  selectedPost: string | null
  onSelectPost: (postId: string) => void
}

export function PostList({ posts, selectedPost, onSelectPost }: PostListProps) {
  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="flex h-10 items-center border-b border-border px-3 shrink-0">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{"Crawled Posts"}</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => onSelectPost(post.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                selectedPost === post.id ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50",
              )}
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-medium">{post.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.timestamp}</span>
                  <span>{"•"}</span>
                  <span className="capitalize">{post.type}</span>
                </div>
              </div>
              {selectedPost === post.id && <ChevronRight className="mt-1 h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
