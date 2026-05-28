import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Flame, Zap, Gift, ChevronRight, Sparkles, Target } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { LearningPath } from '../components/LearningPath';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import styles from './LearnPage.module.css';

export function LearnPage() {
  const { userProgress, getTodayProgress, xp, level, canClaimDailyReward, claimDailyReward } = useAppStore();
  const todayProgress = getTodayProgress();
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [claimedXP, setClaimedXP] = useState(0);

  useEffect(() => {
    if (canClaimDailyReward()) {
      setShowDailyReward(true);
    }
  }, [canClaimDailyReward]);

  const handleClaimDaily = () => {
    const reward = claimDailyReward();
    setClaimedXP(reward);
    setTimeout(() => setShowDailyReward(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className="app-background">
        <div className="light-spot-1" />
        <div className="light-spot-2" />
      </div>

      <Header showStats />

      <main className={styles.main}>
        {/* Greeting */}
        <motion.div
          className={styles.greeting}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.greetingText}>Ассаляму алейкум!</h1>
          <p className={styles.subGreeting}>Готов продолжить изучение?</p>
        </motion.div>

        {/* Daily Reward */}
        <AnimatePresence>
          {showDailyReward && claimedXP === 0 && (
            <motion.div
              className={styles.dailyReward}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
            >
              <div className={styles.rewardContent}>
                <div className={styles.rewardIcon}>
                  <Gift size={24} />
                </div>
                <div className={styles.rewardText}>
                  <span className={styles.rewardTitle}>Ежедневная награда!</span>
                  <span className={styles.rewardDesc}>
                    {userProgress.currentStreak > 0
                      ? `Серия: ${userProgress.currentStreak} ${getStreakEmoji(userProgress.currentStreak)}`
                      : 'Начни серию занятий'}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handleClaimDaily}
                  icon={<Sparkles size={16} />}
                >
                  + {20 + Math.min(userProgress.currentStreak * 5, 50)} XP
                </Button>
              </div>
            </motion.div>
          )}
          {claimedXP > 0 && (
            <motion.div
              className={styles.claimedReward}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Sparkles size={20} />
              +{claimedXP} XP получено!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.statCard}>
            <Flame size={20} className={styles.statIconOrange} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{userProgress.currentStreak}</span>
              <span className={styles.statLabel}>дней подряд</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Zap size={20} className={styles.statIconYellow} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{xp}</span>
              <span className={styles.statLabel}>всего XP</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Target size={20} className={styles.statIconBlue} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{level}</span>
              <span className={styles.statLabel}>уровень</span>
            </div>
          </div>
        </motion.div>

        {/* Daily progress */}
        <motion.div
          className={styles.dailyCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <BookOpen size={18} />
              <span>Ежедневная цель</span>
            </div>
            <span className={styles.cardCount}>
              {todayProgress.learned} / {todayProgress.goal}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${todayProgress.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
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
          <div className={styles.pathTitle}>
            <span>Путь обучения</span>
            <ChevronRight size={18} />
          </div>
          <LearningPath />
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}

function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '💪';
  if (streak >= 7) return '⭐';
  if (streak >= 3) return '✨';
  return '🌱';
}
