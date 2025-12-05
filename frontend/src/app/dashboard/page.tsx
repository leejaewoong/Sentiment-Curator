"use client"

import { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { MessageSquare, ThumbsUp, ExternalLink, Terminal, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

// Mock Data for Charts (Keep for now as we don't have enough real data)
const trendData = [
    { name: 'Mon', posts: 0, reactions: 0 },
    { name: 'Tue', posts: 0, reactions: 0 },
    { name: 'Wed', posts: 0, reactions: 0 },
    { name: 'Thu', posts: 0, reactions: 0 },
    { name: 'Fri', posts: 0, reactions: 0 },
    { name: 'Sat', posts: 0, reactions: 0 },
    { name: 'Sun', posts: 0, reactions: 0 },
]

export default function DashboardPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [selectedPost, setSelectedPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        try {
            const data = await api.getFilteredPosts()
            setPosts(data)
            if (data.length > 0) {
                setSelectedPost(data[0])
            }
        } catch (e) {
            console.error("Failed to load posts", e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-[#858585]"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
            {/* Top Panel: Analytics */}
            <div className="h-[300px] border-b border-[#333] p-4 bg-[#1e1e1e]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#858585]">Analytics</h2>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs border-[#333] text-[#858585]">Last 7 Days</Badge>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 h-[220px]">
                    <div className="bg-[#252526] p-4 rounded border border-[#333]">
                        <h3 className="text-xs mb-2 text-[#858585]">Engagement Trend</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <XAxis dataKey="name" stroke="#858585" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#858585" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#252526', border: '1px solid #333' }}
                                    itemStyle={{ color: '#cccccc' }}
                                />
                                <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="reactions" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-[#252526] p-4 rounded border border-[#333]">
                        <h3 className="text-xs mb-2 text-[#858585]">Top Activity</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <XAxis dataKey="name" stroke="#858585" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#252526', border: '1px solid #333' }}
                                    itemStyle={{ color: '#cccccc' }}
                                    cursor={{ fill: '#333' }}
                                />
                                <Bar dataKey="reactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Panel: Split View */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">

                    {/* Left Pane: Post List */}
                    <ResizablePanel defaultSize={30} minSize={20} className="bg-[#252526]">
                        <div className="h-full flex flex-col">
                            <div className="p-2 border-b border-[#333] flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#858585] uppercase">Sent History</span>
                                <Terminal className="w-3 h-3 text-[#858585]" />
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {posts.length === 0 ? (
                                        <div className="text-center text-[#858585] py-8 text-sm">No posts found.</div>
                                    ) : (
                                        posts.map((post) => (
                                            <div
                                                key={post.id}
                                                onClick={() => setSelectedPost(post)}
                                                className={`p-2 rounded cursor-pointer text-sm transition-colors ${selectedPost?.id === post.id
                                                        ? "bg-[#37373d] text-white"
                                                        : "text-[#cccccc] hover:bg-[#2a2d2e]"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="truncate font-medium">{post.title}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-[#858585]">
                                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.feedback_score || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="bg-[#333]" />

                    {/* Right Pane: Detail View */}
                    <ResizablePanel defaultSize={70}>
                        <div className="h-full flex flex-col bg-[#1e1e1e]">
                            <div className="p-2 border-b border-[#333] flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#858585] uppercase">Item Details</span>
                                <div className="flex gap-2">
                                    {selectedPost && <Badge className="bg-blue-900 text-blue-200 hover:bg-blue-800 border-none">Score: {selectedPost.relevance_score}</Badge>}
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                {selectedPost ? (
                                    <div className="max-w-3xl mx-auto space-y-6">
                                        {/* Header */}
                                        <div className="space-y-2">
                                            <h1 className="text-2xl font-bold text-white">{selectedPost.title}</h1>
                                            <div className="flex items-center gap-4 text-sm text-[#858585]">
                                                <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
                                                <a href={selectedPost.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                                                    Original Link <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>

                                        <Separator className="bg-[#333]" />

                                        {/* Summary */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-[#cccccc]">AI Summary</h3>
                                            <div className="p-4 bg-[#252526] rounded border border-[#333] text-[#d4d4d4] leading-relaxed">
                                                {selectedPost.summary}
                                            </div>
                                        </div>

                                        {/* Reactions */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-[#cccccc]">Slack Activity</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Card className="bg-[#252526] border-[#333]">
                                                    <div className="p-4 flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                                                            <ThumbsUp className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-bold text-white">{selectedPost.feedback_score || 0}</div>
                                                            <div className="text-xs text-[#858585]">Total Reactions</div>
                                                        </div>
                                                    </div>
                                                </Card>
                                                <Card className="bg-[#252526] border-[#333]">
                                                    <div className="p-4 flex items-center gap-3">
                                                        <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-bold text-white">{selectedPost.thread_count || 0}</div>
                                                            <div className="text-xs text-[#858585]">Thread Replies</div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[#858585]">
                                        Select a post to view details
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>
        </div>
    )
}
