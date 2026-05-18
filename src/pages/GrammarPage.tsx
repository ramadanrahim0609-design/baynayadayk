import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, Check, Volume2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { grammarRules, GrammarRule } from '../data/grammar';
import styles from './GrammarPage.module.css';

export function GrammarPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonParam = searchParams.get('lesson');
  const { completeGrammar, completedGrammar } = useAppStore();

  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [expandedTips, setExpandedTips] = useState(false);

  const filteredRules = lessonParam
    ? grammarRules.filter(r => r.lesson === parseInt(lessonParam))
    : grammarRules;

  const groupedRules = filteredRules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, GrammarRule[]>);

  const handleRuleClick = (rule: GrammarRule) => {
    setSelectedRule(rule);
    setExpandedTips(false);
  };

  const handleComplete = () => {
    if (selectedRule) {
      completeGrammar(selectedRule.id);
      setSelectedRule(null);
    }
  };

  const playAudio = (arabic: string) => {
    const utterance = new SpeechSynthesisUtterance(arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  if (selectedRule) {
    const isCompleted = completedGrammar.includes(selectedRule.id);

    return (
      <div className={styles.page}>
        <Header showBack title={selectedRule.title} />

        <main className={styles.main}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className={styles.ruleHeader} padding="lg">
              <h2 className={styles.ruleTitle}>{selectedRule.title}</h2>
              <p className={styles.ruleTitleAr}>{selectedRule.titleAr}</p>
              <span className={styles.ruleCategory}>{selectedRule.category}</span>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className={styles.explanationCard} padding="lg">
              <h3 className={styles.sectionTitle}>Объяснение</h3>
              <p className={styles.explanationText}>{selectedRule.explanation}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className={styles.examplesCard} padding="lg">
              <h3 className={styles.sectionTitle}>Примеры</h3>
              <div className={styles.examplesList}>
                {selectedRule.examples.map((example, idx) => (
                  <div key={idx} className={styles.exampleItem}>
                    <div className={styles.exampleArabic}>
                      <span className={styles.arabicText}>{example.arabic}</span>
                      <button
                        className={styles.audioButton}
                        onClick={() => playAudio(example.arabic)}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <span className={styles.exampleTranslit}>{example.transliteration}</span>
                    <span className={styles.exampleTranslation}>{example.translation}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {selectedRule.tips && selectedRule.tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card
                className={styles.tipsCard}
                padding="lg"
                onClick={() => setExpandedTips(!expandedTips)}
              >
                <div className={styles.tipsHeader}>
                  <h3 className={styles.sectionTitle}>Советы</h3>
                  <ChevronRight
                    size={20}
                    className={`${styles.chevron} ${expandedTips ? styles.chevronOpen : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {expandedTips && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.tipsList}
                    >
                      {selectedRule.tips.map((tip, idx) => (
                        <li key={idx} className={styles.tipItem}>
                          <span className={styles.tipBullet}>•</span>
                          {tip}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button
              fullWidth
              size="lg"
              onClick={handleComplete}
              icon={isCompleted ? <Check size={20} /> : <BookOpen size={20} />}
              variant={isCompleted ? 'success' : 'primary'}
            >
              {isCompleted ? 'Изучено ✓' : 'Отметить как изученное'}
            </Button>
          </motion.div>
        </main>

        <Navigation />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header showBack title="Грамматика" />

      <main className={styles.main}>
        {Object.entries(groupedRules).map(([category, rules], catIdx) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: catIdx * 0.1 }}
            className={styles.categorySection}
          >
            <h3 className={styles.categoryTitle}>{category}</h3>
            <div className={styles.rulesList}>
              {rules.map((rule, idx) => {
                const isCompleted = completedGrammar.includes(rule.id);
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Card
                      className={`${styles.ruleCard} ${isCompleted ? styles.completed : ''}`}
                      padding="md"
                      onClick={() => handleRuleClick(rule)}
                    >
                      <div className={styles.ruleInfo}>
                        <span className={styles.ruleIcon}>
                          {isCompleted ? '✓' : '📖'}
                        </span>
                        <div className={styles.ruleDetails}>
                          <span className={styles.ruleName}>{rule.title}</span>
                          <span className={styles.ruleNameAr}>{rule.titleAr}</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className={styles.arrow} />
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </main>

      <Navigation />
    </div>
  );
}