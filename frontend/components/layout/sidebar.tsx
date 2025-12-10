"use client"

import { Home, Settings, LayoutDashboard, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "Statistics", href: "/statistics" },
  { icon: Settings, label: "Config", href: "/config" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-16 flex-col items-center border-r border-border bg-sidebar py-4">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm">
        SC
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
