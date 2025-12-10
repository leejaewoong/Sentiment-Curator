const API_BASE_URL = "http://localhost:8000/api";

export async function fetchConfig() {
    const res = await fetch(`${API_BASE_URL}/config`);
    if (!res.ok) throw new Error("Failed to fetch config");
    return res.json();
}

export async function updateConfig(config: any) {
    const res = await fetch(`${API_BASE_URL}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Failed to update config");
    return res.json();
}

export async function fetchPosts() {
    const res = await fetch(`${API_BASE_URL}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
}

export async function fetchPost(id: number) {
    const res = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
}

export async function fetchStats() {
    const res = await fetch(`${API_BASE_URL}/posts/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

export async function triggerCrawler(urls: string[], prompt: string) {
    const res = await fetch(`${API_BASE_URL}/crawler/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, prompt }),
    });
    if (!res.ok) throw new Error("Failed to trigger crawler");
    return res.json();
}
