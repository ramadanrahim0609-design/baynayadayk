import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { words } from '../data/dictionary';
import { lessonPath } from '../data/lessons';
import styles from './ExercisePage.module.css';

interface Question {
  type: 'choose' | 'match' | 'fill';
  word?: typeof words[0];
  options?: typeof words;
  correctAnswer?: string;
  prompt?: string;
  promptAr?: string;
}

export function ExercisePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lesson');
  const { completeLesson, addXP, getWordsByIds, markWordKnown, markWordUnknown } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('Упражнения');

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

    const generatedQuestions: Question[] = shuffled.map(word => {
      const otherWords = words.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...otherWords, word].sort(() => Math.random() - 0.5);

      return {
        type: 'choose',
        word,
        options,
        correctAnswer: word.translation,
        prompt: 'Выбери правильный перевод:',
        promptAr: word.arabic,
      };
    });

    setQuestions(generatedQuestions);
  }, [lessonId, navigate, getWordsByIds]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((answer: string) => {
    if (showResult) return;

    const correct = answer === currentQuestion?.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + 1);
      if (currentQuestion?.word) {
        markWordKnown(currentQuestion.word.id);
      }
    } else {
      if (currentQuestion?.word) {
        markWordUnknown(currentQuestion.word.id);
      }
    }
  }, [showResult, currentQuestion, markWordKnown, markWordUnknown]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      completeLesson(lessonId || '', finalScore, questions.length);
      addXP(finalScore * 10);
      setIsComplete(true);
    }
  }, [currentIndex, questions.length, score, isCorrect, lessonId, completeLesson, addXP]);

  if (questions.length === 0) {
    return (
      <div className={styles.page}>
        <Header showBack title={lessonTitle} />
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
    const percentage = Math.round((score / questions.length) * 100);
    const xpEarned = score * 10;

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
              {currentIndex + 1} / {questions.length}
            </span>
            <span className={styles.scoreText}>
              ✓ {score}
            </span>
          </div>
          <ProgressBar
            progress={((currentIndex + 1) / questions.length) * 100}
            size="sm"
            variant="gradient"
            animated={false}
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
            <Card className={styles.questionCard} padding="lg">
              <p className={styles.prompt}>{currentQuestion?.prompt}</p>
              <p className={styles.arabicPrompt}>{currentQuestion?.promptAr}</p>

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
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <span className={styles.optionText}>{option.translation}</span>
                      {showCorrect && <Check size={20} />}
                      {showWrong && <X size={20} />}
                    </motion.button>
                  );
                })}
              </div>
            </Card>

            {showResult && (
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
                    Далее
                  </Button>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation />
    </div>
  );
}