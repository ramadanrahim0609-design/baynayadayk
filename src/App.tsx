import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { LearnPage } from './pages/LearnPage';
import { ExercisePage } from './pages/ExercisePage';
import { GrammarPage } from './pages/GrammarPage';
import { CardReviewPage } from './pages/CardReviewPage';
import { StatsPage } from './pages/StatsPage';
import { SpeechPage } from './pages/SpeechPage';
import { AboutPage } from './pages/AboutPage';
import { OnboardingPage } from './pages/OnboardingPage';
import './styles/globals.css';

function AppContent() {
  const { hasOnboarded, theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  if (!hasOnboarded) {
    return <OnboardingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<LearnPage />} />
      <Route path="/card" element={<CardReviewPage />} />
      <Route path="/exercise" element={<ExercisePage />} />
      <Route path="/grammar" element={<GrammarPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/speech" element={<SpeechPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}