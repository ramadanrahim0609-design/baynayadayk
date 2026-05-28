import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Mic, Check, X, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { words } from '../data/dictionary';
import styles from './SpeechPage.module.css';

export function SpeechPage() {
  const navigate = useNavigate();
  const { studySessions, markWordKnown, markWordUnknown, addXP } = useAppStore();
  const [currentWord, setCurrentWord] = useState(() => {
    const dueWords = studySessions
      .filter(s => s.status === 'unknown' || s.status === 'reviewing')
      .map(s => words.find(w => w.id === s.wordId))
      .filter(Boolean) as typeof words;
    if (dueWords.length > 0) return dueWords[Math.floor(Math.random() * dueWords.length)];
    return words[Math.floor(Math.random() * words.length)];
  });
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef<any>(null);

  const playAudio = useCallback((slow: boolean = false) => {
    if (isPlaying) return;
    setIsPlaying(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = slow ? 0.3 : 0.7;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [currentWord, isPlaying]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Распознавание речи не поддерживается в вашем браузере');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const similarity = calculateSimilarity(text, currentWord.arabic);
      if (similarity > 0.5) {
        setResult('correct');
        markWordKnown(currentWord.id);
        addXP(20);
      } else {
        setResult('incorrect');
        markWordUnknown(currentWord.id);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setResult('incorrect');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [currentWord, markWordKnown, markWordUnknown, addXP]);

  const nextWord = useCallback(() => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setResult(null);
    setTranscript('');
  }, []);

  if (typeof (window as any).SpeechRecognition === 'undefined' && typeof (window as any).webkitSpeechRecognition === 'undefined') {
    return (
      <div className={styles.page}>
        <Header showBack title="Произношение" />
        <main className={styles.main}>
          <Card padding="lg" className={styles.notSupported}>
            <p>Распознавание речи не поддерживается в вашем браузере.</p>
            <p>Пожалуйста, используйте Chrome или Safari.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header showBack title="Произношение" />

      <main className={styles.main}>
        <motion.div
          className={styles.wordCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentWord.id}
        >
          <Card padding="lg" className={styles.wordDisplay}>
            <div className={styles.arabicText}>{currentWord.arabic}</div>
            <div className={styles.translation}>{currentWord.translation}</div>

            <div className={styles.audioRow}>
              <motion.button
                className={styles.audioBtn}
                onClick={() => playAudio(false)}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 size={20} />
                Обычно
              </motion.button>
              <motion.button
                className={styles.audioBtn}
                onClick={() => playAudio(true)}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 size={16} />
                Медленно
              </motion.button>
            </div>
          </Card>

          <div className={styles.micSection}>
            <motion.button
              className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
              onClick={startListening}
              disabled={isListening}
              whileTap={{ scale: 0.9 }}
              animate={isListening ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
            >
              <Mic size={36} />
            </motion.button>
            <p className={styles.micHint}>
              {isListening ? 'Слушаю...' : 'Нажми и произнеси слово'}
            </p>
          </div>

          <AnimatePresence>
            {transcript && (
              <motion.div
                className={styles.transcriptBox}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className={styles.transcriptLabel}>Распознано:</span>
                <span className={styles.transcriptText}>{transcript}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div
                className={`${styles.resultCard} ${result === 'correct' ? styles.resultCorrect : styles.resultWrong}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {result === 'correct' ? (
                  <>
                    <Check size={24} />
                    <span>Отлично! Произношение правильное</span>
                  </>
                ) : (
                  <>
                    <X size={24} />
                    <span>Попробуй ещё раз</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {result && (
            <Button
              fullWidth
              size="lg"
              onClick={nextWord}
              icon={<RefreshCw size={18} />}
            >
              Следующее слово
            </Button>
          )}
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}

function calculateSimilarity(text1: string, text2: string): number {
  const s1 = text1.toLowerCase().replace(/[^a-z\u0600-\u06FF]/g, '');
  const s2 = text2.toLowerCase().replace(/[^a-z\u0600-\u06FF]/g, '');
  let matches = 0;
  const len = Math.max(s1.length, s2.length);
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  return len > 0 ? matches / len : 0;
}
