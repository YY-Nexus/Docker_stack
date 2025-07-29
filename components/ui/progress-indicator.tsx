"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "cultural" | "gradient"
  showValue?: boolean
  className?: string
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showValue = false,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "cultural":
        return "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
      case "gradient":
        return "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", sizeClasses[size])}>
        <motion.div
          className={cn("h-full rounded-full", getVariantClasses())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {variant === "cultural" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}
      </div>

      {showValue && (
        <motion.div
          className="text-sm text-center mt-2 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  )
}

export { ProgressIndicator }
