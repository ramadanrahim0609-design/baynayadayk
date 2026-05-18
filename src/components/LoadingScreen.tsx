import { motion } from 'framer-motion';
import { BookOpen, Zap } from 'lucide-react';
import styles from './LoadingScreen.module.css';

export function LoadingScreen() {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.logoContainer}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.logoIcon}
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <BookOpen size={48} />
        </motion.div>
        <motion.h1
          className={styles.logoText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Байна Ядайк
        </motion.h1>
        <motion.p
          className={styles.logoSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Учи арабский как в Duolingo
        </motion.p>
        <motion.div
          className={styles.loadingXP}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Zap size={14} />
          <span>Готовим уроки...</span>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.loadingBar}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </div>
  );
}