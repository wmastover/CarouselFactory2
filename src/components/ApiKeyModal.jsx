import { useState, useRef, useEffect } from 'react';
import { KeyRound, ExternalLink } from 'lucide-react';
import { LS_OPENROUTER_API_KEY, getOpenRouterApiKey } from '../lib/openrouterKey';

export default function ApiKeyModal({ open, onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(localStorage.getItem(LS_OPENROUTER_API_KEY) || '');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  if (!open) return null;

  const hasEnvKey = !!(import.meta.env.VITE_OPENROUTER_API_KEY?.trim());
  const currentKey = getOpenRouterApiKey();
  const isUsingEnv = hasEnvKey && !localStorage.getItem(LS_OPENROUTER_API_KEY)?.trim();

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(LS_OPENROUTER_API_KEY, trimmed);
    } else {
      localStorage.removeItem(LS_OPENROUTER_API_KEY);
    }
    onClose();
  }

  function handleClear() {
    localStorage.removeItem(LS_OPENROUTER_API_KEY);
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div className="ak-backdrop" onClick={onClose}>
      <div className="ak-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ak-header">
          <div className="ak-header-left">
            <KeyRound size={16} strokeWidth={2.2} />
            <span className="ak-title">OpenRouter API Key</span>
          </div>
          <button className="ak-close" onClick={onClose}>✕</button>
        </div>

        <div className="ak-body">
          <p className="ak-description">
            Enter your <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">OpenRouter API key<ExternalLink size={12} style={{ marginLeft: 3, verticalAlign: 'middle' }} /></a> to
            power image and text generation. Your key is stored locally in your browser.
          </p>

          <input
            ref={inputRef}
            type="password"
            className="ak-input"
            placeholder="sk-or-v1-..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
          />

          {isUsingEnv && (
            <p className="ak-hint">Currently using key from environment variable. Enter a key here to override it.</p>
          )}
          {!currentKey && !hasEnvKey && (
            <p className="ak-hint ak-hint-warn">No API key set. Generation will not work until you add one.</p>
          )}
        </div>

        <div className="ak-footer">
          {localStorage.getItem(LS_OPENROUTER_API_KEY)?.trim() && (
            <button className="ak-clear-btn" onClick={handleClear}>Clear saved key</button>
          )}
          <div style={{ flex: 1 }} />
          <button className="ak-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="ak-save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
