"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  actions?: FloatingAction[]
  mainIcon?: React.ReactNode
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  cultural?: boolean
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = [],
  mainIcon = <Plus className="w-6 h-6" />,
  position = "bottom-right",
  cultural = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }

  const actionPositions = {
    "bottom-right": (index: number) => ({ x: 0, y: -(60 * (index + 1)) }),
    "bottom-left": (index: number) => ({ x: 0, y: -(60 * (index + 1)) }),
    "top-right": (index: number) => ({ x: 0, y: 60 * (index + 1) }),
    "top-left": (index: number) => ({ x: 0, y: 60 * (index + 1) }),
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      {/* 子动作按钮 */}
      <AnimatePresence>
        {isOpen &&
          actions.map((action, index) => (
            <motion.button
              key={index}
              className={cn(
                "absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white mb-2",
                action.color || (cultural ? "bg-gradient-to-r from-amber-500 to-yellow-500" : "bg-blue-500"),
                "hover:scale-110 transition-transform",
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                ...actionPositions[position](index),
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {action.icon}

              {/* 标签 */}
              <motion.div
                className={cn(
                  "absolute whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none",
                  position.includes("right") ? "right-full mr-2" : "left-full ml-2",
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {action.label}
              </motion.div>
            </motion.button>
          ))}
      </AnimatePresence>

      {/* 主按钮 */}
      <motion.button
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white relative overflow-hidden",
          cultural
            ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 背景光效 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {mainIcon}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export { FloatingActionButton }
