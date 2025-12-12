"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { settingsSchema, type SettingsFormData } from "@/schemas/settings-schema";
import { useEffect } from "react";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      checkInterval: 24,
      postLimit: 5,
      filterPrompt: "",
      slackChannel: "#pubg-news",
      deliverySchedule: "manual",
    },
  });

  // Load settings data when fetched
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    updateSettings(data);
  };

  const deliverySchedule = watch("deliverySchedule");

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ 설정</h1>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 크롤링 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>크롤링 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="checkInterval">대상 기간 (시간)</Label>
                  <Input
                    id="checkInterval"
                    type="number"
                    {...register("checkInterval", { valueAsNumber: true })}
                    placeholder="24"
                    className="mt-2"
                  />
                  {errors.checkInterval && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.checkInterval.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    몇 시간 이내에 작성된 포스트를 수집할지 설정합니다.
                  </p>
                </div>

                <div>
                  <Label htmlFor="postLimit">선별 개수</Label>
                  <Input
                    id="postLimit"
                    type="number"
                    {...register("postLimit", { valueAsNumber: true })}
                    placeholder="5"
                    className="mt-2"
                  />
                  {errors.postLimit && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.postLimit.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    한 번에 전달받을 포스트 개수를 설정합니다. (1-20)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>AI 필터링 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="filterPrompt">선별 프롬프트</Label>
                  <Textarea
                    id="filterPrompt"
                    {...register("filterPrompt")}
                    rows={4}
                    placeholder="예: 신규 패치 관련 버그 리포트와 밸런스 논의만"
                    className="mt-2"
                  />
                  {errors.filterPrompt && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.filterPrompt.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    AI가 참고할 관심사를 자연어로 입력하세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Slack 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>Slack 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slackChannel">Slack 채널</Label>
                  <Input
                    id="slackChannel"
                    {...register("slackChannel")}
                    placeholder="#pubg-news"
                    className="mt-2"
                  />
                  {errors.slackChannel && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.slackChannel.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="deliverySchedule">전달 시점</Label>
                  <Select
                    value={deliverySchedule}
                    onValueChange={(value) =>
                      setValue("deliverySchedule", value as any)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="전달 시점 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">수동 실행 (즉시)</SelectItem>
                      <SelectItem value="hourly">매시간</SelectItem>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="custom">커스텀</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.deliverySchedule && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.deliverySchedule.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 저장 버튼 */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : "설정 저장"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isPending}
              >
                초기화
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
