import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Heart, Check, X } from 'lucide-react';
import { Word } from '../types';
import styles from './WordCard.module.css';

interface WordCardProps {
  word: Word;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onMarkKnown?: () => void;
  onMarkUnknown?: () => void;
  showActions?: boolean;
}

export function WordCard({
  word,
  isFavorite = false,
  onToggleFavorite,
  onMarkKnown,
  onMarkUnknown,
  showActions = true,
}: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const startX = useRef(0);

  const playAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [word.arabic, isPlaying]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;
    if (Math.abs(diff) > 50 && !isFlipped) {
      setIsFlipped(true);
    }
  };

  return (
    <div
      className={styles.wrapper}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className={styles.card}
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              className={styles.face}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-elevated) 100%)' }}
            >
              <div className={styles.arabicText}>{word.arabic}</div>
              <motion.button
                className={`${styles.audioButton} ${isPlaying ? styles.playing : ''}`}
                onClick={playAudio}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 size={22} />
                <span className={styles.audioLabel}>{isPlaying ? '...' : 'Слушать'}</span>
              </motion.button>
              <div className={styles.flipHint}>
                <span>Нажми, чтобы увидеть перевод</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className={`${styles.face} ${styles.backFace}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.emojiWrapper}>
                <span className={styles.emoji}>{word.emoji || '📖'}</span>
              </div>
              <div className={styles.translation}>{word.translation}</div>
              <div className={styles.transliteration}>{word.transliteration}</div>
              <div className={styles.category}>{word.category}</div>

              {showActions && (
                <div className={styles.actions}>
                  {onToggleFavorite && (
                    <motion.button
                      className={`${styles.actionBtn} ${isFavorite ? styles.favoriteActive : ''}`}
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                    </motion.button>
                  )}
                  {onMarkUnknown && (
                    <motion.button
                      className={`${styles.actionBtn} ${styles.unknownBtn}`}
                      onClick={(e) => { e.stopPropagation(); onMarkUnknown(); }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={18} />
                    </motion.button>
                  )}
                  {onMarkKnown && (
                    <motion.button
                      className={`${styles.actionBtn} ${styles.knownBtn}`}
                      onClick={(e) => { e.stopPropagation(); onMarkKnown(); }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Check size={18} />
                    </motion.button>
                  )}
                </div>
              )}
              <div className={styles.flipHint}>
                <span>Нажми, чтобы вернуться</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
