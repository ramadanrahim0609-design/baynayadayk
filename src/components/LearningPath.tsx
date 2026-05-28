import { motion } from 'framer-motion';
import { Check, Lock, Star, BookOpen, Trophy, Repeat, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { lessonPath, LessonNode } from '../data/lessons';
import styles from './LearningPath.module.css';

const typeIcons: Record<string, React.ReactNode> = {
  words: <BookOpen size={20} />,
  grammar: <Zap size={20} />,
  exercise: <Repeat size={20} />,
  review: <Repeat size={20} />,
  test: <Trophy size={20} />,
};

const typeColors: Record<string, { bg: string; shadow: string; glow: string }> = {
  words: {
    bg: '#58CC02',
    shadow: '0 4px 0 #46A302',
    glow: '0 0 20px rgba(88, 204, 2, 0.4)',
  },
  grammar: {
    bg: '#1CB0F6',
    shadow: '0 4px 0 #0E8ACF',
    glow: '0 0 20px rgba(28, 176, 246, 0.4)',
  },
  exercise: {
    bg: '#FF9600',
    shadow: '0 4px 0 #E68600',
    glow: '0 0 20px rgba(255, 150, 0, 0.4)',
  },
  review: {
    bg: '#CE82FF',
    shadow: '0 4px 0 #A855F7',
    glow: '0 0 20px rgba(206, 130, 255, 0.4)',
  },
  test: {
    bg: '#FFC800',
    shadow: '0 4px 0 #E6B400',
    glow: '0 0 20px rgba(255, 200, 0, 0.4)',
  },
};

export function LearningPath() {
  const navigate = useNavigate();
  const { getLessonStatus } = useAppStore();

  const groupedLessons = lessonPath.reduce((acc, lesson) => {
    const chapter = lesson.lesson || 1;
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(lesson);
    return acc;
  }, {} as Record<number, LessonNode[]>);

  const chapterNames: Record<number, { name: string; icon: string }> = {
    1: { name: 'Приветствия', icon: '👋' },
    2: { name: 'Семья', icon: '👨‍👩‍👧' },
    3: { name: 'Жильё', icon: '🏠' },
    4: { name: 'Повседневная жизнь', icon: '🌅' },
    5: { name: 'Еда и напитки', icon: '🍽️' },
    6: { name: 'Молитвы', icon: '🕌' },
    7: { name: 'Учёба', icon: '📚' },
    8: { name: 'Работа', icon: '💼' },
    9: { name: 'Покупки', icon: '🛒' },
    10: { name: 'Погода', icon: '🌤️' },
    11: { name: 'Люди и места', icon: '🌍' },
    12: { name: 'Хобби', icon: '🎯' },
    13: { name: 'Путешествие', icon: '✈️' },
    14: { name: 'Хадж и умра', icon: '🕋' },
    15: { name: 'Здоровье', icon: '🏥' },
    16: { name: 'Каникулы', icon: '🏖️' },
  };

  const handleClick = (lesson: LessonNode) => {
    const status = getLessonStatus(lesson.id);
    if (status === 'locked') return;
    if (lesson.type === 'grammar') navigate(`/grammar?lesson=${lesson.lesson}`);
    else if (lesson.type === 'words') navigate(`/card?lesson=${lesson.id}`);
    else navigate(`/exercise?lesson=${lesson.id}`);
  };

  return (
    <div className={styles.path}>
      {Object.entries(groupedLessons).map(([chapter, lessons]) => {
        const chapterNum = parseInt(chapter);
        const isChapterComplete = lessons.every(l => getLessonStatus(l.id) === 'completed');
        const chapterInfo = chapterNames[chapterNum] || { name: `Глава ${chapterNum}`, icon: '📖' };

        return (
          <div key={chapter} className={styles.chapterSection}>
            <motion.div
              className={styles.chapterHeader}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: chapterNum * 0.05 }}
            >
              <div className={`${styles.chapterBadge} ${isChapterComplete ? styles.chapterComplete : ''}`}>
                <span className={styles.chapterIcon}>{chapterInfo.icon}</span>
              </div>
              <div className={styles.chapterInfo}>
                <h3 className={styles.chapterTitle}>{chapterInfo.name}</h3>
                <span className={styles.chapterProgress}>
                  {lessons.filter(l => getLessonStatus(l.id) === 'completed').length}/{lessons.length}
                </span>
              </div>
              {isChapterComplete && <Check size={18} className={styles.chapterCheck} />}
            </motion.div>

            <div className={styles.nodesContainer}>
              {lessons.map((lesson) => {
                const status = getLessonStatus(lesson.id);
                const isCompleted = status === 'completed';
                const isLocked = status === 'locked';
                const isCurrent = !isLocked && !isCompleted;
                const colors = typeColors[lesson.type] || typeColors.words;

                return (
                  <motion.div
                    key={lesson.id}
                    className={styles.nodeWrapper}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
                  >
                    <motion.button
                      className={`${styles.node} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                      style={{
                        background: isLocked ? 'var(--color-bg-elevated)' : isCompleted ? `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}cc 100%)` : colors.bg,
                        boxShadow: isLocked ? 'none' : isCompleted ? `0 4px 0 ${colors.bg}dd` : colors.shadow,
                        border: isLocked ? '2px dashed var(--color-border)' : 'none',
                      }}
                      onClick={() => handleClick(lesson)}
                      disabled={isLocked}
                      whileTap={!isLocked ? { scale: 0.9, y: 3 } : {}}
                      whileHover={!isLocked ? { scale: 1.08 } : {}}
                    >
                      {isCurrent && <div className={styles.glow} style={{ boxShadow: colors.glow }} />}
                      {isCompleted && (
                        <div className={styles.checkBadge}>
                          <Star size={10} fill="white" />
                        </div>
                      )}
                      <div className={styles.nodeIcon}>
                        {isCompleted ? <Check size={20} /> : isLocked ? <Lock size={16} /> : typeIcons[lesson.type] || <Star size={20} />}
                      </div>
                      {lesson.wordIds && lesson.wordIds.length > 0 && (
                        <div className={styles.countBadge}>{lesson.wordIds.length}</div>
                      )}
                    </motion.button>
                    <span className={`${styles.nodeTitle} ${isLocked ? styles.nodeTitleLocked : ''}`}>{lesson.title}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
