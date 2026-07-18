import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;

    // Auto close handled in Context, but we can also handle local cleanup if needed
  }, [toast]);

  if (!toast) return null;

  const config = {
    success: {
      bg: 'bg-emerald-50/95 border-emerald-200/80',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      text: 'text-emerald-900',
      description: 'text-emerald-700/80',
      progress: 'bg-emerald-500',
      shadow: 'shadow-emerald-100/50',
    },
    error: {
      bg: 'bg-rose-50/95 border-rose-200/80',
      icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
      text: 'text-rose-900',
      description: 'text-rose-700/80',
      progress: 'bg-rose-500',
      shadow: 'shadow-rose-100/50',
    },
    info: {
      bg: 'bg-blue-50/95 border-blue-200/80',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      text: 'text-blue-900',
      description: 'text-blue-700/80',
      progress: 'bg-blue-500',
      shadow: 'shadow-blue-100/50',
    }
  }[toast.type];

  return (
    <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, scale: 0.95, filter: 'blur(2px)' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden backdrop-blur-md rounded-2xl border p-4.5 shadow-2xl flex items-start space-x-3.5 ${config.bg} ${config.shadow}`}
        >
          {/* Status Icon */}
          <div className="flex-shrink-0 pt-0.5">
            {config.icon}
          </div>

          {/* Toast Message Body */}
          <div className="flex-grow pr-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
              System Alert
            </h4>
            <p className="text-sm font-medium text-gray-800 mt-1 leading-relaxed">
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress Shrinking Bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
            className={`absolute bottom-0 left-0 h-1.2 ${config.progress}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
