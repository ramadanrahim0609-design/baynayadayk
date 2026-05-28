import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  emojis?: string[];
  count?: number;
}

const defaultEmojis = ['⭐', '✨', '🌟', '🎉', '🎊', '💫', '🏆', '👏'];

export function Confetti({ active, emojis = defaultEmojis, count = 20 }: ConfettiProps) {
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; delay: number; duration: number; rotate: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 0.6 + Math.random() * 0.8,
      rotate: Math.random() * 360,
    }));
    setParticles(items);
  }, [active, emojis, count]);

  return (
    <AnimatePresence>
      {active && particles.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: '100vh', x: `${p.x}vw`, rotate: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: '-10vh', x: `${p.x + (Math.random() - 0.5) * 40}vw`, rotate: p.rotate, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
              style={{ position: 'absolute', fontSize: '28px', willChange: 'transform' }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
