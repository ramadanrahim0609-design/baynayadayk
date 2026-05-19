import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Check, X, Shield, Zap, BookOpen, RotateCcw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import styles from './SubscriptionPage.module.css';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const { setPremium, isPremium } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [telegramId, setTelegramId] = useState<number | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const id = tg.initDataUnsafe?.user?.id;
      setTelegramId(id);
      console.log('telegramId', id);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!telegramId) {
      console.log('telegramId missing');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          amount: 299,
          currency: 'RUB',
        }),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        console.error('No confirmation URL');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!telegramId) {
      console.log('telegramId missing');
      return;
    }

    setIsRestoring(true);

    try {
      const response = await fetch(`/api/check-subscription?telegramId=${telegramId}`);
      const data = await response.json();
      console.log('Subscription check:', data);

      if (data.isPremium) {
        setPremium(true);
        navigate('/');
      } else {
        console.log('No active subscription found');
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const freeFeatures = [
    'Первые 3 главы бесплатно',
    'Базовые карточки слов',
    'Простые упражнения',
  ];

  const premiumFeatures = [
    'Все 641 слово без ограничений',
    '16 глав с карточками и упражнениями',
    'Полная грамматика с примерами',
    'Интервальное повторение',
    'Тесты каждые 4 главы',
    'Без рекламы навсегда',
    'Озвучка всех слов',
    'Система достижений',
  ];

  return (
    <div className={styles.page}>
      <Header showBack title="Подписка" />

      <main className={styles.main}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.crownIcon}>
            <Crown size={48} />
          </div>
          <h1 className={styles.title}>Выбери свой план</h1>
          <p className={styles.subtitle}>
            Начни бесплатно или получи полный доступ
          </p>
        </motion.div>

        {/* Free plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={styles.planCard} padding="lg">
            <div className={styles.planHeader}>
              <h2 className={styles.planName}>Бесплатно</h2>
              <span className={styles.planPrice}>0 ₽</span>
            </div>
            <ul className={styles.featuresList}>
              {freeFeatures.map((feature, i) => (
                <li key={i} className={styles.featureItem}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Premium plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`${styles.planCard} ${styles.premiumCard}`} padding="lg">
            <div className={styles.premiumBadge}>
              <Star size={14} fill="white" />
              <span>ЛУЧШИЙ ВЫБОР</span>
            </div>
            <div className={styles.planHeader}>
              <h2 className={styles.planName}>Premium</h2>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>299</span>
                <span className={styles.priceCurrency}> ₽</span>
              </div>
            </div>
            <p className={styles.planNote}>Одноразовая оплата • Навсегда</p>
            <ul className={styles.featuresList}>
              {premiumFeatures.map((feature, i) => (
                <li key={i} className={styles.featureItem}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className={styles.actionSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            className={styles.subscribeButton}
            onClick={handleSubscribe}
            disabled={isLoading}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <Loader2 size={22} className={styles.spinner} />
            ) : (
              <Crown size={22} />
            )}
            <span>{isLoading ? 'Загрузка...' : 'Получить Premium'}</span>
          </motion.button>

          <button
            className={styles.restoreButton}
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <Loader2 size={16} className={styles.spinnerSmall} />
            ) : (
              <RotateCcw size={16} />
            )}
            <span>{isRestoring ? 'Проверка...' : 'Восстановить подписку'}</span>
          </button>
        </motion.div>

        {/* Security note */}
        <motion.div
          className={styles.securityNote}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Shield size={14} />
          <span>Безопасная оплата через ЮKassa</span>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}
