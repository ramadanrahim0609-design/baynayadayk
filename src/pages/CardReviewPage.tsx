import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { words } from '../data/dictionary';
import { lessonPath } from '../data/lessons';
import styles from './CardReviewPage.module.css';

export function CardReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lesson');
  const { completeLesson, addXP, getWordsByIds, markWordKnown, markWordUnknown } = useAppStore();

  const [reviewWords, setReviewWords] = useState<typeof words>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('Карточки');
  const [showResult, setShowResult] = useState(false);
  const swipeRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  useEffect(() => {
    if (!lessonId) {
      navigate('/');
      return;
    }

    const lesson = lessonPath.find(l => l.id === lessonId);
    if (!lesson || !lesson.wordIds) {
      navigate('/');
      return;
    }

    setLessonTitle(lesson.title);
    const lessonWords = getWordsByIds(lesson.wordIds);
    const shuffled = [...lessonWords].sort(() => Math.random() - 0.5);
    setReviewWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setUnknownCount(0);
    setIsComplete(false);
  }, [lessonId, navigate, getWordsByIds]);

  const currentWord = reviewWords[currentIndex];

  const playAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord?.arabic || '');
    utterance.lang = 'ar-SA';
    utterance.rate = 0.75;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [currentWord]);

  const handleKnown = useCallback(() => {
    if (!currentWord) return;
    markWordKnown(currentWord.id);
    setKnownCount(prev => prev + 1);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setIsFlipped(false);
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, 600);
  }, [currentWord, currentIndex, reviewWords.length, markWordKnown]);

  const handleUnknown = useCallback(() => {
    if (!currentWord) return;
    markWordUnknown(currentWord.id);
    setUnknownCount(prev => prev + 1);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setIsFlipped(false);
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, 600);
  }, [currentWord, currentIndex, reviewWords.length, markWordUnknown]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;

    if (Math.abs(diff) > 60) {
      if (!isFlipped) {
        setIsFlipped(true);
      } else if (diff > 0) {
        handleKnown();
      } else {
        handleUnknown();
      }
    }
  }, [isFlipped, handleKnown, handleUnknown]);

  if (reviewWords.length === 0) {
    return (
      <div className={styles.page}>
        <Header showBack title="Карточки" />
        <main className={styles.main}>
          <Card className={styles.loadingCard} padding="lg">
            <p>Загрузка...</p>
          </Card>
        </main>
        <Navigation />
      </div>
    );
  }

  if (isComplete) {
    const total = knownCount + unknownCount;
    const percentage = total > 0 ? Math.round((knownCount / total) * 100) : 0;
    const xpEarned = knownCount * 15;

    return (
      <div className={styles.page}>
        <Header showBack title={lessonTitle} />
        <main className={styles.main}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={styles.completeCard} padding="lg">
              <div className={styles.completeIcon}>
                {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
              </div>
              <h2 className={styles.completeTitle}>
                {percentage >= 80 ? 'Отлично!' : percentage >= 50 ? 'Хорошо!' : 'Продолжай!'}
              </h2>
              <p className={styles.completeSubtitle}>
                {reviewWords.length} слов пройдено
              </p>

              <div className={styles.resultsContainer}>
                <div className={styles.resultItem}>
                  <span className={`${styles.resultValue} ${styles.knownValue}`}>{knownCount}</span>
                  <span className={styles.resultLabel}>Знаю</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={`${styles.resultValue} ${styles.unknownValue}`}>{unknownCount}</span>
                  <span className={styles.resultLabel}>Повторить</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={`${styles.resultValue} ${styles.xpValue}`}>+{xpEarned}</span>
                  <span className={styles.resultLabel}>XP</span>
                </div>
              </div>

              <div className={styles.completeActions}>
                <Button onClick={() => navigate('/')} fullWidth size="lg">
                  Продолжить
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<RotateCcw size={18} />}
                  onClick={() => window.location.reload()}
                >
                  Повторить
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
      <Header showBack title={lessonTitle} />

      <main className={styles.main}>
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {currentIndex + 1} / {reviewWords.length}
            </span>
            <div className={styles.counters}>
              <span className={styles.knownCounter}>✓ {knownCount}</span>
              <span className={styles.unknownCounter}>✗ {unknownCount}</span>
            </div>
          </div>
          <ProgressBar
            progress={((currentIndex + 1) / reviewWords.length) * 100}
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
            transition={{ duration: 0.25 }}
            className={styles.cardContainer}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={styles.cardWrapper}
              onClick={() => !isFlipped && setIsFlipped(true)}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    className={`${styles.card} ${styles.front}`}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.arabicText}>{currentWord?.arabic}</div>

                    <motion.button
                      className={`${styles.audioButton} ${isPlaying ? styles.playing : ''}`}
                      onClick={playAudio}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Volume2 size={24} />
                    </motion.button>

                    <div className={styles.flipHint}>
                      <span>Нажми, чтобы увидеть перевод</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    className={`${styles.card} ${styles.back}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.translation}>{currentWord?.translation}</div>
                    <div className={styles.transliteration}>{currentWord?.transliteration}</div>
                    <div className={styles.category}>{currentWord?.category}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isFlipped && !showResult && (
              <motion.div
                className={styles.responseButtons}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  className={`${styles.responseBtn} ${styles.unknownBtn}`}
                  onClick={handleUnknown}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} />
                  <span>Не знаю</span>
                </motion.button>
                <motion.button
                  className={`${styles.responseBtn} ${styles.knownBtn}`}
                  onClick={handleKnown}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check size={20} />
                  <span>Знаю</span>
                </motion.button>
              </motion.div>
            )}

            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.resultOverlay}
              >
                <div className={`${styles.resultBadge} ${unknownCount > knownCount ? styles.badgeWrong : styles.badgeCorrect}`}>
                  {unknownCount > knownCount ? <X size={24} /> : <Check size={24} />}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className={styles.swipeHint}>
          <span>← Свайп влево: Не знаю</span>
          <span>Свайп вправо: Знаю →</span>
        </div>
      </main>

      <Navigation />
    </div>
  );
}