/**
 * Voice dictation using the browser's built-in Web Speech API.
 *
 * Support varies: Chrome, Edge and Safari support it; Firefox does not.
 * Note: some browsers (e.g. Chrome) send audio to their own speech service to
 * transcribe it. We tell people this before they start. Ownit never receives the audio.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type DictationState = 'idle' | 'listening' | 'error';

export function dictationSupported() {
  return getCtor() !== null && typeof window !== 'undefined' && window.isSecureContext;
}

export function useDictation(onFinalText: (text: string) => void) {
  const [state, setState] = useState<DictationState>('idle');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const cbRef = useRef(onFinalText);
  cbRef.current = onFinalText;

  useEffect(() => () => recRef.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setState('error');
      setError('Voice input isn’t available in this browser. Try Chrome, Edge or Safari — or just type.');
      return;
    }
    if (!window.isSecureContext) {
      setState('error');
      setError('Voice input needs a secure (https) connection. You can still type your answer.');
      return;
    }
    setError('');
    const rec = new Ctor();
    rec.lang = navigator.language || 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) cbRef.current(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access was blocked. Allow it in your browser’s site settings, or type instead.',
        'service-not-allowed': 'Microphone access was blocked. Allow it in your browser’s site settings, or type instead.',
        'no-speech': 'We didn’t hear anything. Try again, a little closer to the mic.',
        'audio-capture': 'No microphone was found. Check it’s connected, or type instead.',
        network: 'Voice input needs an internet connection in this browser. You can type instead.',
      };
      if (e.error === 'aborted') return;
      setError(messages[e.error] ?? 'Voice input stopped unexpectedly. You can try again or type.');
      setState('error');
    };
    rec.onend = () => {
      setInterim('');
      setState((s) => (s === 'listening' ? 'idle' : s));
      recRef.current = null;
    };
    try {
      rec.start();
      recRef.current = rec;
      setState('listening');
    } catch {
      setState('error');
      setError('Voice input couldn’t start. You can try again or type.');
    }
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setState('idle');
  }, []);

  return { supported: dictationSupported(), state, interim, error, start, stop, clearError: () => setError('') };
}
