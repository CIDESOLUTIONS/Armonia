// src/components/ui/section-card.tsx
import { motion } from 'framer-motion';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className = '' }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}