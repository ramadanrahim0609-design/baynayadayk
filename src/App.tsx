import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { LearnPage } from './pages/LearnPage';
import { ExercisePage } from './pages/ExercisePage';
import { GrammarPage } from './pages/GrammarPage';
import { CardReviewPage } from './pages/CardReviewPage';
import { PaywallPage } from './pages/PaywallPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { AboutPage } from './pages/AboutPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoadingScreen } from './components/LoadingScreen';
import './styles/globals.css';

function AppContent() {
  const { hasOnboarded, theme, setPremium } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

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

  // Check subscription status on load
  useEffect(() => {
    const checkSubscription = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id;

      if (!telegramId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/check-subscription?telegramId=${telegramId}`);
        const data = await response.json();
        console.log('Subscription check on load:', data);

        if (data.isPremium) {
          setPremium(true);
        }
      } catch (error) {
        console.error('Subscription check error:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    checkSubscription();
  }, [setPremium]);

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
      <Route path="/paywall" element={<PaywallPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
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