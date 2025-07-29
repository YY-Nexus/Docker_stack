"use client"

import { type ReactNode, forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AdaptiveCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  cultural?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "glass" | "solid" | "outline"
}

export const AdaptiveCard = forwardRef<HTMLDivElement, AdaptiveCardProps>(
  (
    { children, className = "", hover = true, glow = false, cultural = true, size = "md", variant = "glass", ...props },
    ref,
  ) => {
    const sizeClasses = {
      sm: "p-3 rounded-lg",
      md: "p-4 sm:p-6 rounded-xl",
      lg: "p-6 sm:p-8 rounded-2xl",
    }

    const variantClasses = {
      default: "bg-card text-card-foreground border",
      glass: "bg-black/40 backdrop-blur-xl border-white/10",
      solid: "bg-gray-900 border-gray-800",
      outline: "bg-transparent border-2",
    }

    const baseClasses = cn(
      "transition-all duration-300 shadow-lg",
      sizeClasses[size],
      variantClasses[variant],
      hover && "hover:shadow-2xl hover:-translate-y-1 hover:border-white/20",
      glow && "shadow-purple-500/20 hover:shadow-purple-500/40",
      cultural && "border-amber-500/20 hover:border-amber-500/40",
      className,
    )

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        whileHover={hover ? { y: -4, scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

AdaptiveCard.displayName = "AdaptiveCard"
