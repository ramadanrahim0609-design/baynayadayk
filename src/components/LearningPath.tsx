import { motion } from 'framer-motion';
import { Check, Lock, Star, BookOpen, Trophy, Repeat, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { lessonPath, LessonNode } from '../data/lessons';
import styles from './LearningPath.module.css';

const typeIcons: Record<string, React.ReactNode> = {
  words: <BookOpen size={28} />,
  grammar: <Zap size={28} />,
  exercise: <Repeat size={28} />,
  review: <Repeat size={28} />,
  test: <Trophy size={28} />,
};

const typeColors: Record<string, { bg: string; shadow: string; glow: string }> = {
  words: {
    bg: 'linear-gradient(135deg, #58CC02 0%, #78E028 100%)',
    shadow: '0 6px 0 #46A302, 0 8px 16px rgba(0, 0, 0, 0.3)',
    glow: '0 0 25px rgba(88, 204, 2, 0.5)',
  },
  grammar: {
    bg: 'linear-gradient(135deg, #1CB0F6 0%, #4CC8F8 100%)',
    shadow: '0 6px 0 #0E8ACF, 0 8px 16px rgba(0, 0, 0, 0.3)',
    glow: '0 0 25px rgba(28, 176, 246, 0.5)',
  },
  exercise: {
    bg: 'linear-gradient(135deg, #FF9600 0%, #FFB347 100%)',
    shadow: '0 6px 0 #E68600, 0 8px 16px rgba(0, 0, 0, 0.3)',
    glow: '0 0 25px rgba(255, 150, 0, 0.5)',
  },
  review: {
    bg: 'linear-gradient(135deg, #CE82FF 0%, #E0B0FF 100%)',
    shadow: '0 6px 0 #A855F7, 0 8px 16px rgba(0, 0, 0, 0.3)',
    glow: '0 0 25px rgba(206, 130, 255, 0.5)',
  },
  test: {
    bg: 'linear-gradient(135deg, #FFC800 0%, #FFD84D 100%)',
    shadow: '0 6px 0 #E6B400, 0 8px 16px rgba(0, 0, 0, 0.3)',
    glow: '0 0 25px rgba(255, 200, 0, 0.5)',
  },
};

// Zigzag pattern: left, center-left, center, center-right, right, center-right, center, center-left...
const zigzagOffsets = [-70, -35, 0, 35, 70, 35, 0, -35];

export function LearningPath() {
  const navigate = useNavigate();
  const { getLessonStatus, completedLessons, xp, level, userProgress } = useAppStore();

  const getLessonIcon = (lesson: LessonNode) => {
    const status = getLessonStatus(lesson.id);
    if (status === 'completed') return <Check size={28} />;
    if (status === 'locked') return <Lock size={28} />;
    return typeIcons[lesson.type] || <Star size={28} />;
  };

  const handleLessonClick = (lesson: LessonNode) => {
    const status = getLessonStatus(lesson.id);
    if (status === 'locked') return;

    if (lesson.type === 'grammar') {
      navigate(`/grammar?lesson=${lesson.lesson}`);
    } else if (lesson.type === 'words') {
      navigate(`/card?lesson=${lesson.id}`);
    } else {
      navigate(`/exercise?lesson=${lesson.id}`);
    }
  };

  // Group lessons by chapter
  const groupedLessons = lessonPath.reduce((acc, lesson) => {
    const chapter = lesson.lesson || 1;
    if (!acc[chapter]) {
      acc[chapter] = [];
    }
    acc[chapter].push(lesson);
    return acc;
  }, {} as Record<number, LessonNode[]>);

  const chapterNames: Record<number, string> = {
    1: 'Приветствия',
    2: 'Семья',
    3: 'Жильё',
    4: 'Повседневная жизнь',
    5: 'Еда и напитки',
    6: 'Молитвы',
    7: 'Учёба',
    8: 'Работа',
    9: 'Покупки',
    10: 'Погода',
    11: 'Люди и места',
    12: 'Хобби',
    13: 'Путешествие',
    14: 'Хадж и умра',
    15: 'Здоровье',
    16: 'Каникулы',
  };

  // Calculate global index for zigzag
  let globalIndex = 0;

  return (
    <div className={styles.path}>
      {/* Top stats bar */}
      <div className={styles.topStats}>
        <div className={styles.statItem}>
          <Flame size={20} className={styles.flameIcon} />
          <span className={styles.statValue}>{userProgress.currentStreak}</span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.xpIcon} />
          <span className={styles.statValue}>{xp}</span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.levelIcon}>{level}</div>
          <span className={styles.statValue}>Ур.</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressInfo}>
          <span className={styles.progressLabel}>Прогресс обучения</span>
          <span className={styles.progressPercent}>{Math.round((completedLessons.length / lessonPath.length) * 100)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(completedLessons.length / lessonPath.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Learning path with zigzag */}
      <div className={styles.nodesContainer}>
        {Object.entries(groupedLessons).map(([chapter, lessons]) => {
          const chapterNum = parseInt(chapter);
          const isChapterComplete = lessons.every(l => getLessonStatus(l.id) === 'completed');

          return (
            <div key={chapter} className={styles.chapterSection}>
              {/* Chapter header */}
              <div className={styles.chapterHeader}>
                <div className={styles.chapterBadge}>
                  <span>{chapterNum}</span>
                </div>
                <h3 className={styles.chapterTitle}>
                  {isChapterComplete && <Check size={16} className={styles.checkIcon} />}
                  {chapterNames[chapterNum] || `Глава ${chapterNum}`}
                </h3>
              </div>

              {/* Zigzag lesson nodes */}
              <div className={styles.zigzagPath}>
                {/* Vertical path line */}
                <div className={styles.pathLine} />

                {lessons.map((lesson) => {
                  const status = getLessonStatus(lesson.id);
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isLocked = status === 'locked';
                  const isCurrent = !isLocked && !isCompleted;

                  const colors = typeColors[lesson.type] || typeColors.words;
                  const zigzagIndex = globalIndex % zigzagOffsets.length;
                  const xOffset = zigzagOffsets[zigzagIndex];
                  globalIndex++;

                  return (
                    <motion.div
                      key={lesson.id}
                      className={styles.nodeWrapper}
                      style={{ transform: `translateX(${xOffset}px)` }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: (globalIndex % zigzagOffsets.length) * 0.08,
                        type: 'spring',
                        stiffness: 100,
                      }}
                    >
                      <motion.button
                        className={`${styles.node} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                        style={{
                          background: isLocked
                            ? 'var(--color-bg-elevated)'
                            : isCompleted
                            ? 'linear-gradient(135deg, #58CC02 0%, #78E028 100%)'
                            : colors.bg,
                          boxShadow: isLocked
                            ? 'none'
                            : isCompleted
                            ? '0 6px 0 #46A302, 0 8px 16px rgba(0, 0, 0, 0.3)'
                            : colors.shadow,
                        }}
                        onClick={() => handleLessonClick(lesson)}
                        disabled={isLocked}
                        whileTap={!isLocked ? { scale: 0.92, y: 4 } : {}}
                        whileHover={!isLocked ? { scale: 1.08 } : {}}
                      >
                        {/* Glow effect for current lesson */}
                        {isCurrent && (
                          <div className={styles.glowEffect} style={{ boxShadow: colors.glow }} />
                        )}

                        {/* Crown for completed */}
                        {isCompleted && (
                          <div className={styles.crownBadge}>
                            <Star size={14} fill="white" />
                          </div>
                        )}

                        <div className={styles.nodeIcon}>
                          {getLessonIcon(lesson)}
                        </div>

                        {/* Word count badge */}
                        {lesson.wordIds && lesson.wordIds.length > 0 && (
                          <div className={styles.wordBadge}>
                            {lesson.wordIds.length}
                          </div>
                        )}
                      </motion.button>

                      {/* Lesson title */}
                      <span className={styles.nodeTitle}>{lesson.title}</span>

                      {/* Locked indicator */}
                      {isLocked && (
                        <span className={styles.lockedText}>
                          <Lock size={10} /> {lesson.requiredXP} XP
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}