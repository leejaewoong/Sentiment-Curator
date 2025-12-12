import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Settings } from "@/lib/types";
import toast from "react-hot-toast";

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => apiClient.getSettings<Settings>(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Settings) => apiClient.updateSettings<Settings>(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("설정이 저장되었습니다");
    },
    onError: (error: Error) => {
      toast.error(`설정 저장 실패: ${error.message}`);
    },
  });
}
