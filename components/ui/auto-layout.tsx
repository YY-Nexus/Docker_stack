"use client"

import { type ReactNode, Children, cloneElement, isValidElement } from "react"
import { motion } from "framer-motion"
import { useResponsive } from "@/hooks/use-responsive"
import { cn } from "@/lib/utils"

interface AutoLayoutProps {
  children: ReactNode
  className?: string
  direction?: "row" | "column" | "auto"
  spacing?: "none" | "sm" | "md" | "lg"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  wrap?: boolean
  animate?: boolean
  stagger?: number
}

export function AutoLayout({
  children,
  className = "",
  direction = "auto",
  spacing = "md",
  align = "stretch",
  justify = "start",
  wrap = true,
  animate = true,
  stagger = 0.1,
}: AutoLayoutProps) {
  const { isMobile, isTablet } = useResponsive()

  const getDirection = () => {
    if (direction === "auto") {
      return isMobile ? "column" : "row"
    }
    return direction
  }

  const spacingClasses = {
    none: "gap-0",
    sm: "gap-2 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  }

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }

  const directionClasses = {
    row: "flex-row",
    column: "flex-col",
  }

  const containerClasses = cn(
    "flex",
    directionClasses[getDirection()],
    spacingClasses[spacing],
    alignClasses[align],
    justifyClasses[justify],
    wrap && "flex-wrap",
    className,
  )

  const childrenArray = Children.toArray(children)

  if (!animate) {
    return <div className={containerClasses}>{children}</div>
  }

  return (
    <div className={containerClasses}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * stagger,
            ease: "easeOut",
          }}
          className="flex-shrink-0"
        >
          {isValidElement(child) ? cloneElement(child) : child}
        </motion.div>
      ))}
    </div>
  )
}
