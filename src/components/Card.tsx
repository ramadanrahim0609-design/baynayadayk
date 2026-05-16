import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
}: CardProps) {
  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileTap: { scale: 0.98 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}