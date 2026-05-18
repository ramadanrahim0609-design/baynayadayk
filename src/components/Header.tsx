import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightElement?: ReactNode;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = false,
  rightElement,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useAppStore();

  return (
    <motion.header
      className={`${styles.header} ${transparent ? styles.transparent : ''}`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.left}>
        {showBack && (
          <motion.button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={22} />
          </motion.button>
        )}
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>

      <div className={styles.right}>
        {rightElement}
        <motion.button
          className={styles.themeToggle}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
      </div>
    </motion.header>
  );
}