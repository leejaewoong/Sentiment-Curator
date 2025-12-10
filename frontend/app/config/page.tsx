"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw } from "lucide-react";

interface ConfigData {
  target_urls?: string[];
  filter_prompt?: string;
  slack_channel?: string;
}

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConfigData>({
    target_urls: [],
    filter_prompt: "",
    slack_channel: "",
  });

  // Load configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/config/");
      const data = await response.json();
      setConfig({
        target_urls: data.target_urls || [],
        filter_prompt: data.filter_prompt || "",
        slack_channel: data.slack_channel || "",
      });
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/config/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert("설정이 저장되었습니다.");
      } else {
        alert("설정 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configuration</h1>
          <p className="text-muted-foreground">
            크롤링 대상 및 필터링 설정을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadConfig} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      {/* Configuration Forms */}
      <div className="grid gap-6">
        {/* Target URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">크롤링 대상 URL</CardTitle>
            <CardDescription>
              수집할 웹사이트 주소를 입력하세요 (한 줄에 하나씩)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="https://example.com&#10;https://another-site.com"
              rows={5}
              value={config.target_urls?.join("\n") || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  target_urls: e.target.value.split("\n").filter((url) => url.trim()),
                })
              }
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              // 예시: https://example.com/posts
            </p>
          </CardContent>
        </Card>

        {/* Filter Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI 필터링 프롬프트</CardTitle>
            <CardDescription>
              수집된 콘텐츠를 필터링할 기준을 자연어로 설명하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="기술 블로그 중에서 React, Next.js, TypeScript와 관련된 글만 선별해주세요.&#10;특히 실무 경험이나 트러블슈팅 내용이 포함된 글을 우선적으로 선택해주세요."
              rows={6}
              value={config.filter_prompt || ""}
              onChange={(e) =>
                setConfig({ ...config, filter_prompt: e.target.value })
              }
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              // 팁: 구체적으로 작성할수록 더 정확한 필터링이 가능합니다
            </p>
          </CardContent>
        </Card>

        {/* Slack Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Slack 채널 설정</CardTitle>
            <CardDescription>
              알림을 받을 Slack 채널 ID를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="slack_channel">Slack Channel ID</Label>
              <Input
                id="slack_channel"
                placeholder="C1234567890"
                value={config.slack_channel || ""}
                onChange={(e) =>
                  setConfig({ ...config, slack_channel: e.target.value })
                }
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                // Slack 채널 ID는 채널 설정에서 확인할 수 있습니다
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
