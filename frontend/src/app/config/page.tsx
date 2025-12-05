"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Play, Save, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function ConfigPage() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState({
        urls: ["https://news.ycombinator.com"],
        schedule: "0 9 * * *",
        prompt: "Find tech trends...",
        slackChannel: "#general"
    })

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        try {
            const data = await api.getConfig()
            setConfig(data)
        } catch (e) {
            console.error("Failed to load config", e)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.updateConfig(config)
            alert("Configuration saved!")
        } catch (e) {
            alert("Failed to save config")
        } finally {
            setSaving(false)
        }
    }

    const handleRun = async () => {
        setLoading(true)
        try {
            await api.runCrawler(config.urls, config.prompt)
            alert("Crawler job started! Check Dashboard for results.")
        } catch (e) {
            alert("Failed to start crawler")
        } finally {
            setLoading(false)
        }
    }

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...config.urls]
        newUrls[index] = value
        setConfig({ ...config, urls: newUrls })
    }

    const addUrl = () => {
        setConfig({ ...config, urls: [...config.urls, ""] })
    }

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            {/* Toolbar */}
            <div className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
                <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                    <span className="text-blue-400">config.ts</span>
                    <span className="text-[#858585] text-xs ml-2">Modified</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 hover:bg-[#333] text-[#cccccc]" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                    </Button>
                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={handleRun} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Run Crawler
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                <div className="flex gap-4">
                    {/* Line Numbers */}
                    <div className="flex flex-col text-right text-[#858585] select-none w-8">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <span key={i} className="leading-8">{i + 1}</span>
                        ))}
                    </div>

                    {/* Code Content */}
                    <div className="flex-1 space-y-4 max-w-3xl">
                        <div className="text-[#6a9955]">// Sentiment Curator Configuration</div>

                        <div className="space-y-1">
                            <div className="text-[#569cd6]">export const <span className="text-[#4ec9b0]">config</span> = {"{"}</div>

                            {/* Targets */}
                            <div className="pl-4 space-y-2">
                                <div className="text-[#6a9955]">// Target URLs to crawl</div>
                                <div className="text-[#9cdcfe]">targets: [</div>
                                <div className="pl-4 space-y-2">
                                    {config.urls.map((url, i) => (
                                        <Input
                                            key={i}
                                            value={url}
                                            onChange={(e) => updateUrl(i, e.target.value)}
                                            className="h-8 bg-[#333] border-none text-[#ce9178] font-mono"
                                        />
                                    ))}
                                    <Button variant="ghost" size="sm" className="h-6 text-[#858585] hover:text-white" onClick={addUrl}>+ Add URL</Button>
                                </div>
                                <div className="text-[#9cdcfe]">],</div>
                            </div>

                            {/* Schedule */}
                            <div className="pl-4 space-y-2 mt-4">
                                <div className="text-[#6a9955]">// Execution Schedule (Cron format)</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#9cdcfe]">schedule:</span>
                                    <Input
                                        value={config.schedule}
                                        onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                                        className="h-8 w-48 bg-[#333] border-none text-[#ce9178] font-mono"
                                    />
                                    <span className="text-[#6a9955]">// Run daily at 9 AM</span>
                                </div>
                            </div>

                            {/* Prompt */}
                            <div className="pl-4 space-y-2 mt-4">
                                <div className="text-[#6a9955]">// AI Filtering Prompt</div>
                                <div className="text-[#6a9955]">// Hint: Describe what you want to find in natural language</div>
                                <div className="flex items-start gap-2">
                                    <span className="text-[#9cdcfe] whitespace-nowrap">prompt:</span>
                                    <Textarea
                                        value={config.prompt}
                                        onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                                        className="bg-[#333] border-none text-[#ce9178] font-mono min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {/* Slack */}
                            <div className="pl-4 space-y-2 mt-4">
                                <div className="text-[#6a9955]">// Slack Integration</div>
                                <div className="text-[#9cdcfe]">slack: {"{"}</div>
                                <div className="pl-4 flex items-center gap-2">
                                    <span className="text-[#9cdcfe]">channel:</span>
                                    <Input
                                        value={config.slackChannel}
                                        onChange={(e) => setConfig({ ...config, slackChannel: e.target.value })}
                                        className="h-8 w-48 bg-[#333] border-none text-[#ce9178] font-mono"
                                    />
                                </div>
                                <div className="text-[#9cdcfe]">{"}"}</div>
                            </div>

                            <div className="text-[#569cd6]">{"};"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
