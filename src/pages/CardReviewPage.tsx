import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, ArrowRight, RotateCcw, Sparkles, ThumbsUp } from 'lucide-react';
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
  const { completeLesson, addXP, getWordsByIds, markWordKnown, markWordUnknown, markWordReviewedInCards } = useAppStore();

  const [reviewWords, setReviewWords] = useState<typeof words>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('Карточки');
  const [showResult, setShowResult] = useState<'known' | 'unknown' | null>(null);
  const swipeRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  useEffect(() => {
    if (!lessonId) { navigate('/'); return; }
    const lesson = lessonPath.find(l => l.id === lessonId);
    if (!lesson || !lesson.wordIds) { navigate('/'); return; }
    setLessonTitle(lesson.title);
    const lessonWords = getWordsByIds(lesson.wordIds).sort((a, b) => parseInt(a.id) - parseInt(b.id));
    setReviewWords(lessonWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setUnknownCount(0);
    setIsComplete(false);
  }, [lessonId, navigate, getWordsByIds]);

  const currentWord = reviewWords[currentIndex];

  const playAudio = useCallback((e: React.MouseEvent, slow: boolean = false) => {
    e.stopPropagation();
    if (!currentWord) return;
    const prop = slow ? 'setIsSlowPlaying' : 'setIsPlaying';
    const playing = slow ? isSlowPlaying : isPlaying;
    if (playing) return;
    if (slow) setIsSlowPlaying(true); else setIsPlaying(true);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = slow ? 0.35 : 0.8;
    utterance.onend = () => { if (slow) setIsSlowPlaying(false); else setIsPlaying(false); };
    utterance.onerror = () => { if (slow) setIsSlowPlaying(false); else setIsPlaying(false); };
    window.speechSynthesis.speak(utterance);
  }, [currentWord, isPlaying, isSlowPlaying]);

  const handleKnown = useCallback(() => {
    if (!currentWord) return;
    markWordKnown(currentWord.id);
    markWordReviewedInCards(currentWord.id);
    setKnownCount(prev => prev + 1);
    setShowResult('known');
    setTimeout(() => {
      setShowResult(null);
      setIsFlipped(false);
      if (currentIndex < reviewWords.length - 1) setCurrentIndex(prev => prev + 1);
      else setIsComplete(true);
    }, 500);
  }, [currentWord, currentIndex, reviewWords.length, markWordKnown, markWordReviewedInCards]);

  const handleUnknown = useCallback(() => {
    if (!currentWord) return;
    markWordUnknown(currentWord.id);
    setUnknownCount(prev => prev + 1);
    setShowResult('unknown');
    setTimeout(() => {
      setShowResult(null);
      setIsFlipped(false);
      if (currentIndex < reviewWords.length - 1) setCurrentIndex(prev => prev + 1);
      else setIsComplete(true);
    }, 500);
  }, [currentWord, currentIndex, reviewWords.length, markWordUnknown]);

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;
    if (Math.abs(diff) > 60) {
      if (!isFlipped) setIsFlipped(true);
      else if (diff > 0) handleKnown();
      else handleUnknown();
    }
  };

  if (reviewWords.length === 0) {
    return (
      <div className={styles.page}>
        <Header showBack title="Карточки" />
        <main className={styles.main}>
          <Card padding="lg"><p>Загрузка...</p></Card>
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
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            className={styles.completeContainer}
          >
            <Card className={styles.completeCard} padding="lg">
              <motion.div
                className={styles.completeIcon}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
              </motion.div>
              <h2 className={styles.completeTitle}>
                {percentage >= 80 ? 'Отлично!' : percentage >= 50 ? 'Хорошо!' : 'Продолжай!'}
              </h2>
              <p className={styles.completeSubtitle}>
                {reviewWords.length} слов пройдено
              </p>
              <div className={styles.resultsContainer}>
                <div className={styles.resultItem}>
                  <span className={styles.knownValue}>{knownCount}</span>
                  <span className={styles.resultLabel}>Знаю</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={styles.unknownValue}>{unknownCount}</span>
                  <span className={styles.resultLabel}>Повторить</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={styles.xpValue}>+{xpEarned}</span>
                  <span className={styles.resultLabel}>XP</span>
                </div>
              </div>
              <ProgressBar
                progress={percentage}
                variant={percentage >= 80 ? 'gradient' : 'primary'}
                size="md"
              />
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
            <div className={styles.cardWrapper}>
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    className={`${styles.card} ${styles.front}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsFlipped(true)}
                  >
                    <div className={styles.arabicText}>{currentWord?.arabic}</div>
                    <div className={styles.audioRow}>
                      <motion.button
                        className={`${styles.audioBtn} ${isPlaying ? styles.audioActive : ''}`}
                        onClick={(e) => playAudio(e, false)}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Volume2 size={22} />
                        <span>Обычно</span>
                      </motion.button>
                      <motion.button
                        className={`${styles.audioBtn} ${styles.slowBtn} ${isSlowPlaying ? styles.audioActive : ''}`}
                        onClick={(e) => playAudio(e, true)}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Volume2 size={18} />
                        <span>Медленно</span>
                      </motion.button>
                    </div>
                    <div className={styles.flipHint}>
                      <span>Нажми, чтобы перевернуть</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    className={`${styles.card} ${styles.back}`}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentWord?.emoji && (
                      <div className={styles.cardEmoji}>{currentWord.emoji}</div>
                    )}
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
                  whileTap={{ scale: 0.93 }}
                >
                  <X size={20} />
                  <span>Не знаю</span>
                </motion.button>
                <motion.button
                  className={`${styles.responseBtn} ${styles.knownBtn}`}
                  onClick={handleKnown}
                  whileTap={{ scale: 0.93 }}
                >
                  <Check size={20} />
                  <span>Знаю</span>
                </motion.button>
              </motion.div>
            )}

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={`${styles.resultOverlay} ${showResult === 'known' ? styles.resultCorrect : styles.resultWrong}`}
                >
                  {showResult === 'known' ? <ThumbsUp size={32} /> : <X size={32} />}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className={styles.swipeHint}>
          <span>← Свайп: Не знаю</span>
          <span>Свайп: Знаю →</span>
        </div>
      </main>
    </div>
  );
}
