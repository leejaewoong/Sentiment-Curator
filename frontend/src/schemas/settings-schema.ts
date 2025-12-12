import { z } from "zod";

export const settingsSchema = z.object({
  checkInterval: z
    .number({ invalid_type_error: "숫자를 입력하세요" })
    .min(1, "최소 1시간")
    .max(168, "최대 168시간(1주일)"),
  postLimit: z
    .number({ invalid_type_error: "숫자를 입력하세요" })
    .min(1, "최소 1개")
    .max(20, "최대 20개"),
  filterPrompt: z.string().min(10, "최소 10자 이상 입력하세요").optional(),
  slackChannel: z
    .string()
    .min(1, "Slack 채널을 입력하세요")
    .regex(/^#/, "# 으로 시작해야 합니다"),
  deliverySchedule: z.enum(["manual", "hourly", "daily", "custom"], {
    required_error: "전달 시점을 선택하세요",
  }),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
