import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  variant?: 'primary' | 'gradient' | 'accent' | 'rainbow';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={`${styles.track} ${styles[size]}`}>
        <motion.div
          className={`${styles.fill} ${styles[variant]} ${styles[size]}`}
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {size === 'lg' && clampedProgress > 15 && (
            <span className={styles.fillText}>{Math.round(clampedProgress)}%</span>
          )}
        </motion.div>
      </div>
      {showLabel && (
        <span className={styles.label}>{label || `${Math.round(clampedProgress)}%`}</span>
      )}
    </div>
  );
}
