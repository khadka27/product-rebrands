"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"

export default function ThemeNavigation() {
  const pathname = usePathname()

  // Determine if we're on a theme-specific path
  const isRoot = pathname === "/"
  const isDark = pathname?.startsWith("/dark")
  const isLight = pathname?.startsWith("/light")

  return (
    <div className="fixed top-3 right-3 z-50 flex bg-[var(--card-bg)] backdrop-blur-md border border-[var(--card-border)] rounded-full p-0.5 shadow-lg">
      <Link
        href="/light"
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
          isLight || isRoot
            ? "bg-yellow-500 text-white"
            : "text-[var(--text-secondary)] hover:bg-[var(--card-inner-hover)]"
        }`}
        aria-label="Light mode"
      >
        <Sun className="w-3 h-3" />
      </Link>

      <Link
        href="/dark"
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
          isDark ? "bg-indigo-600 text-white" : "text-[var(--text-secondary)] hover:bg-[var(--card-inner-hover)]"
        }`}
        aria-label="Dark mode"
      >
        <Moon className="w-3 h-3" />
      </Link>
    </div>
  )
}
