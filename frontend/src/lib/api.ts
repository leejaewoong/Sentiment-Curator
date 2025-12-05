const API_BASE_URL = "http://localhost:8000/api";

export const api = {
    // Config
    getConfig: async () => {
        const res = await fetch(`${API_BASE_URL}/config`);
        return res.json();
    },
    updateConfig: async (config: any) => {
        const res = await fetch(`${API_BASE_URL}/config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config),
        });
        return res.json();
    },

    // Crawler
    runCrawler: async (urls: string[], prompt: string) => {
        const res = await fetch(`${API_BASE_URL}/crawler/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls, prompt }),
        });
        return res.json();
    },

    // Posts
    getPosts: async () => {
        const res = await fetch(`${API_BASE_URL}/posts`);
        return res.json();
    },
    getFilteredPosts: async () => {
        const res = await fetch(`${API_BASE_URL}/posts/filtered`);
        return res.json();
    }
};
