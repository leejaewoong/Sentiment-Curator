export interface Post {
  id: string;
  reddit_id: string;
  subreddit: string;
  title: string;
  content: string;
  author: string;
  url: string;
  image_urls: string[];
  created_at: string;
  upvotes: number;
  num_comments: number;
}

export interface FilteredPost {
  id: string;
  post_id: string;
  relevance_score: number;
  summary: string;
  related_post_ids: string[];
  sent_to_slack: boolean;
  slack_ts: string | null;
  created_at: string;
}

export interface UserConfig {
  target_hours: number;
  num_posts: number;
  prompt: string;
  slack_channel: string;
  delivery_mode: "manual" | "hourly" | "daily" | "custom";
  schedule_cron?: string;
}

export interface CrawlJob {
  id: string;
  status: "pending" | "running" | "success" | "failed";
  subreddit: string;
  posts_collected: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}
