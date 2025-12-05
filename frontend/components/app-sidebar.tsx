"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, Activity, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Configuration",
    url: "/config",
    icon: Settings,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Activity,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-16 flex flex-col items-center py-4 bg-[#1e1e1e] border-r border-[#333] h-screen text-[#858585]">
      <div className="mb-8">
        <Terminal className="w-8 h-8 text-blue-500" />
      </div>
      <nav className="flex flex-col gap-4 w-full">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              "p-3 flex justify-center hover:text-white transition-colors relative",
              pathname === item.url && "text-white border-l-2 border-blue-500 bg-[#2d2d2d]"
            )}
            title={item.title}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
      </nav>
    </div>
  )
}
