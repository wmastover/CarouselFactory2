import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from './ui/button';
import { LS_OPENROUTER_API_KEY } from '../lib/openrouterKey';

function ApiKeyModalContent({ onClose }) {
  const [draft, setDraft] = useState(() => localStorage.getItem(LS_OPENROUTER_API_KEY) || '');

  function handleSubmit(e) {
    e.preventDefault();
    const t = draft.trim();
    if (t) {
      localStorage.setItem(LS_OPENROUTER_API_KEY, t);
    } else {
      localStorage.removeItem(LS_OPENROUTER_API_KEY);
    }
    onClose();
  }

  return (
    <div className="ep-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-panel api-key-panel" role="dialog" aria-labelledby="api-key-title" aria-modal="true">
        <div className="ep-header">
          <h2 id="api-key-title" className="ep-title flex items-center gap-2">
            <KeyRound className="shrink-0" size={18} strokeWidth={2} aria-hidden />
            OpenRouter API key
          </h2>
          <button type="button" className="ep-close" onClick={onClose} aria-label="Close">
            {'\u2715'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="ep-body">
            <p className="text-[13px] text-[#555] leading-relaxed">
              Your key is stored only in this browser (localStorage). Get a key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a1a1a] underline underline-offset-2 font-medium"
              >
                openrouter.ai/keys
              </a>
              .
            </p>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-[#1a1a1a]">API key</span>
              <input
                className="ep-overlay-input font-mono text-[13px]"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="sk-or-…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </label>
          </div>

          <div className="ep-footer api-key-footer">
            <Button type="submit" size="default">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApiKeyModal({ open, onClose, contentKey = 0 }) {
  if (!open) return null;
  return <ApiKeyModalContent key={contentKey} onClose={onClose} />;
}
