"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/use-stats";
import { usePosts } from "@/hooks/use-posts";
import { formatDate, timeAgo } from "@/lib/utils";

function StatCard({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: string | number;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PostRow({
  title,
  sentiment,
  createdAt,
  score,
}: {
  title: string;
  sentiment: "positive" | "neutral" | "negative";
  createdAt: string;
  score: number;
}) {
  const sentimentColors = {
    positive: "text-green-600 dark:text-green-400",
    neutral: "text-gray-600 dark:text-gray-400",
    negative: "text-red-600 dark:text-red-400",
  };

  const sentimentLabels = {
    positive: "긍정",
    neutral: "중립",
    negative: "부정",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-sm text-muted-foreground">{timeAgo(createdAt)}</p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <span className={`text-sm font-medium ${sentimentColors[sentiment]}`}>
          {sentimentLabels[sentiment]}
        </span>
        <span className="text-sm text-muted-foreground">↑ {score}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: posts, isLoading: postsLoading, error: postsError } = usePosts();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📊 대시보드</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            title="전송된 포스트"
            value={stats?.totalPosts ?? 0}
            isLoading={statsLoading}
          />
          <StatCard
            title="최근 활동"
            value={stats?.recentActivity ?? 0}
            isLoading={statsLoading}
          />
          <StatCard
            title="마지막 업데이트"
            value={
              stats?.lastUpdate
                ? timeAgo(stats.lastUpdate)
                : "없음"
            }
            isLoading={statsLoading}
          />
        </div>

        {/* Sentiment Distribution */}
        {stats?.sentimentDistribution && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>감정 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">긍정</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.sentimentDistribution.positive}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">중립</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.sentimentDistribution.neutral}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">부정</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.sentimentDistribution.negative}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>최근 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="py-3">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : postsError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">
                  데이터를 불러오는데 실패했습니다.
                </p>
                <Button onClick={() => window.location.reload()}>
                  다시 시도
                </Button>
              </div>
            ) : posts && posts.length > 0 ? (
              <div>
                {posts.slice(0, 10).map((post) => (
                  <PostRow
                    key={post.id}
                    title={post.title}
                    sentiment={post.sentiment}
                    createdAt={post.createdAt}
                    score={post.score}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">
                  아직 전달된 포스트가 없습니다.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <Link
                    href="/settings"
                    className="text-primary hover:underline"
                  >
                    설정
                  </Link>
                  에서 크롤링을 시작하세요.
                </p>
                <Button asChild>
                  <Link href="/settings">설정으로 이동</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
