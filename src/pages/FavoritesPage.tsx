import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Trash2, Volume2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { words } from '../data/dictionary';
import styles from './FavoritesPage.module.css';

export function FavoritesPage() {
  const { favorites, removeFromFavorites } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteWords = words.filter(w => favorites.includes(w.id));
  const filteredWords = favoriteWords.filter(
    w =>
      w.arabic.includes(searchQuery) ||
      w.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playAudio = (arabic: string) => {
    const utterance = new SpeechSynthesisUtterance(arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.page}>
      <Header title="Избранное" />

      <main className={styles.main}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Поиск слов..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {filteredWords.length === 0 ? (
          <Card className={styles.emptyCard} padding="lg">
            <Heart size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Пока нет избранных</h3>
            <p className={styles.emptyText}>
              Начни обучение и нажимай на сердечко у слов, чтобы сохранить их
            </p>
          </Card>
        ) : (
          <div className={styles.wordsList}>
            <AnimatePresence>
              {filteredWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={styles.wordItem} padding="md">
                    <div className={styles.wordContent}>
                      <div className={styles.wordMain}>
                        <span className={styles.arabic}>{word.arabic}</span>
                        <span className={styles.transliteration}>{word.transliteration}</span>
                      </div>
                      <div className={styles.wordTranslation}>{word.translation}</div>
                    </div>

                    <div className={styles.wordActions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => playAudio(word.arabic)}
                      >
                        <Volume2 size={18} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => removeFromFavorites(word.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}