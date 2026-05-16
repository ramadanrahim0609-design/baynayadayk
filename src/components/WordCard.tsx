import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Heart, FlipHorizontal } from 'lucide-react';
import { Word } from '../types';
import styles from './WordCard.module.css';

interface WordCardProps {
  word: Word;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onMarkKnown?: () => void;
  onMarkUnknown?: () => void;
  showActions?: boolean;
}

export function WordCard({
  word,
  isFavorite,
  onToggleFavorite,
  onMarkKnown,
  onMarkUnknown,
  showActions = true,
}: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(word.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper} onClick={() => setIsFlipped(!isFlipped)}>
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              className={`${styles.card} ${styles.front}`}
              initial={{ rotateY: 0 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.arabicText}>{word.arabic}</div>
              <div className={styles.transliteration}>{word.transliteration}</div>

              <div className={styles.actions}>
                <motion.button
                  className={`${styles.iconButton} ${isPlaying ? styles.playing : ''}`}
                  onClick={playAudio}
                  whileTap={{ scale: 0.9 }}
                >
                  <Volume2 size={24} />
                </motion.button>
              </div>

              <div className={styles.flipHint}>
                <FlipHorizontal size={16} />
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
              <div className={styles.translation}>{word.translation}</div>
              <div className={styles.category}>{word.category}</div>

              <motion.button
                className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showActions && onMarkKnown && onMarkUnknown && (
        <div className={styles.responseButtons}>
          <motion.button
            className={`${styles.responseBtn} ${styles.unknownBtn}`}
            onClick={onMarkUnknown}
            whileTap={{ scale: 0.95 }}
          >
            Не знаю
          </motion.button>
          <motion.button
            className={`${styles.responseBtn} ${styles.knownBtn}`}
            onClick={onMarkKnown}
            whileTap={{ scale: 0.95 }}
          >
            Знаю
          </motion.button>
        </div>
      )}
    </div>
  );
}