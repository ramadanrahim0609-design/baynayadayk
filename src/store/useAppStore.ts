import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Word, StudySession, UserProgress, Achievement, ThemeMode } from '../types';
import { words, achievements } from '../data/dictionary';
import { grammarRules } from '../data/grammar';
import { lessonPath } from '../data/lessons';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, parseISO } from 'date-fns';

interface ExerciseResult {
  lessonId: string;
  score: number;
  total: number;
  xpEarned: number;
  date: string;
}

interface AppState {
  userProgress: UserProgress;
  studySessions: StudySession[];
  favorites: string[];
  completedLessons: string[];
  unlockedAchievements: string[];
  theme: ThemeMode;
  hasOnboarded: boolean;
  dailyGoal: number;
  xp: number;
  level: number;
  exerciseResults: ExerciseResult[];
  completedGrammar: string[];
  streakFreezes: number;
  isPremium: boolean;
  dailyRewardClaimed: boolean;
  lastDailyRewardDate: string | null;

  setTheme: (theme: ThemeMode) => void;
  setOnboarded: (value: boolean) => void;
  setDailyGoal: (goal: number) => void;
  resetProgress: () => void;
  setPremium: (value: boolean) => void;

  addXP: (amount: number) => void;
  completeLesson: (lessonId: string, score: number, total: number) => void;
  completeGrammar: (grammarId: string) => void;

  markWordKnown: (wordId: string) => void;
  markWordUnknown: (wordId: string) => void;
  addToFavorites: (wordId: string) => void;
  removeFromFavorites: (wordId: string) => void;

  getWordsForReview: () => Word[];
  getFavoriteWords: () => Word[];
  getWordsByLesson: (lesson: number) => Word[];
  getWordsByCategory: (category: string) => Word[];
  getWordsByIds: (ids: string[]) => Word[];

  checkAchievements: () => Achievement[];
  getTodayProgress: () => { learned: number; goal: number; percentage: number };
  getLessonStatus: (lessonId: string) => 'locked' | 'available' | 'completed';
  getTotalWordsLearned: () => number;
  claimDailyReward: () => number;
  canClaimDailyReward: () => boolean;
}

const calculateNextReview = (session: StudySession, status: 'known' | 'unknown'): StudySession => {
  let { interval, easeFactor, repetitions } = session;

  if (status === 'known') {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (Math.random() * 0.05));
  } else {
    interval = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { ...session, interval, easeFactor, repetitions, nextReview, status: status === 'known' ? 'reviewing' : 'unknown' };
};

