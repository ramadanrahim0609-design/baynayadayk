import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Network } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { useAppStore } from '../store/useAppStore';
import { generateGraphData } from '../data/graphData';
import styles from './KnowledgeGraphPage.module.css';

export function KnowledgeGraphPage() {
  const { studySessions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const studiedIds = useMemo(() => new Set(
    studySessions.filter(s => s.status === 'known' || s.status === 'reviewing').map(s => s.wordId),
  ), [studySessions]);

  const graphData = useMemo(() => generateGraphData(studiedIds), [studiedIds]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return graphData.nodes;
    const q = searchQuery.toLowerCase();
    return graphData.nodes.filter(n =>
      n.label.includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.word?.translation.toLowerCase().includes(q) ||
      n.word?.transliteration.toLowerCase().includes(q),
    );
  }, [graphData, searchQuery]);

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return graphData.links;
    const valid = new Set(filteredNodes.map(n => n.id));
    return graphData.links.filter(l => valid.has(l.source) && valid.has(l.target));
  }, [graphData, filteredNodes, searchQuery]);

  return (
    <div className={styles.page}>
      <Header title="Карта знаний" />

      <main className={styles.main}>
        <motion.div
          className={styles.searchBar}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Найти слово на карте..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <motion.div
          className={styles.graphContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredNodes.length > 0 ? (
            <KnowledgeGraph nodes={filteredNodes} links={filteredLinks} />
          ) : (
            <div className={styles.empty}>
              <Network size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {studiedIds.size === 0 ? 'Изучите слова, чтобы карта появилась' : 'Ничего не найдено'}
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          className={styles.statsBar}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className={styles.statItem}>
            <span className={styles.statNum}>{graphData.nodes.filter(n => n.type === 'word').length}</span>
            / {graphData.totalWords} слов
          </span>
          <span className={styles.statItem}>
            <span className={styles.statNum}>{graphData.nodes.filter(n => n.type === 'theme').length}</span>
            тем
          </span>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}
