import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Activity, Play, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e] p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Sentiment Curator</h1>
          <p className="text-[#858585] text-lg">Project Workspace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#252526] border-[#333] hover:border-blue-500 transition-colors group cursor-pointer">
            <Link href="/config">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#cccccc] group-hover:text-white">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#858585] text-sm">
                  Manage target URLs, schedule, and AI prompts.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="bg-[#252526] border-[#333] hover:border-green-500 transition-colors group cursor-pointer">
            <Link href="/dashboard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#cccccc] group-hover:text-white">
                  <Activity className="w-5 h-5 text-green-500" />
                  Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#858585] text-sm">
                  Monitor crawling status and view curated insights.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#cccccc]">Recent Activity</h2>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#252526] rounded border border-[#333]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-[#cccccc]">Daily Crawl Job #{100 + i}</span>
                </div>
                <span className="text-xs text-[#858585]">2 hours ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
