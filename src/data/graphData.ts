import { Word } from '../types';
import { words } from './dictionary';

export interface GraphNode {
  id: string;
  type: 'theme' | 'word';
  label: string;
  word?: Word;
  category: string;
  color: string;
  x: number;
  y: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  studiedCount: number;
  totalWords: number;
}

const THEME_COLORS = [
  '#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B',
  '#2B70D9', '#00C9A7', '#FF7EB3', '#A560E8', '#FFC800',
  '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B6B', '#1DD1A1',
  '#F368E0', '#FF9F43', '#0ABDE3', '#10AC84', '#EE5A24',
  '#B33771', '#3DC1D3', '#F8A5C2', '#63CDDA', '#CF6A87',
  '#786FA6', '#F19066', '#3EC1D3', '#F6D365', '#E15F41',
];

function hashIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export function generateGraphData(studiedWordIds: Set<string>): GraphData {
  const studiedWords = words.filter(w => studiedWordIds.has(w.id));

  const byCategory = new Map<string, Word[]>();
  for (const word of studiedWords) {
    if (!byCategory.has(word.category)) byCategory.set(word.category, []);
    byCategory.get(word.category)!.push(word);
  }

  const sortedCats = Array.from(byCategory.entries()).sort((a, b) => b[1].length - a[1].length);
  const catCount = sortedCats.length;

  const RADIUS = Math.min(160, Math.max(100, catCount * 18));
  const ARC_DIST = 75;
  const ARC_ANGLE = Math.PI / 5;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const usedColors = new Set<string>();

  sortedCats.forEach(([cat, catWords], catIdx) => {
    const angle = (catIdx / catCount) * Math.PI * 2 - Math.PI / 2;
    const tx = Math.cos(angle) * RADIUS;
    const ty = Math.sin(angle) * RADIUS;

    let color = THEME_COLORS[hashIndex(cat) % THEME_COLORS.length];
    while (usedColors.has(color)) {
      color = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
    }
    usedColors.add(color);

    const themeId = `t-${catIdx}`;
    nodes.push({
      id: themeId,
      type: 'theme',
      label: cat,
      category: cat,
      color,
      x: tx,
      y: ty,
    });

    catWords.forEach((word, wi) => {
      const t = (wi / Math.max(1, catWords.length - 1)) - 0.5;
      const wa = angle + t * ARC_ANGLE;
      const d = ARC_DIST + (wi % 3) * 12;
      nodes.push({
        id: word.id,
        type: 'word',
        label: word.arabic,
        word,
        category: cat,
        color,
        x: tx + Math.cos(wa) * d,
        y: ty + Math.sin(wa) * d,
      });
      links.push({ source: themeId, target: word.id });
    });
  });

  // Center all nodes
  const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
  const cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
  for (const n of nodes) { n.x -= cx; n.y -= cy; }

  return {
    nodes,
    links,
    studiedCount: studiedWords.length,
    totalWords: words.length,
  };
}
