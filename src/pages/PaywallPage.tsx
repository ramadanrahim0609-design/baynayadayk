import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Check, X, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import styles from './PaywallPage.module.css';

export function PaywallPage() {
  const navigate = useNavigate();
  const { setPremium, isPremium } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      const tg = (window as any).Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id;

      console.log('telegramId', telegramId);

      if (!telegramId) {
        console.log('telegramId missing');
        setIsLoading(false);
        return;
      }

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
        tg.openInvoice(invoiceUrl, (status: string) => {
          if (status === 'paid') {
            setPremium(true);
            navigate('/');
          }
          setIsLoading(false);
        });
      } else {
        setPremium(true);
        navigate('/');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Premium error:', error);
      setIsLoading(false);
    }
  };

  if (isPremium) {
    navigate('/');
    return null;
  }

  const features = [
    { icon: <Star size={20} />, text: 'Все 641 слово без ограничений' },
    { icon: <Crown size={20} />, text: '16 глав с карточками и упражнениями' },
    { icon: <Zap size={20} />, text: 'Без рекламы навсегда' },
    { icon: <Shield size={20} />, text: 'Интервальное повторение' },
    { icon: <Sparkles size={20} />, text: 'Полная грамматика с примерами' },
    { icon: <Check size={20} />, text: 'Доступ к тестам каждые 4 главы' },
  ];

  return (
    <div className={styles.page}>
      <motion.button
        className={styles.closeButton}
        onClick={() => navigate('/')}
        whileTap={{ scale: 0.9 }}
      >
        <X size={24} />
      </motion.button>

      <main className={styles.main}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.crownIcon}>
            <Crown size={48} />
          </div>
          <h1 className={styles.title}>Разблокируй всё!</h1>
          <p className={styles.subtitle}>
            Первые 3 главы бесплатно. Получи полный доступ ко всему контенту.
          </p>
        </motion.div>

        <motion.div
          className={styles.priceCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Полный доступ</span>
            <div className={styles.priceValue}>
              <span className={styles.priceAmount}>299</span>
              <span className={styles.priceCurrency}>₽</span>
            </div>
          </div>
          <div className={styles.priceNote}>Одноразовая оплата • Навсегда</div>
        </motion.div>

        <motion.div
          className={styles.featuresList}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={styles.featureItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index + 0.3 }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <span className={styles.featureText}>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className={styles.actionSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button
            className={styles.buyButton}
            onClick={handlePurchase}
            disabled={isLoading}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <span className={styles.loadingText}>Загрузка...</span>
            ) : (
              <>
                <Crown size={22} />
                <span>Купить полный доступ</span>
              </>
            )}
          </motion.button>

          <button
            className={styles.freeButton}
            onClick={() => navigate('/')}
          >
            Продолжить бесплатно
          </button>
        </motion.div>
      </main>
    </div>
  );
}