const initialProgress: UserProgress = {
  totalWordsLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  dailyGoal: 10,
  todayWordsLearned: 0,
  totalStudyTime: 0,
};

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProgress: initialProgress,
      studySessions: [],
      favorites: [],
      completedLessons: [],
      unlockedAchievements: [],
      theme: 'light',
      hasOnboarded: false,
      dailyGoal: 10,
      xp: 0,
      level: 1,
      exerciseResults: [],
      completedGrammar: [],
      streakFreezes: 0,
      isPremium: false,
      dailyRewardClaimed: false,
      lastDailyRewardDate: null,

      setTheme: (theme) => set({ theme }),
      setOnboarded: (value) => set({ hasOnboarded: value }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setPremium: (value) => set({ isPremium: value }),
      resetProgress: () => {
        set({ xp: 0, level: 1, completedLessons: [], completedGrammar: [], exerciseResults: [], userProgress: initialProgress, studySessions: [], favorites: [], unlockedAchievements: [] });
      },

      addXP: (amount) => {
        const { xp } = get();
        const newXP = xp + amount;
        const newLevel = calculateLevel(newXP);
        set({ xp: newXP, level: newLevel });
      },

      completeLesson: (lessonId, score, total) => {
        const { completedLessons, xp } = get();
        const percentage = (score / total) * 100;
        const xpEarned = Math.round(score * 10);

        set({
          completedLessons: completedLessons.includes(lessonId) ? completedLessons : [...completedLessons, lessonId],
          xp: xp + xpEarned,
          level: calculateLevel(xp + xpEarned),
          exerciseResults: [
            ...get().exerciseResults,
            { lessonId, score, total, xpEarned, date: new Date().toISOString() },
          ],
        });

        get().checkAchievements();
      },

      completeGrammar: (grammarId) => {
        const { completedGrammar } = get();
        if (!completedGrammar.includes(grammarId)) {
          set({ completedGrammar: [...completedGrammar, grammarId] });
          get().addXP(25);
        }
      },

      markWordKnown: (wordId) => {
        const { studySessions, userProgress } = get();
        const existingSession = studySessions.find(s => s.wordId === wordId);

        let newSession: StudySession;

        if (existingSession) {
          newSession = calculateNextReview(existingSession, 'known');
        } else {
          newSession = {
            id: uuidv4(),
            wordId,
            status: 'known',
            nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 1,
          };
        }

        const today = startOfDay(new Date()).toISOString();
        const lastStudy = userProgress.lastStudyDate ? startOfDay(parseISO(userProgress.lastStudyDate)).toISOString() : null;
        const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)).toISOString();

        let newStreak = userProgress.currentStreak;
        if (lastStudy === yesterday) {
          newStreak += 1;
        } else if (lastStudy !== today) {
          newStreak = 1;
        }

        const isFirstTime = !existingSession;

        set({
          studySessions: [...studySessions.filter(s => s.wordId !== wordId), newSession],
          userProgress: {
            ...userProgress,
            totalWordsLearned: userProgress.totalWordsLearned + (isFirstTime ? 1 : 0),
            currentStreak: newStreak,
            longestStreak: Math.max(userProgress.longestStreak, newStreak),
            lastStudyDate: new Date().toISOString(),
            todayWordsLearned: userProgress.todayWordsLearned + 1,
          },
        });

        if (isFirstTime) {
          get().addXP(15);
        } else {
          get().addXP(5);
        }

        get().checkAchievements();
      },

      markWordUnknown: (wordId) => {
        const { studySessions } = get();
        const existingSession = studySessions.find(s => s.wordId === wordId);

        let newSession: StudySession;

        if (existingSession) {
          newSession = calculateNextReview(existingSession, 'unknown');
        } else {
          newSession = {
            id: uuidv4(),
            wordId,
            status: 'unknown',
            nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
          };
        }

        set({
          studySessions: [...studySessions.filter(s => s.wordId !== wordId), newSession],
        });

        get().addXP(2);
      },

      addToFavorites: (wordId) => set(state => ({
        favorites: [...state.favorites, wordId],
      })),

      removeFromFavorites: (wordId) => set(state => ({
        favorites: state.favorites.filter(id => id !== wordId),
      })),

      getWordsForReview: () => {
        const { studySessions } = get();
        const now = new Date();

        const dueWords = studySessions
          .filter(s => new Date(s.nextReview) <= now)
          .map(s => words.find(w => w.id === s.wordId))
          .filter(Boolean) as Word[];

        if (dueWords.length > 0) return dueWords;

        const unknownWords = studySessions
          .filter(s => s.status === 'unknown')
          .map(s => words.find(w => w.id === s.wordId))
          .filter(Boolean) as Word[];

        if (unknownWords.length > 0) return unknownWords.slice(0, 10);

        return words.slice(0, 10);
      },

      getFavoriteWords: () => {
        const { favorites } = get();
        return words.filter(w => favorites.includes(w.id));
      },

      getWordsByLesson: (lesson) => {
        return words.filter(w => w.lesson === lesson);
      },

      getWordsByCategory: (category) => {
        return words.filter(w => w.category === category);
      },

      getWordsByIds: (ids) => {
        return words.filter(w => ids.includes(w.id));
      },

      checkAchievements: () => {
        const { userProgress, unlockedAchievements, xp, completedLessons } = get();
        const newUnlocks: string[] = [];

        achievements.forEach(achievement => {
          if (unlockedAchievements.includes(achievement.id)) return;

          let unlocked = false;

          switch (achievement.type) {
            case 'words':
              unlocked = userProgress.totalWordsLearned >= achievement.requirement;
              break;
            case 'streak':
              unlocked = userProgress.currentStreak >= achievement.requirement;
              break;
            case 'days':
              unlocked = userProgress.totalStudyTime >= achievement.requirement;
              break;
            case 'accuracy':
              unlocked = xp >= achievement.requirement * 10;
              break;
          }

          if (unlocked) {
            newUnlocks.push(achievement.id);
          }
        });

        if (newUnlocks.length > 0) {
          set({ unlockedAchievements: [...unlockedAchievements, ...newUnlocks] });
        }

        return achievements.filter(a => newUnlocks.includes(a.id));
      },

      getTodayProgress: () => {
        const { userProgress, dailyGoal } = get();
        const percentage = Math.min(100, (userProgress.todayWordsLearned / dailyGoal) * 100);
        return {
          learned: userProgress.todayWordsLearned,
          goal: dailyGoal,
          percentage,
        };
      },

      getLessonStatus: (lessonId) => {
        const { completedLessons, xp, isPremium } = get();
        if (completedLessons.includes(lessonId)) return 'completed';

        const lesson = lessonPath.find(l => l.id === lessonId);
        if (!lesson) return 'locked';

        if (isPremium) return 'available';

        if (xp >= lesson.requiredXP) return 'available';
        return 'locked';
      },

      getTotalWordsLearned: () => {
        const { studySessions } = get();
        const uniqueWords = new Set(
          studySessions.filter(s => s.status === 'known' || s.status === 'reviewing').map(s => s.wordId)
        );
        return uniqueWords.size;
      },

      canClaimDailyReward: () => {
        const { lastDailyRewardDate } = get();
        const today = startOfDay(new Date()).toISOString();
        return lastDailyRewardDate !== today;
      },

      claimDailyReward: () => {
        const { lastDailyRewardDate } = get();
        const today = startOfDay(new Date()).toISOString();
        const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)).toISOString();

        if (lastDailyRewardDate === today) return 0;

        let bonus = 20;
        if (lastDailyRewardDate === yesterday) {
          const { userProgress } = get();
          const newStreak = userProgress.currentStreak + 1;
          const streakBonus = Math.min(newStreak * 5, 50);
          bonus += streakBonus;
          set({
            userProgress: {
              ...userProgress,
              currentStreak: newStreak,
              longestStreak: Math.max(userProgress.longestStreak, newStreak),
              lastStudyDate: new Date().toISOString(),
            },
          });
        } else if (lastDailyRewardDate !== today) {
          const { userProgress } = get();
          set({
            userProgress: {
              ...userProgress,
              currentStreak: 1,
              lastStudyDate: new Date().toISOString(),
            },
          });
        }

        set({ lastDailyRewardDate: today, dailyRewardClaimed: true });
        get().addXP(bonus);
        get().checkAchievements();
        return bonus;
      },
    }),
    {
      name: 'bayna-yadayk-storage-v2',
    }
  )
);