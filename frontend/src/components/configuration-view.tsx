"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Save, TestTube2 } from "lucide-react"
import { fetchConfig, updateConfig } from "@/lib/api"

export function ConfigurationView() {
  const [config, setConfig] = useState({
    targetUrls: "",
    schedule: "",
    systemPrompt: "",
    relevanceThreshold: 75,
    maxItems: 10,
    slackWebhook: "",
    channelName: "",
  })

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await fetchConfig()
        setConfig(prev => ({
          ...prev,
          targetUrls: data.urls ? data.urls.join("\n") : "",
          schedule: data.schedule || "",
          systemPrompt: data.prompt || "",
          // Other fields might not be in backend yet
        }))
      } catch (error) {
        console.error("Failed to load config:", error)
      }
    }
    loadConfig()
  }, [])

  const handleSave = async () => {
    try {
      const payload = {
        urls: config.targetUrls.split("\n").filter(u => u.trim() !== ""),
        schedule: config.schedule,
        prompt: config.systemPrompt,
        // Add other fields if backend supports them
      }
      await updateConfig(payload)
      alert("Configuration saved!")
    } catch (error) {
      console.error("Failed to save config:", error)
      alert("Failed to save configuration.")
    }
  }

  const handleTestConnection = () => {
    console.log("[v0] Testing Slack connection")
    // TODO: Implement test connection logic
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your Sentiment Curator settings</p>
        </div>

        {/* Crawler Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Crawler Settings</CardTitle>
            <CardDescription>Configure how content is crawled and collected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-urls" className="text-sm font-medium">
                Target URLs
              </Label>
              <Textarea
                id="target-urls"
                placeholder="Enter URLs separated by newlines"
                value={config.targetUrls}
                onChange={(e) => setConfig({ ...config, targetUrls: e.target.value })}
                className="font-mono text-sm min-h-[100px] bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground">One URL per line</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule" className="text-sm font-medium">
                Crawling Schedule
              </Label>
              <Input
                id="schedule"
                placeholder="e.g., 0 */6 * * * (Every 6 hours)"
                value={config.schedule}
                onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                className="font-mono text-sm bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground">Cron expression format</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Filtering Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">AI Filtering Settings</CardTitle>
            <CardDescription>Define how AI filters and selects relevant content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt" className="text-sm font-medium">
                System Prompt
              </Label>
              <Textarea
                id="system-prompt"
                placeholder="Describe what kind of posts you want to filter..."
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                className="font-mono text-sm min-h-[150px] bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground">Instructions for AI to determine relevant content</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="relevance-threshold" className="text-sm font-medium">
                  Relevance Threshold
                </Label>
                <span className="text-sm font-mono text-muted-foreground">{config.relevanceThreshold}%</span>
              </div>
              <Slider
                id="relevance-threshold"
                min={0}
                max={100}
                step={5}
                value={[config.relevanceThreshold]}
                onValueChange={(value) => setConfig({ ...config, relevanceThreshold: value[0] })}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">Minimum confidence score for content to be included</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-items" className="text-sm font-medium">
                Max Items per Notification
              </Label>
              <Input
                id="max-items"
                type="number"
                min="1"
                max="50"
                value={config.maxItems}
                onChange={(e) => setConfig({ ...config, maxItems: Number.parseInt(e.target.value) || 10 })}
                className="font-mono text-sm bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground">Maximum number of items to include in each notification</p>
            </div>
          </CardContent>
        </Card>

        {/* Slack Integration */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Slack Integration</CardTitle>
            <CardDescription>Connect to Slack for notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slack-webhook" className="text-sm font-medium">
                Slack Webhook URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="slack-webhook"
                  type="password"
                  placeholder="https://hooks.slack.com/services/..."
                  value={config.slackWebhook}
                  onChange={(e) => setConfig({ ...config, slackWebhook: e.target.value })}
                  className="font-mono text-sm bg-muted/50 border-border flex-1"
                />
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleTestConnection}
                  className="gap-2 bg-transparent"
                >
                  <TestTube2 className="h-4 w-4" />
                  Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Your Slack incoming webhook URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-name" className="text-sm font-medium">
                Channel Name
              </Label>
              <Input
                id="channel-name"
                placeholder="#notifications"
                value={config.channelName}
                onChange={(e) => setConfig({ ...config, channelName: e.target.value })}
                className="font-mono text-sm bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground">Slack channel to send notifications</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  )
}
