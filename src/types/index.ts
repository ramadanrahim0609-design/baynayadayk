export interface Word {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  lesson: number;
  audioUrl?: string;
  emoji?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  wordCount: number;
  lesson: number;
}

export interface StudySession {
  id: string;
  wordId: string;
  status: 'known' | 'unknown' | 'reviewing';
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface UserProgress {
  totalWordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  dailyGoal: number;
  todayWordsLearned: number;
  totalStudyTime: number;
}

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
  type: 'words' | 'streak' | 'days' | 'accuracy';
}

export interface DailyQuote {
  id: string;
  text: string;
  textAr: string;
  source: string;
}

export type ThemeMode = 'light' | 'dark';

export type StudyMode = 'cards' | 'quiz' | 'list';