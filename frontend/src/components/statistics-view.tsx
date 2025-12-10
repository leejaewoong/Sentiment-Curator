"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { fetchPosts } from "@/lib/api"

export function StatisticsView() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPosts()
        setPosts(data)
      } catch (error) {
        console.error("Failed to fetch stats data:", error)
      }
    }
    loadData()
  }, [])

  // Aggregate data by date
  const dailyStats = posts.reduce(
    (acc, post) => {
      const date = new Date(post.created_at).toISOString().split('T')[0]
      const existing = acc.find((item: any) => item.date === date)
      if (existing) {
        existing.reactions += (post.feedback_score || 0)
        existing.threads += (post.thread_count || 0)
        existing.posts += 1
      } else {
        acc.push({
          date: date,
          reactions: (post.feedback_score || 0),
          threads: (post.thread_count || 0),
          posts: 1,
        })
      }
      return acc
    },
    [] as Array<{ date: string; reactions: number; threads: number; posts: number }>,
  )

  // Sort by date
  dailyStats.sort((a: any, b: any) => a.date.localeCompare(b.date))

  // Format date for display
  const chartData = dailyStats.map((item: any) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
  }))

  const colors = {
    reactions: "#3b82f6",
    threads: "#22c55e",
    grid: "#27272a",
    text: "#a1a1aa",
    tooltipBg: "#18181b",
    tooltipBorder: "#3f3f46",
  }

  return (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Statistics</h1>
          <p className="mt-2 text-sm text-muted-foreground">Daily reaction and thread statistics for crawled posts</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Daily Reactions & Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="displayDate" stroke={colors.text} tick={{ fill: colors.text }} />
                  <YAxis stroke={colors.text} tick={{ fill: colors.text }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.tooltipBg,
                      border: `1px solid ${colors.tooltipBorder}`,
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ color: colors.text }} />
                  <Line
                    type="monotone"
                    dataKey="reactions"
                    stroke={colors.reactions}
                    strokeWidth={2}
                    dot={{ fill: colors.reactions, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Reactions"
                  />
                  <Line
                    type="monotone"
                    dataKey="threads"
                    stroke={colors.threads}
                    strokeWidth={2}
                    dot={{ fill: colors.threads, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Threads"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{posts.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {posts.reduce((sum, post) => sum + (post.feedback_score || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Threads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {posts.reduce((sum, post) => sum + (post.thread_count || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
