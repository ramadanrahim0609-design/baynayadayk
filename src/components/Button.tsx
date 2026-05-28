import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${loading ? styles.loading : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileTap={!disabled && !loading ? { scale: 0.96, y: 3 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
    >
      {loading ? (
        <div className={styles.spinner} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className={styles.iconLeft}>{icon}</span>}
          <span className={styles.text}>{children}</span>
          {icon && iconPosition === 'right' && <span className={styles.iconRight}>{icon}</span>}
        </>
      )}
    </motion.button>
  );
}
