// src/components/ui/toast.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { XCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  variant: 'success' | 'error' | 'info';
  title?: string;
  description: string;
  onClose: () => void;
}

export function Toast({ variant, title, description, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-white" />,
    error: <XCircle className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-white" />
  };

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${bgColors[variant]} rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px]`}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h4 className="font-medium text-white">{title}</h4>}
        <p className="text-white text-sm">{description}</p>
      </div>
      <button onClick={onClose} className="text-white hover:opacity-80">
        <XCircle className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts }: { toasts: unknown[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <Toast key={index} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}