"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, BarChart3, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Configuration", href: "/config", icon: Settings },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-16 flex-col border-r bg-background">
      {/* Logo/Brand */}
      <div className="flex h-14 items-center justify-center border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm">
          SC
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "w-full h-12",
                  isActive && "bg-secondary"
                )}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-12"
          title="Run Crawler"
        >
          <Play className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
