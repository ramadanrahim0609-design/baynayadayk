import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { WordCard } from '../components/WordCard';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { words, categories } from '../data/dictionary';
import styles from './StudyPage.module.css';

export function StudyPage() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');

  const {
    getWordsForReview,
    getWordsByCategory,
    getWordsByLesson,
    markWordKnown,
    markWordUnknown,
    favorites,
    addToFavorites,
    removeFromFavorites,
  } = useAppStore();

  const [studyWords, setStudyWords] = useState<typeof words>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);

  useEffect(() => {
    let wordsToStudy: typeof words = [];

    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        wordsToStudy = getWordsByCategory(category.name);
      }
    } else {
      wordsToStudy = getWordsForReview();
    }

    if (wordsToStudy.length === 0) {
      wordsToStudy = words.slice(0, 10);
    }

    const shuffled = [...wordsToStudy].sort(() => Math.random() - 0.5);
    setStudyWords(shuffled);
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    setIsComplete(false);
  }, [categoryId, getWordsForReview, getWordsByCategory]);

  const currentWord = studyWords[currentIndex];
  const isFavorite = currentWord ? favorites.includes(currentWord.id) : false;

  const handleToggleFavorite = useCallback(() => {
    if (!currentWord) return;
    if (isFavorite) {
      removeFromFavorites(currentWord.id);
    } else {
      addToFavorites(currentWord.id);
    }
  }, [currentWord, isFavorite, addToFavorites, removeFromFavorites]);

  const handleMarkKnown = useCallback(() => {
    if (!currentWord) return;
    markWordKnown(currentWord.id);
    setKnownCount(prev => prev + 1);

    if (currentIndex < studyWords.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setIsComplete(true);
    }
  }, [currentWord, currentIndex, studyWords.length, markWordKnown]);

  const handleMarkUnknown = useCallback(() => {
    if (!currentWord) return;
    markWordUnknown(currentWord.id);
    setUnknownCount(prev => prev + 1);

    if (currentIndex < studyWords.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setIsComplete(true);
    }
  }, [currentWord, currentIndex, studyWords.length, markWordUnknown]);

  const handleRestart = () => {
    const shuffled = [...studyWords].sort(() => Math.random() - 0.5);
    setStudyWords(shuffled);
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    setIsComplete(false);
  };

  if (studyWords.length === 0) {
    return (
      <div className={styles.page}>
        <Header showBack title="Изучение" />
        <main className={styles.main}>
          <Card className={styles.emptyCard} padding="lg">
            <p>Загрузка слов...</p>
          </Card>
        </main>
        <Navigation />
      </div>
    );
  }

  if (isComplete) {
    const total = knownCount + unknownCount;
    const percentage = total > 0 ? (knownCount / total) * 100 : 0;

    return (
      <div className={styles.page}>
        <Header showBack title="Изучение" />
        <main className={styles.main}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={styles.completeCard} padding="lg">
              <div className={styles.completeIcon}>🎉</div>
              <h2 className={styles.completeTitle}>Урок завершён!</h2>
              <p className={styles.completeSubtitle}>Отличная работа на сегодня</p>

              <div className={styles.resultsContainer}>
                <div className={styles.resultItem}>
                  <span className={styles.resultValue}>{knownCount}</span>
                  <span className={styles.resultLabel}>Знаю</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={styles.resultValue}>{unknownCount}</span>
                  <span className={styles.resultLabel}>Повторить</span>
                </div>
              </div>

              <ProgressBar progress={percentage} size="lg" variant="gradient" showLabel label="Результат" />

              <div className={styles.completeActions}>
                <Button onClick={handleRestart} icon={<Shuffle size={20} />}>
                  Повторить
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  На главную
                </Button>
              </div>
            </Card>
          </motion.div>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header showBack title="Изучение" />

      <main className={styles.main}>
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {currentIndex + 1} / {studyWords.length}
            </span>
          </div>
          <ProgressBar
            progress={((currentIndex + 1) / studyWords.length) * 100}
            size="sm"
            variant="gradient"
            animated={false}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord?.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={styles.cardContainer}
          >
            <WordCard
              word={currentWord}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onMarkKnown={handleMarkKnown}
              onMarkUnknown={handleMarkUnknown}
              showActions={true}
            />
          </motion.div>
        </AnimatePresence>

        <div className={styles.keyboardHints}>
          <span className={styles.hint}>← Не знаю</span>
          <span className={styles.hint}>Знаю →</span>
        </div>
      </main>

      <Navigation />
    </div>
  );
}