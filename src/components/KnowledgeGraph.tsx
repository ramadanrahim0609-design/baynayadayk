import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Plus, Minus, RotateCcw } from 'lucide-react';
import { GraphNode } from '../data/graphData';
import styles from './KnowledgeGraph.module.css';

const THEME_RADIUS = 30;
const WORD_RADIUS = 7;
const STUDIED_RADIUS = 9;

export function KnowledgeGraph({ nodes, links }: {
  nodes: GraphNode[];
  links: { source: string; target: string }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 800, h: 600 });
  const [t, setT] = useState({ x: 0, y: 0, k: 0.55 });
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const isPan = useRef(false);
  const isDrag = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const themeNodes = nodes.filter(n => n.type === 'theme');
  const wordNodes = nodes.filter(n => n.type === 'word');
  const linkSet = new Set(links.map(l => `${l.source}-${l.target}`));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDim({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const zi = useCallback(() => setT(p => ({ ...p, k: Math.min(p.k * 1.3, 4) })), []);
  const zo = useCallback(() => setT(p => ({ ...p, k: Math.max(p.k / 1.3, 0.12) })), []);
  const reset = useCallback(() => setT({ x: 0, y: 0, k: 0.55 }), []);

  const onDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as SVGElement).closest('[data-node]')) return;
    isPan.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!isPan.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDrag.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    setT(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
  }, []);

  const onUp = useCallback(() => {
    isPan.current = false;
    setTimeout(() => { isDrag.current = false; }, 50);
  }, []);

  const linkColor = (n: GraphNode) => {
    const theme = themeNodes.find(t => linkSet.has(`${t.id}-${n.id}`) || linkSet.has(`${n.id}-${t.id}`));
    return theme?.color ?? '#555';
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={zi} aria-label="+"><Plus size={18} /></button>
        <button className={styles.ctrlBtn} onClick={zo} aria-label="-"><Minus size={18} /></button>
        <button className={styles.ctrlBtn} onClick={reset} aria-label="reset"><RotateCcw size={16} /></button>
      </div>

      <div ref={containerRef} className={styles.canvas}>
        <svg
          width={dim.w} height={dim.h}
          className={styles.svg}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{ touchAction: 'none' }}
        >
          <g transform={`translate(${dim.w / 2 + t.x},${dim.h / 2 + t.y}) scale(${t.k})`}>
            {/* Links: theme → words */}
            {wordNodes.map(word => {
              const theme = themeNodes.find(t => linkSet.has(`${t.id}-${word.id}`));
              if (!theme) return null;
              const dimmed = hovered && hovered !== word.id && hovered !== theme.id;
              return (
                <line
                  key={`l-${word.id}`}
                  x1={theme.x} y1={theme.y}
                  x2={word.x} y2={word.y}
                  stroke={theme.color}
                  strokeWidth={dimmed ? 0.3 : 0.6}
                  strokeOpacity={dimmed ? 0.05 : (hovered ? 0.6 : 0.15)}
                  className={styles.link}
                />
              );
            })}

            {/* Theme labels */}
            {themeNodes.map(theme => {
              const labelVisible = t.k > 0.25;
              return (
                <g
                  key={theme.id}
                  data-node={theme.id}
                  className={styles.themeGroup}
                  style={{ '--clr': theme.color } as React.CSSProperties}
                  onPointerEnter={() => setHovered(theme.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <circle cx={theme.x} cy={theme.y} r={THEME_RADIUS + 14} fill="none" stroke={theme.color} strokeWidth={1} strokeOpacity={0.08} className={styles.themeGlowBg} />
                  <circle cx={theme.x} cy={theme.y} r={THEME_RADIUS + 8} fill="none" stroke={theme.color} strokeWidth={2} strokeOpacity={0.15} className={styles.themeGlow} />
                  <circle cx={theme.x} cy={theme.y} r={THEME_RADIUS} fill={theme.color} fillOpacity={0.2} stroke={theme.color} strokeWidth={2.5} strokeOpacity={0.7} className={styles.themeCircle} />
                  {labelVisible && (
                    <text
                      x={theme.x} y={theme.y}
                      textAnchor="middle" dominantBaseline="central"
                      fill={theme.color}
                      fontSize={10} fontWeight="700"
                      className={styles.themeText}
                    >
                      {theme.label.length > 14 ? theme.label.slice(0, 13) + '…' : theme.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Word nodes */}
            {wordNodes.map((word, i) => {
              const isHov = hovered === word.id;
              const themeDim = hovered && hovered !== word.id && themeNodes.every(t => t.id !== hovered);
              const dimmed = hovered && !isHov;
              const r = STUDIED_RADIUS;

              return (
                <g
                  key={word.id}
                  data-node={word.id}
                  className={styles.wordGroup}
                  style={{ '--i': i } as React.CSSProperties}
                  onClick={() => { if (!isDrag.current) setSelected(word); }}
                  onPointerEnter={() => setHovered(word.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  {isHov && (
                    <circle cx={word.x} cy={word.y} r={r + 6} fill="none" stroke={linkColor(word)} strokeWidth={2} strokeOpacity={0.3} className={styles.wordPulse} />
                  )}
                  <circle
                    cx={word.x} cy={word.y} r={r}
                    fill={dimmed ? '#222' : '#2a2a2a'}
                    stroke={linkColor(word)}
                    strokeWidth={isHov ? 2.5 : 1.5}
                    strokeOpacity={isHov ? 0.8 : 0.3}
                    className={styles.wordCircle}
                  />
                  {t.k > 0.4 && (
                    <text
                      x={word.x} y={word.y + r + 10}
                      textAnchor="middle"
                      fill={dimmed ? '#333' : '#666'}
                      fontSize={7}
                      fontFamily="var(--font-arabic)"
                      direction="rtl"
                      className={styles.wordText}
                    >
                      {word.label.slice(0, 4)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {nodes.length === 0 && (
          <div className={styles.empty}>
            <p>Изучите слова, чтобы увидеть карту знаний</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && selected.word && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className={styles.modalCard}
              onClick={e => e.stopPropagation()}
              initial={{ y: 20, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.9 }}
            >
              <button className={styles.modalClose} onClick={() => setSelected(null)}><X size={18} /></button>
              <div className={styles.modalHeader}>
                {selected.word.emoji && <span className={styles.modalEmoji}>{selected.word.emoji}</span>}
                <h3 className={styles.modalArabic}>{selected.word.arabic}</h3>
                <span className={styles.modalTranslation}>{selected.word.translation}</span>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalInfo}>
                  <span className={styles.infoLabel}>Транскрипция</span>
                  <span className={styles.infoValue}>{selected.word.transliteration}</span>
                </div>
                <div className={styles.modalInfo}>
                  <span className={styles.infoLabel}>Тема</span>
                  <span className={styles.infoValue}>{selected.category}</span>
                </div>
              </div>
              <button className={styles.audioBtn} onClick={() => {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(selected.word!.arabic);
                u.lang = 'ar-SA'; u.rate = 0.7;
                window.speechSynthesis.speak(u);
              }}>
                <Volume2 size={18} /> Прослушать
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
