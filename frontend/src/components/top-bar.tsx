"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, Play } from "lucide-react"
import { triggerCrawler } from "@/lib/api"
import { usePathname } from "next/navigation"

export function TopBar() {
  const pathname = usePathname()

  const handleRunCrawler = async () => {
    try {
      // Use default or configured values. For now, hardcoded or fetched from config?
      // Ideally, trigger without args and let backend use stored config.
      // But backend endpoint expects urls and prompt.
      // Let's assume we send empty to use defaults or we need to fetch config first.
      // For simplicity, let's just trigger with a dummy or empty list and let backend handle it if possible.
      // Or better, update backend to allow running with stored config.
      // Current backend endpoint: POST /crawler/run { urls: [], prompt: "" }

      // Let's just alert for now as we don't have the config here easily without fetching.
      // Or we can fetch config then trigger.
      alert("Triggering crawler...")
      await triggerCrawler(["https://news.ycombinator.com"], "Find AI news")
      alert("Crawler started!")
    } catch (error) {
      console.error("Failed to run crawler:", error)
      alert("Failed to run crawler.")
    }
  }

  // Generate breadcrumbs based on pathname
  const segments = pathname.split("/").filter(Boolean)

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">{"Sentiment Curator"}</span>
        {segments.map((segment, index) => (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">{segment}</span>
          </div>
        ))}
      </div>
      <Button size="sm" className="gap-2" onClick={handleRunCrawler}>
        <Play className="h-4 w-4" />
        {"Run Crawler"}
      </Button>
    </div>
  )
}
