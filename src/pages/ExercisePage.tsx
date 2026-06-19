import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Volume2, ArrowRight, RotateCcw, Shuffle, Type, ListMusic, Layers, Sparkles } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Confetti } from '../components/Confetti';
import { useAppStore } from '../store/useAppStore';
import { words } from '../data/dictionary';
import { lessonPath } from '../data/lessons';
import styles from './ExercisePage.module.css';

type ExerciseType = 'choose' | 'listen' | 'build' | 'match';

interface MatchPair {
  arabic: string;
  translation: string;
  wordId: string;
}

interface Question {
  type: ExerciseType;
  word: typeof words[0];
  options?: typeof words;
  correctAnswer: string;
  prompt: string;
  promptAr?: string;
  scrambledLetters?: string[];
  matchPairs?: MatchPair[];
}

function scrambleWord(arabic: string): string[] {
  const letters = arabic.replace(/\s/g, '').split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
}

function playArabic(text: string) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.7;
  window.speechSynthesis.speak(utterance);
}

export function ExercisePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lesson');
  const { completeLesson, getWordsByIds, markWordKnown, markWordUnknown, addXP, markWordCompletedInExercise } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('Упражнения');
  const [buildLetters, setBuildLetters] = useState<{ letter: string; id: number }[]>([]);
  const [builtWord, setBuiltWord] = useState<{ letter: string; id: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);

  // Match game state
  const [matchWords, setMatchWords] = useState<MatchPair[]>([]);
  const [matchSelected, setMatchSelected] = useState<{ side: 'arabic' | 'translation'; index: number } | null>(null);
  const [matchedIndices, setMatchedIndices] = useState<{ arabic: number; translation: number }[]>([]);
  const [matchShake, setMatchShake] = useState<'arabic' | 'translation' | null>(null);
  const [matchStartTime, setMatchStartTime] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [matchMistakes, setMatchMistakes] = useState(0);

  useEffect(() => {
    if (!lessonId) { navigate('/'); return; }
    const lesson = lessonPath.find(l => l.id === lessonId);
    if (!lesson || !lesson.wordIds) { navigate('/'); return; }
    setLessonTitle(lesson.title);

    const lessonWords = getWordsByIds(lesson.wordIds).sort((a, b) => parseInt(a.id) - parseInt(b.id));

    const generated: Question[] = [];

    const types: ExerciseType[] = ['choose', 'listen', 'build', 'choose', 'build', 'listen', 'choose', 'build', 'listen', 'choose'];
    let wordIdx = 0;

    const matchChunkSize = 4;
    const matchIndices: number[] = [];
    const nonMatchWords: typeof lessonWords = [];

    for (let i = 0; i < lessonWords.length; i++) {
      if (i % matchChunkSize === 2 && i + matchChunkSize <= lessonWords.length) {
        matchIndices.push(i);
      } else {
        nonMatchWords.push(lessonWords[i]);
      }
    }

    for (const startIdx of matchIndices) {
      const matchGroup = lessonWords.slice(startIdx, startIdx + matchChunkSize);
      if (matchGroup.length >= 3) {
        const pairs: MatchPair[] = matchGroup.map(w => ({
          arabic: w.arabic,
          translation: w.translation,
          wordId: w.id,
        }));
        generated.push({
          type: 'match',
          word: matchGroup[0],
          options: [],
          correctAnswer: '',
          prompt: 'Сопоставь слово с переводом',
          matchPairs: pairs,
        });
      }
    }

    for (let i = 0; i < nonMatchWords.length; i++) {
      const word = nonMatchWords[i];
      const otherWords = words.filter(w => w.id !== word.id && w.category === word.category).sort(() => Math.random() - 0.5).slice(0, 3);
      if (otherWords.length < 3) {
        const fallback = words.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3 - otherWords.length);
        otherWords.push(...fallback);
      }
      const options = [...otherWords, word].sort(() => Math.random() - 0.5);

      const type = types[wordIdx % types.length];
      wordIdx++;

      if (type === 'listen') {
        generated.push({
          type: 'listen',
          word,
          options,
          correctAnswer: word.translation,
          prompt: 'Что означает это слово?',
          promptAr: word.arabic,
        });
      } else if (type === 'build') {
        generated.push({
          type: 'build',
          word,
          options: [],
          correctAnswer: word.arabic,
          prompt: `Собери слово: "${word.translation}"`,
          promptAr: word.translation,
          scrambledLetters: scrambleWord(word.arabic),
        });
      } else {
        generated.push({
          type: 'choose',
          word,
          options,
          correctAnswer: word.translation,
          prompt: 'Выбери правильный перевод:',
          promptAr: word.arabic,
        });
      }
    }

    for (let i = generated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generated[i], generated[j]] = [generated[j], generated[i]];
    }

    setQuestions(generated);
  }, [lessonId, navigate, getWordsByIds]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((answer: string) => {
    if (showResult || !currentQuestion) return;
    const correct = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const newStreak = streak + 1;
      setScore(prev => prev + 1);
      setStreak(newStreak);
      if (newStreak >= 3) setShowConfetti(true);
      if (currentQuestion.word) {
        markWordKnown(currentQuestion.word.id);
        markWordCompletedInExercise(currentQuestion.word.id);
      }
    } else {
      setStreak(0);
      setHearts(prev => prev - 1);
      if (currentQuestion.word) markWordUnknown(currentQuestion.word.id);
    }
  }, [showResult, currentQuestion, markWordKnown, markWordUnknown, streak, markWordCompletedInExercise]);

  const handleBuildLetter = useCallback((letter: string, id: number) => {
    if (showResult || !currentQuestion) return;
    setBuiltWord(prev => [...prev, { letter, id }]);
    setBuildLetters(prev => prev.filter(l => l.id !== id));
  }, [showResult, currentQuestion]);

  const handleUndoLetter = useCallback(() => {
    if (showResult || builtWord.length === 0) return;
    const last = builtWord[builtWord.length - 1];
    setBuiltWord(prev => prev.slice(0, -1));
    setBuildLetters(prev => [...prev, last].sort(() => Math.random() - 0.5));
  }, [showResult, builtWord]);

  const handleSubmitBuild = useCallback(() => {
    if (!currentQuestion || showResult) return;
    const answer = builtWord.map(l => l.letter).join('');
    const correct = answer === currentQuestion.correctAnswer.replace(/\s/g, '');
    setIsCorrect(correct);
    setShowResult(true);
    setSelectedAnswer(answer);
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      if (currentQuestion.word) {
        markWordKnown(currentQuestion.word.id);
        markWordCompletedInExercise(currentQuestion.word.id);
      }
    } else {
      setStreak(0);
      setHearts(prev => prev - 1);
      if (currentQuestion.word) markWordUnknown(currentQuestion.word.id);
    }
  }, [currentQuestion, showResult, builtWord, markWordKnown, markWordUnknown, markWordCompletedInExercise]);

  const handleNext = useCallback(() => {
    const finalCorrect = isCorrect ? 1 : 0;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      setBuiltWord([]);
      setBuildLetters([]);
    } else {
      completeLesson(lessonId || '', score + finalCorrect, questions.length);
      setIsComplete(true);
    }
  }, [currentIndex, questions.length, score, isCorrect, lessonId, completeLesson]);

  const handleMatchClick = useCallback((side: 'arabic' | 'translation', index: number) => {
    if (!matchWords[index]) return;
    const alreadyMatched = matchedIndices.some(m => m[side] === index);
    if (alreadyMatched) return;

    if (!matchSelected) {
      setMatchSelected({ side, index });
      return;
    }

    if (matchSelected.side === side) {
      setMatchSelected({ side, index });
      return;
    }

    const leftIdx = side === 'arabic' ? index : matchSelected.index;
    const rightIdx = side === 'translation' ? index : matchSelected.index;

    const leftWord = matchWords[leftIdx];
    const rightWord = matchWords[rightIdx];

    if (leftWord.wordId === rightWord.wordId) {
      setMatchedIndices(prev => [...prev, { arabic: leftIdx, translation: rightIdx }]);
      setMatchSelected(null);
      setMatchScore(prev => prev + 1);
      markWordKnown(leftWord.wordId);
      markWordCompletedInExercise(leftWord.wordId);

      if (matchedIndices.length + 1 >= matchWords.length) {
        const timeBonus = Math.max(0, 30 - Math.floor((Date.now() - matchStartTime) / 1000));
        const totalCorrect = matchScore + 1;
        const xpGain = totalCorrect * 2 + timeBonus;
        setScore(prev => prev + totalCorrect);
        addXP(xpGain);
        setStreak(prev => prev + 1);
        setTimeout(() => handleNext(), 800);
      }
    } else {
      setMatchShake(side);
      setMatchMistakes(prev => prev + 1);
      setStreak(0);
      setTimeout(() => {
        setMatchShake(null);
        setMatchSelected(null);
      }, 600);
    }
  }, [matchWords, matchedIndices, matchSelected, matchStartTime, matchScore, handleNext, markWordKnown, addXP, markWordCompletedInExercise]);

  useEffect(() => {
    if (hearts <= 0) {
      setIsComplete(true);
    }
  }, [hearts]);

  useEffect(() => {
    if (currentQuestion?.type === 'build' && currentQuestion?.scrambledLetters) {
      setBuildLetters(currentQuestion.scrambledLetters.map((l, i) => ({ letter: l, id: i })));
      setBuiltWord([]);
    }
    if (currentQuestion?.type === 'match' && currentQuestion?.matchPairs) {
      setMatchWords(currentQuestion.matchPairs.sort(() => Math.random() - 0.5));
      setMatchedIndices([]);
      setMatchSelected(null);
      setMatchShake(null);
      setMatchScore(0);
      setMatchMistakes(0);
      setMatchStartTime(Date.now());
    }
  }, [currentQuestion, currentIndex, lessonId, getWordsByIds]);

  if (questions.length === 0) {
    return (
      <div className={styles.page}>
        <Header showBack title={lessonTitle} />
        <main className={styles.main}>
          <Card padding="lg"><p>Загрузка...</p></Card>
        </main>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const xpEarned = score * 10;
    const showBigConfetti = percentage >= 80;

    return (
      <div className={styles.page}>
        <Confetti active={showBigConfetti} count={30} />
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
                {score} из {questions.length} правильно
              </p>
              <div className={styles.resultsContainer}>
                <div className={styles.resultItem}>
                  <span className={styles.resultValue}>{percentage}%</span>
                  <span className={styles.resultLabel}>Точность</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={styles.resultValue}>+{xpEarned}</span>
                  <span className={styles.resultLabel}>XP</span>
                </div>
                <div className={styles.resultDivider} />
                <div className={styles.resultItem}>
                  <span className={styles.resultValue}>{streak > 0 ? `🔥${streak}` : '—'}</span>
                  <span className={styles.resultLabel}>Серия</span>
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
      <Confetti active={showConfetti} count={15} />
      <Header showBack title={lessonTitle} />

      <main className={styles.main}>
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {currentIndex + 1} / {questions.length}
            </span>
            <div className={styles.topRight}>
              <span className={styles.streakBadge}>
                🔥 {streak}
              </span>
              <span className={styles.scoreText}>
                ✓ {score}
              </span>
            </div>
          </div>
          <ProgressBar
            progress={((currentIndex + 1) / questions.length) * 100}
            size="sm"
            variant="gradient"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={styles.questionContainer}
          >
            {/* Exercise type indicator */}
            <div className={styles.typeBadge}>
              {currentQuestion?.type === 'listen' && <><ListMusic size={14} /> На слух</>}
              {currentQuestion?.type === 'build' && <><Type size={14} /> Собери слово</>}
              {currentQuestion?.type === 'choose' && <><Shuffle size={14} /> Выбор ответа</>}
              {currentQuestion?.type === 'match' && <><Layers size={14} /> Сопоставь</>}
            </div>

            <Card className={styles.questionCard} padding="lg">
              {currentQuestion?.type === 'listen' && (
                <div className={styles.listenSection}>
                  <motion.button
                    className={styles.listenButton}
                    onClick={() => currentQuestion?.word && playArabic(currentQuestion.word.arabic)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume2 size={40} />
                  </motion.button>
                  <p className={styles.listenHint}>Нажми, чтобы прослушать</p>
                </div>
              )}

              <p className={styles.prompt}>{currentQuestion?.prompt}</p>

              {currentQuestion?.type !== 'listen' && currentQuestion?.promptAr && (
                <p className={styles.arabicPrompt}>{currentQuestion.promptAr}</p>
              )}

              {/* Choose / Listen type */}
              {(currentQuestion?.type === 'choose' || currentQuestion?.type === 'listen') && (
                <div className={styles.options}>
                  {currentQuestion?.options?.map((option, idx) => {
                    const isSelected = selectedAnswer === option.translation;
                    const isCorrectAnswer = option.translation === currentQuestion.correctAnswer;
                    const showCorrect = showResult && isCorrectAnswer;
                    const showWrong = showResult && isSelected && !isCorrectAnswer;

                    return (
                      <motion.button
                        key={idx}
                        className={`${styles.option} ${showCorrect ? styles.correctOption : ''} ${showWrong ? styles.wrongOption : ''}`}
                        onClick={() => handleAnswer(option.translation)}
                        disabled={showResult}
                        whileTap={!showResult ? { scale: 0.97 } : {}}
                      >
                        {option.emoji && <span className={styles.optionEmoji}>{option.emoji}</span>}
                        <span className={styles.optionText}>{option.translation}</span>
                        {showCorrect && <Check size={20} className={styles.optionIcon} />}
                        {showWrong && <X size={20} className={styles.optionIcon} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Build type */}
              {currentQuestion?.type === 'build' && (
                <div className={styles.buildSection}>
                  <div className={styles.buildWordDisplay}>
                    <span className={styles.buildWordText}>
                      {builtWord.map(l => l.letter).join('')}
                    </span>
                    {builtWord.length < (currentQuestion?.correctAnswer.replace(/\s/g, '').length || 0) && (
                      <span className={styles.buildCursor}>|</span>
                    )}
                  </div>
                  <p className={styles.buildHint}>
                    {builtWord.length} / {currentQuestion?.correctAnswer.replace(/\s/g, '').length} букв
                  </p>

                  {!showResult && (
                    <>
                      <div className={styles.letterPool}>
                        {buildLetters.map((item) => (
                          <motion.button
                            key={`letter-${item.id}`}
                            className={styles.letterBtn}
                            onClick={() => handleBuildLetter(item.letter, item.id)}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {item.letter}
                          </motion.button>
                        ))}
                      </div>
                      <div className={styles.buildActions}>
                        <button
                          className={styles.undoBtn}
                          onClick={handleUndoLetter}
                          disabled={builtWord.length === 0}
                        >
                          ← Назад
                        </button>
                        <Button
                          size="sm"
                          onClick={handleSubmitBuild}
                          disabled={builtWord.length === 0}
                        >
                          Проверить
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Match type */}
              {currentQuestion?.type === 'match' && matchWords.length > 0 && (
                <div className={styles.matchSection}>
                  <div className={styles.matchColumns}>
                    <div className={styles.matchColumn}>
                      {matchWords.map((pair, idx) => {
                        const isMatched = matchedIndices.some(m => m.arabic === idx);
                        const isSelected = matchSelected?.side === 'arabic' && matchSelected?.index === idx;
                        const isShaking = matchShake === 'arabic' && matchSelected?.index === idx;
                        return (
                          <motion.button
                            key={`ar-${idx}`}
                            className={`${styles.matchCard} ${isMatched ? styles.matchMatched : ''} ${isSelected ? styles.matchSelected : ''} ${isShaking ? styles.matchShake : ''}`}
                            onClick={() => handleMatchClick('arabic', idx)}
                            disabled={isMatched}
                            whileTap={!isMatched ? { scale: 0.97 } : {}}
                            animate={isShaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                            transition={isShaking ? { duration: 0.4 } : {}}
                          >
                            <span className={styles.matchArabic}>{pair.arabic}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className={styles.matchColumn}>
                      {[...matchWords].sort(() => Math.random() - 0.5).map((pair, displayIdx) => {
                        const realIdx = matchWords.indexOf(pair);
                        const isMatched = matchedIndices.some(m => m.translation === realIdx);
                        const isSelected = matchSelected?.side === 'translation' && matchSelected?.index === realIdx;
                        const isShaking = matchShake === 'translation' && matchSelected?.index === realIdx;
                        return (
                          <motion.button
                            key={`tr-${displayIdx}`}
                            className={`${styles.matchCard} ${isMatched ? styles.matchMatched : ''} ${isSelected ? styles.matchSelected : ''} ${isShaking ? styles.matchShake : ''}`}
                            onClick={() => handleMatchClick('translation', realIdx)}
                            disabled={isMatched}
                            whileTap={!isMatched ? { scale: 0.97 } : {}}
                            animate={isShaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                            transition={isShaking ? { duration: 0.4 } : {}}
                          >
                            <span className={styles.matchTranslation}>{pair.translation}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.matchProgress}>
                    {'⭐'.repeat(matchedIndices.length)}{'○'.repeat(matchWords.length - matchedIndices.length)}
                  </div>
                </div>
              )}
            </Card>

            {/* Feedback - hide for match type */}
            {showResult && currentQuestion?.type !== 'match' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.resultFeedback}
              >
                <Card className={`${styles.feedbackCard} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`} padding="md">
                  <div className={styles.feedbackContent}>
                    {isCorrect ? (
                      <>
                        <Check size={24} />
                        <span>Правильно!</span>
                      </>
                    ) : (
                      <>
                        <X size={24} />
                        <span>Правильный ответ: {currentQuestion?.correctAnswer}</span>
                      </>
                    )}
                  </div>
                  <Button size="sm" onClick={handleNext} icon={<ArrowRight size={16} />} iconPosition="right">
                    {currentIndex < questions.length - 1 ? 'Далее' : 'Завершить'}
                  </Button>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
