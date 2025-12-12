import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardStats } from "@/lib/types";

export function useStats() {
  return useQuery<DashboardStats>({
    queryKey: ["stats"],
    queryFn: () => apiClient.getStats<DashboardStats>(),
    refetchInterval: 60000, // Refetch every minute
  });
}
