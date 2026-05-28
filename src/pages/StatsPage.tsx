import { motion } from 'framer-motion';
import { Flame, Zap, Target, BookOpen, Award, Clock, ArrowUp, Trophy, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useAppStore } from '../store/useAppStore';
import { words, achievements } from '../data/dictionary';
import { lessonPath } from '../data/lessons';
import styles from './StatsPage.module.css';

export function StatsPage() {
  const { userProgress, xp, level, completedLessons, studySessions, unlockedAchievements, completedGrammar, getTotalWordsLearned } = useAppStore();

  const totalWords = getTotalWordsLearned();
  const totalLessons = lessonPath.length;
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);
  const knownSessions = studySessions.filter(s => s.status === 'known' || s.status === 'reviewing').length;
  const totalAvailable = words.length;
  const vocabPercent = Math.round((knownSessions / totalAvailable) * 100);
  const nextLevelXP = level * 100;
  const currentLevelXP = xp - (level - 1) * 100;

  const statsCards = [
    { icon: BookOpen, label: 'Слов изучено', value: totalWords, total: totalAvailable, color: '#58CC02' },
    { icon: Trophy, label: 'Уроков пройдено', value: completedCount, total: totalLessons, color: '#FFC800' },
    { icon: Award, label: 'Грамматика', value: completedGrammar.length, total: achievements.filter(a => a.type === 'words').length + 10, color: '#CE82FF' },
    { icon: Flame, label: 'Серия дней', value: userProgress.currentStreak, total: userProgress.longestStreak, color: '#FF9600' },
  ];

  const unlockedAchievementsList = achievements.filter(a => unlockedAchievements.includes(a.id));
  const lockedAchievementsList = achievements.filter(a => !unlockedAchievements.includes(a.id));

  return (
    <div className={styles.page}>
      <Header title="Мой прогресс" />

      <main className={styles.main}>
        {/* Level card */}
        <motion.div
          className={styles.levelCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.levelIcon}>
            <Star size={32} />
          </div>
          <div className={styles.levelInfo}>
            <span className={styles.levelLabel}>Уровень {level}</span>
            <span className={styles.levelXP}>{xp} XP всего</span>
          </div>
          <div className={styles.levelProgress}>
            <div className={styles.levelBar}>
              <motion.div
                className={styles.levelFill}
                initial={{ width: 0 }}
                animate={{ width: `${(currentLevelXP / nextLevelXP) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className={styles.levelText}>{currentLevelXP}/{nextLevelXP} XP</span>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          {statsCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
            >
              <Card className={styles.statCard} padding="md">
                <div className={styles.statHeader}>
                  <div className={styles.statIcon} style={{ background: `${stat.color}20`, color: stat.color }}>
                    <stat.icon size={18} />
                  </div>
                </div>
                <div className={styles.statBody}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
                <ProgressBar
                  progress={(stat.value / stat.total) * 100}
                  size="sm"
                  variant="primary"
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <motion.div
          className={styles.achievementsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className={styles.sectionTitle}>Достижения</h3>
          <div className={styles.achievementsGrid}>
            {unlockedAchievementsList.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                className={styles.achievementBadge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
              >
                <div className={styles.achievementIcon}>
                  {achievement.icon}
                </div>
                <span className={styles.achievementTitle}>{achievement.title}</span>
              </motion.div>
            ))}
            {lockedAchievementsList.slice(0, 4).map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                className={`${styles.achievementBadge} ${styles.achievementLocked}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + (unlockedAchievementsList.length + idx) * 0.05 }}
              >
                <div className={styles.achievementIcon}>🔒</div>
                <span className={styles.achievementTitle}>???</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}
