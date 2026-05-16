import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Flame, Target, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { words, categories, dailyQuotes } from '../data/dictionary';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const { userProgress, getTodayProgress } = useAppStore();

  const todayProgress = getTodayProgress();

  const quote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyQuotes[dayOfYear % dailyQuotes.length];
  }, []);

  const handleContinue = () => {
    navigate('/study');
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <motion.div
          className={styles.greeting}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.greetingText}>
            Ассаляму алейкум! 👋
          </h1>
          <p className={styles.subGreeting}>Готов продолжить изучение арабского?</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={styles.progressCard} variant="glass" padding="lg">
            <div className={styles.progressHeader}>
              <div className={styles.streakContainer}>
                <Flame className={styles.flameIcon} size={28} />
                <div className={styles.streakInfo}>
                  <span className={styles.streakCount}>{userProgress.currentStreak}</span>
                  <span className={styles.streakLabel}>дней подряд</span>
                </div>
              </div>
              <div className={styles.goalContainer}>
                <Target className={styles.goalIcon} size={20} />
                <span className={styles.goalText}>Цель на день</span>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Прогресс за сегодня</span>
                <span className={styles.progressCount}>
                  {todayProgress.learned} / {todayProgress.goal} слов
                </span>
              </div>
              <ProgressBar progress={todayProgress.percentage} size="lg" variant="gradient" />
            </div>

            <Button
              fullWidth
              size="lg"
              icon={<Play size={20} />}
              onClick={handleContinue}
              className={styles.continueBtn}
            >
              Продолжить обучение
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={styles.quoteCard} padding="lg">
            <div className={styles.quoteArabic}>{quote.textAr}</div>
            <div className={styles.quoteText}>{quote.text}</div>
            <div className={styles.quoteSource}>— {quote.source}</div>
          </Card>
        </motion.div>

        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BookOpen size={20} />
              Уроки
            </h2>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card
                  className={styles.categoryCard}
                  padding="md"
                  onClick={() => navigate(`/study?category=${category.id}`)}
                >
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>{category.wordCount} слов</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.statsPreview}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className={styles.statItem}>
            <span className={styles.statValue}>{userProgress.totalWordsLearned}</span>
            <span className={styles.statLabel}>Слов изучено</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{words.length}</span>
            <span className={styles.statLabel}>Всего слов</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{categories.length}</span>
            <span className={styles.statLabel}>Уроков</span>
          </div>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}