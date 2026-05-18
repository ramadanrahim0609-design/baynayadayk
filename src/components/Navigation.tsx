import { motion } from 'framer-motion';
import { Home, BookOpen, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';

const navItems = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/grammar', icon: BookOpen, label: 'Грамматика' },
  { path: '/about', icon: Info, label: 'О приложении' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      className={styles.nav}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.9 }}
          >
            <div className={styles.iconWrapper}>
              <Icon size={22} />
              {isActive && (
                <motion.div
                  className={styles.activeIndicator}
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
            <span className={styles.label}>{item.label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}