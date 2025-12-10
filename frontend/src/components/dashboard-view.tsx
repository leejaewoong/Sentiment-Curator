"use client"

import { useState, useEffect } from "react"
import { PostList, Post } from "@/components/post-list"
import { PostDetail, PostDetailData } from "@/components/post-detail"
import { fetchPosts } from "@/lib/api"

export function DashboardView() {
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPosts() {
            try {
                const data = await fetchPosts()
                // Map backend data to frontend interface
                const mappedPosts: Post[] = data.map((p: any) => ({
                    id: p.id.toString(),
                    title: p.title || "Untitled",
                    timestamp: new Date(p.created_at).toLocaleString(),
                    type: "article", // Default or infer
                    date: p.created_at,
                    reactions: p.feedback_score || 0,
                    threadCount: p.thread_count || 0,
                    summary: p.summary,
                    content: p.content,
                    url: p.url,
                    sentiment: "neutral", // Default
                    // Map reaction_data if available
                    reactionData: p.reaction_data
                }))
                setPosts(mappedPosts)
                if (mappedPosts.length > 0) {
                    setSelectedPostId(mappedPosts[0].id)
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error)
            } finally {
                setLoading(false)
            }
        }
        loadPosts()
    }, [])

    const selectedPost = posts.find((p) => p.id === selectedPostId)

    // Map selectedPost to PostDetailData
    const postDetailData: PostDetailData | null = selectedPost
        ? {
            id: selectedPost.id,
            title: selectedPost.title,
            url: selectedPost.url || "",
            timestamp: selectedPost.timestamp,
            content: selectedPost.content || "",
            summary: selectedPost.summary || "",
            sentiment: selectedPost.sentiment || "neutral",
            reactions: [], // TODO: Parse reactionData
            threads: [], // TODO: Fetch threads if separate
        }
        : null

    return (
        <div className="flex h-full">
            <PostList
                posts={posts}
                selectedPost={selectedPostId}
                onSelectPost={setSelectedPostId}
            />
            <PostDetail post={postDetailData} />
        </div>
    )
}
