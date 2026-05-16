import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  variant?: 'primary' | 'success' | 'warning' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  variant = 'gradient',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.container}>
      {showLabel && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>{label}</span>
          <span className={styles.percentage}>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`${styles.track} ${styles[size]}`}>
        <motion.div
          className={`${styles.fill} ${styles[variant]}`}
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}