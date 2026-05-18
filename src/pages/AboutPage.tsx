import { motion } from 'framer-motion';
import { BookOpen, Send, Heart, Star, Unlock, RotateCcw, Crown } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import styles from './AboutPage.module.css';

export function AboutPage() {
  const { unlockAllLessons, resetProgress } = useAppStore();

  const handlePremium = async () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id;

      console.log('Sending premium request for telegramId:', telegramId);

      const response = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      console.log('Premium invoice response:', data);

      const invoiceUrl = data.invoice_url || data.invoiceUrl;
      if (invoiceUrl) {
        tg?.openInvoice(invoiceUrl);
      }
    } catch (error) {
      console.error('Premium error:', error);
    }
  };

  return (
    <div className={styles.page}>
      <Header title="О приложении" />

      <main className={styles.main}>
        <motion.div
          className={styles.logoSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.logoIcon}>
            <BookOpen size={48} />
          </div>
          <h1 className={styles.appName}>Байна Ядайк</h1>
          <p className={styles.appSubtitle}>Словарь арабских слов</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={styles.devCard} padding="lg">
            <h2 className={styles.devTitle}>Разработчик</h2>
            <div className={styles.devInfo}>
              <div className={styles.devAvatar}>
                <span className={styles.devInitial}>АХ</span>
              </div>
              <div className={styles.devDetails}>
                <span className={styles.devName}>Абу Хурайра</span>
                <a
                  href="https://t.me/ramadan_abu_huraira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.devLink}
                >
                  <Send size={16} />
                  @ramadan_abu_huraira
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className={styles.devCard} padding="lg">
            <h2 className={styles.devTitle}>Устаз</h2>
            <div className={styles.devInfo}>
              <div className={styles.devAvatar}>
                <span className={styles.devInitial}>АР</span>
              </div>
              <div className={styles.devDetails}>
                <span className={styles.devName}>Адам Абу Робиа</span>
                <a
                  href="https://t.me/iibn_jabal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.devLink}
                >
                  <Send size={16} />
                  @iibn_jabal
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={styles.infoCard} padding="lg">
            <h3 className={styles.infoTitle}>О проекте</h3>
            <p className={styles.infoText}>
              Приложение для изучения арабских слов на основе словаря «Байна Ядайк».
              Создано с любовью для тех, кто стремится изучать арабский язык.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className={styles.featuresCard} padding="lg">
            <h3 className={styles.featuresTitle}>Возможности</h3>
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <Star size={18} />
                <span>641 слово из словаря</span>
              </div>
              <div className={styles.featureItem}>
                <Star size={18} />
                <span>16 тематических уроков</span>
              </div>
              <div className={styles.featureItem}>
                <Star size={18} />
                <span>Интервальное повторение</span>
              </div>
              <div className={styles.featureItem}>
                <Star size={18} />
                <span>Озвучка арабских слов</span>
              </div>
              <div className={styles.featureItem}>
                <Star size={18} />
                <span>Система достижений</span>
              </div>
              <div className={styles.featureItem}>
                <Star size={18} />
                <span>Тёмная и светлая тема</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button className={styles.premiumButton} onClick={handlePremium}>
            <Crown size={24} />
            <span>⭐ Unlock Premium</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className={styles.actionButtons}
        >
          <Button
            variant="outline"
            size="lg"
            icon={<Unlock size={18} />}
            onClick={unlockAllLessons}
            fullWidth
          >
            Открыть все уроки
          </Button>
          <Button
            variant="ghost"
            size="lg"
            icon={<RotateCcw size={18} />}
            onClick={resetProgress}
            fullWidth
          >
            Сбросить прогресс
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.footer}
        >
          <p className={styles.footerText}>
            Сделано с <Heart size={14} fill="currentColor" /> для изучения арабского языка
          </p>
          <p className={styles.footerVersion}>Версия 1.0.0</p>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}