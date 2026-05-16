import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Word, StudySession, UserProgress, Achievement, ThemeMode } from '../types';
import { words, achievements } from '../data/dictionary';
import { v4 as uuidv4 } from 'uuid';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

interface AppState {
  userProgress: UserProgress;
  studySessions: StudySession[];
  favorites: string[];
  completedLessons: number[];
  unlockedAchievements: string[];
  theme: ThemeMode;
  hasOnboarded: boolean;
  dailyGoal: number;

  setTheme: (theme: ThemeMode) => void;
  setOnboarded: (value: boolean) => void;
  setDailyGoal: (goal: number) => void;

  markWordKnown: (wordId: string) => void;
  markWordUnknown: (wordId: string) => void;
  addToFavorites: (wordId: string) => void;
  removeFromFavorites: (wordId: string) => void;
  completeLesson: (lesson: number) => void;

  getWordsForReview: () => Word[];
  getFavoriteWords: () => Word[];
  getWordsByLesson: (lesson: number) => Word[];
  getWordsByCategory: (category: string) => Word[];

  checkAchievements: () => Achievement[];
  getTodayProgress: () => { learned: number; goal: number; percentage: number };
}

const calculateNextReview = (session: StudySession, status: 'known' | 'unknown'): StudySession => {
  let { interval, easeFactor, repetitions } = session;

  if (status === 'known') {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + 0.1);
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

      setTheme: (theme) => set({ theme }),
      setOnboarded: (value) => set({ hasOnboarded: value }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),

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

        set({
          studySessions: [...studySessions.filter(s => s.wordId !== wordId), newSession],
          userProgress: {
            ...userProgress,
            totalWordsLearned: userProgress.totalWordsLearned + (!existingSession ? 1 : 0),
            currentStreak: newStreak,
            longestStreak: Math.max(userProgress.longestStreak, newStreak),
            lastStudyDate: new Date().toISOString(),
            todayWordsLearned: userProgress.todayWordsLearned + 1,
          },
        });

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
      },

      addToFavorites: (wordId) => set(state => ({
        favorites: [...state.favorites, wordId],
      })),

      removeFromFavorites: (wordId) => set(state => ({
        favorites: state.favorites.filter(id => id !== wordId),
      })),

      completeLesson: (lesson) => set(state => ({
        completedLessons: state.completedLessons.includes(lesson)
          ? state.completedLessons
          : [...state.completedLessons, lesson],
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

      checkAchievements: () => {
        const { userProgress, unlockedAchievements } = get();
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
    }),
    {
      name: 'bayna-yadayk-storage',
    }
  )
);