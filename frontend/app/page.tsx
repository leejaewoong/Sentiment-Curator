"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings, Play, BarChart3 } from "lucide-react";

export default function HomePage() {
  const [crawlerRunning, setCrawlerRunning] = useState(false);

  const handleRunCrawler = async () => {
    setCrawlerRunning(true);
    try {
      const response = await fetch("http://localhost:8000/api/crawler/run", {
        method: "POST",
      });

      if (response.ok) {
        alert("크롤러가 백그라운드에서 실행되었습니다.");
      } else {
        const data = await response.json();
        alert(data.detail || "크롤러 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to run crawler:", error);
      alert("크롤러 실행 중 오류가 발생했습니다.");
    } finally {
      setCrawlerRunning(false);
    }
  };
  return (
    <div className="h-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Sentiment Curator</h1>
        <p className="text-muted-foreground">
          AI 기반 콘텐츠 큐레이션 및 필터링 서비스
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <Link href="/config">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Configuration
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">설정</div>
              <p className="text-xs text-muted-foreground">
                크롤링 대상 및 필터링 프롬프트 설정
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card
          className="hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={handleRunCrawler}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Run Crawler
            </CardTitle>
            <Play className={`h-4 w-4 text-muted-foreground ${crawlerRunning ? "animate-pulse" : ""}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {crawlerRunning ? "실행 중..." : "수동 실행"}
            </div>
            <p className="text-xs text-muted-foreground">
              크롤러를 즉시 실행
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <Link href="/dashboard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dashboard
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">대시보드</div>
              <p className="text-xs text-muted-foreground">
                수집된 콘텐츠 및 통계 확인
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 개요</CardTitle>
          <CardDescription>
            Sentiment Curator는 웹 크롤링, AI 필터링, Slack 알림을 통합한 지능형 콘텐츠 큐레이션 시스템입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm">주요 기능</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>자동 웹 크롤링 (Playwright 기반)</li>
              <li>AI 기반 콘텐츠 필터링 (OpenAI API)</li>
              <li>Slack 알림 및 피드백 루프</li>
              <li>VS Code 스타일 대시보드</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">기술 스택</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Next.js</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">FastAPI</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">SQLite</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Playwright</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">OpenAI</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
