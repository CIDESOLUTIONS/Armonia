// src/components/animations/FadeIn.tsx

"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // La animación solo se ejecuta una vez
    threshold: 0.1,    // Se activa cuando el 10% del elemento es visible
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};