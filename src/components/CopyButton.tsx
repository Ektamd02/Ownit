import { useState } from 'react';
import { Button } from './Button';

export function CopyButton({ text, label = 'Copy', what }: { text: string; label?: string; what: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      // Fallback for browsers that block the async clipboard API.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      setState(ok ? 'copied' : 'failed');
    }
    window.setTimeout(() => setState('idle'), 2200);
  };
  return (
    <>
      <Button size="sm" icon={state === 'copied' ? 'check' : 'copy'} onClick={copy} disabled={!text.trim()} aria-label={`${label} ${what}`}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Couldn’t copy' : label}
      </Button>
      <span className="sr-only" aria-live="polite">{state === 'copied' ? `${what} copied to clipboard` : state === 'failed' ? `Couldn’t copy ${what}. Select the text and copy it manually.` : ''}</span>
    </>
  );
}
