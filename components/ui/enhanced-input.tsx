"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  cultural?: boolean
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, label, error, icon, cultural = false, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      if (props.onChange) {
        props.onChange(e)
      }
    }

    return (
      <div className="relative w-full">
        {/* 标签 */}
        {label && (
          <motion.label
            className={cn(
              "absolute left-3 transition-all duration-300 pointer-events-none z-10",
              focused || hasValue
                ? "top-2 text-xs text-amber-400 font-medium"
                : "top-1/2 -translate-y-1/2 text-sm text-gray-400",
              cultural && "text-amber-300",
            )}
            animate={{
              y: focused || hasValue ? -8 : 0,
              scale: focused || hasValue ? 0.85 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        {/* 图标 */}
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">{icon}</div>}

        {/* 输入框 */}
        <motion.input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
            label && "pt-6 pb-2",
            icon && "pl-10",
            cultural &&
              "border-amber-500/30 bg-black/20 backdrop-blur-sm focus-visible:ring-amber-500/50 focus-visible:border-amber-400",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          {...props}
        />

        {/* 聚焦时的光效 */}
        {focused && cultural && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-amber-400/50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* 错误信息 */}
        {error && (
          <motion.p
            className="text-xs text-red-500 mt-1 ml-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  },
)
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
