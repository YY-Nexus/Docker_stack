"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "sm" | "md" | "lg"
  autoFit?: boolean
  minItemWidth?: string
}

export function ResponsiveGrid({
  children,
  className = "",
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
  autoFit = false,
  minItemWidth = "300px",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  }

  const getGridCols = () => {
    if (autoFit) {
      return `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`
    }

    const colClasses = []
    if (cols.default) colClasses.push(`grid-cols-${cols.default}`)
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`)

    return colClasses.join(" ")
  }

  return <div className={cn("grid w-full", getGridCols(), gapClasses[gap], className)}>{children}</div>
}
