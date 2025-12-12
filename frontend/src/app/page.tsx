import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          🎮 Sentiment Curator
        </h1>
        <p className="text-center text-muted-foreground text-base md:text-lg mb-12 max-w-3xl mx-auto">
          PUBG 커뮤니티의 방대한 정보를 AI로 큐레이션하여 Slack으로 전달하는
          지능형 서비스
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">🤖 AI 큐레이션</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                프롬프트 기반 필터링으로 관심 있는 포스트만 선별
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📡 자동 크롤링</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reddit 실시간 모니터링 및 주기적 수집
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">💬 Slack 통합</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                개별 메시지 전송 및 자동 번역
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button asChild size="lg">
            <Link href="/dashboard">대시보드</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/settings">설정</Link>
          </Button>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Backend API:{" "}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              http://localhost:8000/docs
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
