import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RedditPost } from "@/lib/types";

export function usePosts() {
  return useQuery<RedditPost[]>({
    queryKey: ["posts"],
    queryFn: () => apiClient.getHistory<RedditPost[]>(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function usePost(postId: string) {
  return useQuery<RedditPost>({
    queryKey: ["post", postId],
    queryFn: () => apiClient.getPostDetail<RedditPost>(postId),
    enabled: !!postId,
  });
}
