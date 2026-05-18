import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { LearningPath } from '../components/LearningPath';
import { useAppStore } from '../store/useAppStore';
import styles from './LearnPage.module.css';

export function LearnPage() {
  const { userProgress, getTodayProgress } = useAppStore();
  const todayProgress = getTodayProgress();

  return (
    <div className={styles.page}>
      {/* Animated background */}
      <div className="app-background">
        <div className="light-spot-1" />
        <div className="light-spot-2" />
      </div>

      <Header />

      <main className={styles.main}>
        {/* Greeting section */}
        <motion.div
          className={styles.greeting}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.greetingText}>Ассаляму алейкум!</h1>
          <p className={styles.subGreeting}>Продолжим изучение арабского?</p>
        </motion.div>

        {/* Daily progress card */}
        <motion.div
          className={styles.dailyCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <BookOpen size={20} />
              <span>Сегодня</span>
            </div>
            <span className={styles.cardCount}>
              {todayProgress.learned} / {todayProgress.goal}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${todayProgress.percentage}%` }}
            />
          </div>
        </motion.div>

        {/* Learning path */}
        <motion.div
          className={styles.pathSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LearningPath />
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}