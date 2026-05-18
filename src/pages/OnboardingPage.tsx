import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Target, Award, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import styles from './OnboardingPage.module.css';

const slides = [
  {
    icon: BookOpen,
    title: 'Учи арабский легко',
    titleAr: 'تعلّم العربية بسهولة',
    description: '641 слово из словаря «Байна Ядайк» с интервальным повторением и упражнениями.',
    descriptionAr: '٦٤١ كلمة من قاموس بين يديك مع التكرار المتباعد والتمارين',
    color: '#2D5BFF',
  },
  {
    icon: Zap,
    title: 'Проходи уроки',
    titleAr: 'أكمل الدروس',
    description: 'Путь обучения как в Duolingo: слова → грамматика → упражнения → тесты.',
    descriptionAr: 'مسار التعلم مثل دولينجو: كلمات ← قواعد ← تمارين ← اختبارات',
    color: '#10B981',
  },
  {
    icon: Award,
    title: 'Получай награды',
    titleAr: 'احصل على المكافآت',
    description: 'XP, уровни, серии дней и достижения — учись с удовольствием каждый день.',
    descriptionAr: 'نقاط XP ومستويات وسلاسل يومية وإنجازات - تعلم كل يوم بسرور',
    color: '#FF6B35',
  },
];

export function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { setOnboarded, setDailyGoal } = useAppStore();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setOnboarded(true);
      setDailyGoal(10);
      navigate('/');
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
    setDailyGoal(10);
    navigate('/');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className={styles.page}>
      <button className={styles.skipButton} onClick={handleSkip}>
        Пропустить
      </button>

      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className={styles.slideContent}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className={styles.iconContainer}
              style={{ background: `${slide.color}20`, color: slide.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Icon size={48} />
            </motion.div>

            <motion.div
              className={styles.textContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className={styles.title}>{slide.title}</h1>
              <p className={styles.titleAr}>{slide.titleAr}</p>
              <p className={styles.description}>{slide.description}</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className={styles.pagination}>
          {slides.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              style={{
                background: index === currentSlide ? slide.color : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </main>

      <div className={styles.footer}>
        <Button
          fullWidth
          size="lg"
          onClick={handleNext}
          icon={currentSlide === slides.length - 1 ? <Sparkles size={20} /> : <ArrowRight size={20} />}
          iconPosition="right"
        >
          {currentSlide === slides.length - 1 ? 'Начать обучение' : 'Далее'}
        </Button>
      </div>
    </div>
  );
}