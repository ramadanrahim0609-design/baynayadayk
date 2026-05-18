import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { LearnPage } from './pages/LearnPage';
import { ExercisePage } from './pages/ExercisePage';
import { GrammarPage } from './pages/GrammarPage';
import { CardReviewPage } from './pages/CardReviewPage';
import { AboutPage } from './pages/AboutPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoadingScreen } from './components/LoadingScreen';
import './styles/globals.css';

function AppContent() {
  const { hasOnboarded, theme } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.ready();
      (window as any).Telegram.WebApp.expand();
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!hasOnboarded) {
    return <OnboardingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<LearnPage />} />
      <Route path="/card" element={<CardReviewPage />} />
      <Route path="/exercise" element={<ExercisePage />} />
      <Route path="/grammar" element={<GrammarPage />} />
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