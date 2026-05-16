import { motion } from 'framer-motion';
import { Trophy, Flame, Target, BookOpen, Star, Award } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useAppStore } from '../store/useAppStore';
import { achievements } from '../data/dictionary';
import { words } from '../data/dictionary';
import styles from './StatsPage.module.css';

export function StatsPage() {
  const { userProgress, unlockedAchievements, studySessions } = useAppStore();

  const learnedWordIds = studySessions.filter(s => s.status === 'known' || s.status === 'reviewing').map(s => s.wordId);
  const uniqueLearnedWords = new Set(learnedWordIds).size;
  const totalWords = words.length;
  const learnedPercentage = (uniqueLearnedWords / totalWords) * 100;

  const masteredWords = studySessions.filter(s => s.repetitions >= 3).length;

  const stats = [
    {
      icon: BookOpen,
      value: uniqueLearnedWords,
      label: 'Слов изучено',
      color: '#2D5BFF',
    },
    {
      icon: Flame,
      value: userProgress.currentStreak,
      label: 'Текущая серия',
      color: '#FF6B35',
    },
    {
      icon: Trophy,
      value: userProgress.longestStreak,
      label: 'Лучшая серия',
      color: '#FFD700',
    },
    {
      icon: Award,
      value: unlockedAchievements.length,
      label: 'Достижения',
      color: '#10B981',
    },
  ];

  const reviewingCount = studySessions.filter(s => s.status === 'reviewing').length;
  const unknownCount = studySessions.filter(s => s.status === 'unknown').length;

  return (
    <div className={styles.page}>
      <Header title="Статистика" />

      <main className={styles.main}>
        <motion.div
          className={styles.overviewCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.overviewHeader}>
            <h2 className={styles.overviewTitle}>Твой прогресс</h2>
            <p className={styles.overviewSubtitle}>
              {uniqueLearnedWords} из {totalWords} слов изучено
            </p>
          </div>

          <ProgressBar
            progress={learnedPercentage}
            size="lg"
            variant="gradient"
            showLabel
            label="Общий прогресс"
          />
        </motion.div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className={styles.statCard} padding="md">
                <div
                  className={styles.statIcon}
                  style={{ background: `${stat.color}20`, color: stat.color }}
                >
                  <stat.icon size={24} />
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className={styles.sectionTitle}>
            <Trophy size={20} />
            Достижения
          </h3>

          <div className={styles.achievementsList}>
            {achievements.map((achievement, index) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Card
                    className={`${styles.achievementCard} ${isUnlocked ? styles.unlocked : ''}`}
                    padding="md"
                  >
                    <div className={`${styles.achievementIcon} ${isUnlocked ? styles.active : ''}`}>
                      {achievement.icon}
                    </div>
                    <div className={styles.achievementContent}>
                      <span className={styles.achievementTitle}>{achievement.title}</span>
                      <span className={styles.achievementDesc}>{achievement.description}</span>
                    </div>
                    {isUnlocked && (
                      <div className={styles.achievementBadge}>
                        <Star size={16} fill="currentColor" />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className={styles.sectionTitle}>
            <Target size={20} />
            Результаты обучения
          </h3>

          <Card className={styles.insightCard} padding="lg">
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Выучено</span>
              <span className={styles.insightValue}>{masteredWords}</span>
            </div>
            <div className={styles.insightDivider} />
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>На повторении</span>
              <span className={styles.insightValue}>{reviewingCount}</span>
            </div>
            <div className={styles.insightDivider} />
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Нужно повторить</span>
              <span className={styles.insightValue}>{unknownCount}</span>
            </div>
          </Card>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}