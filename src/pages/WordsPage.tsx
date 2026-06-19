import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookMarked, CheckCircle2, Volume2, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import styles from './WordsPage.module.css';

type TabType = 'learning' | 'learned';

export function WordsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('learning');
  const [searchQuery, setSearchQuery] = useState('');
  const { getLearningWords, getLearnedWords } = useAppStore();
  const navigate = useNavigate();

  const learningWords = getLearningWords();
  const learnedWords = getLearnedWords();

  const displayWords = activeTab === 'learning' ? learningWords : learnedWords;

  const filteredWords = displayWords.filter(word =>
    word.arabic.includes(searchQuery) ||
    word.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.transliteration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speakWord = (arabicText: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(arabicText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={styles.page}>
      <div className="app-background">
        <div className="light-spot-1" />
        <div className="light-spot-2" />
      </div>

      <Header title="Слова" showStats />

      <main className={styles.main}>
        <motion.div
          className={styles.searchContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск слов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </motion.div>

        <motion.div
          className={styles.tabs}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <button
            className={`${styles.tab} ${activeTab === 'learning' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            <BookMarked size={18} />
            <span>Еще изучаю</span>
            {learningWords.length > 0 && (
              <span className={styles.tabBadge}>{learningWords.length}</span>
            )}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'learned' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('learned')}
          >
            <CheckCircle2 size={18} />
            <span>Изучил</span>
            {learnedWords.length > 0 && (
              <span className={styles.tabBadge}>{learnedWords.length}</span>
            )}
          </button>
        </motion.div>

        <div className={styles.wordList}>
          <AnimatePresence mode="wait">
            {filteredWords.length === 0 ? (
              <motion.div
                key="empty"
                className={styles.emptyState}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className={styles.emptyIcon}>
                  {activeTab === 'learning' ? <BookMarked size={48} /> : <CheckCircle2 size={48} />}
                </div>
                <h3 className={styles.emptyTitle}>
                  {activeTab === 'learning' ? 'Нет слов на изучении' : 'Нет изученных слов'}
                </h3>
                <p className={styles.emptyText}>
                  {activeTab === 'learning'
                    ? 'Пройди карточки, чтобы слова появились здесь!'
                    : 'Пройди упражнения, чтобы слова добавились сюда'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'learning' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'learning' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className={styles.wordGrid}
              >
                {filteredWords.map((word, index) => (
                  <motion.div
                    key={word.id}
                    className={styles.wordCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={styles.wordHeader}>
                      <span className={styles.wordArabic} dir="rtl">{word.arabic}</span>
                      <button
                        className={styles.speakButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(word.arabic);
                        }}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    
                    <div className={styles.wordBody}>
                      <span className={styles.wordTranslation}>{word.translation}</span>
                      <span className={styles.wordTransliteration}>{word.transliteration}</span>
                    </div>

                    <div className={styles.wordFooter}>
                      {activeTab === 'learning' && (
                        <span className={styles.learningBadge}>📖 На изучении</span>
                      )}
                      {activeTab === 'learned' && (
                        <span className={styles.learnedBadge}>✓ Изучено</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
