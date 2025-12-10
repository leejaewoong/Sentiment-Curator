"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, ExternalLink, TrendingUp } from "lucide-react";

interface Post {
  id: number;
  title: string;
  content: string;
  url: string;
  summary: string;
  ai_score: number;
  created_at: string;
  is_notified: boolean;
}

interface Stats {
  total_posts: number;
  filtered_posts: number;
  notified_posts: number;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ total_posts: 0, filtered_posts: 0, notified_posts: 0 });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load posts
      const postsResponse = await fetch("http://localhost:8000/api/posts/");
      const postsData = await postsResponse.json();
      setPosts(postsData);

      if (postsData.length > 0) {
        setSelectedPost(postsData[0]);
      }

      // Load stats
      const statsResponse = await fetch("http://localhost:8000/api/posts/stats");
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              수집된 콘텐츠 및 통계
            </p>
          </div>
          <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="border-b p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 게시글</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_posts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">필터링됨</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.filtered_posts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slack 전송</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notified_posts}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Split View: Post List + Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Post List */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-3 border-b bg-muted/50">
            <h2 className="font-semibold text-sm">게시글 목록</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {posts.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  수집된 게시글이 없습니다
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-colors mb-1 ${
                      selectedPost?.id === post.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          점수: {post.ai_score}/10
                        </p>
                      </div>
                      {post.is_notified && (
                        <div className="h-2 w-2 rounded-full bg-green-500" title="Slack 전송됨" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Post Detail */}
        <div className="flex-1 flex flex-col">
          {selectedPost ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{selectedPost.title}</h2>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>점수: {selectedPost.ai_score}/10</span>
                      <span>•</span>
                      <span>{new Date(selectedPost.created_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedPost.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      원문 보기
                    </a>
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedPost.summary && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">요약</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPost.summary}
                      </p>
                      <Separator className="my-4" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-sm mb-2">내용</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedPost.content}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                게시글을 선택하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
