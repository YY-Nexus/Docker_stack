"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationToastProps {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose: (id: string) => void
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  title,
  description,
  type = "info",
  duration = 5000,
  onClose,
}) => {
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onClose(id)
          return 0
        }
        return prev - 100 / (duration / 100)
      })
    }, 100)

    return () => clearInterval(timer)
  }, [id, duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: "from-green-500 to-emerald-600",
    error: "from-red-500 to-rose-600",
    warning: "from-yellow-500 to-amber-600",
    info: "from-blue-500 to-cyan-600",
  }

  const Icon = icons[type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "relative w-full max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden",
      )}
    >
      {/* 进度条 */}
      <motion.div
        className={cn("absolute top-0 left-0 h-1 bg-gradient-to-r", colors[type])}
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* 图标 */}
          <motion.div
            className={cn("flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r", colors[type])}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Icon className="w-4 h-4 text-white m-1" />
          </motion.div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <motion.p
              className="text-sm font-medium text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.p>
            {description && (
              <motion.p
                className="text-xs text-gray-300 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* 关闭按钮 */}
          <motion.button
            onClick={() => onClose(id)}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3 h-3 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

interface ToastContextType {
  addToast: (toast: Omit<NotificationToastProps, "id" | "onClose">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<NotificationToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<NotificationToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <NotificationToast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
