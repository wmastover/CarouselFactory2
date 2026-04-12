import { useState } from 'react';
import { setApiKey, getApiKey } from '../lib/apiKey.js';

export default function ApiKeyModal({ onClose }) {
  const [value, setValue] = useState(getApiKey);
  const [visible, setVisible] = useState(false);

  function handleSave() {
    setApiKey(value);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div className="ep-backdrop" onClick={onClose}>
      <div
        className="ak-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ep-header">
          <span className="ep-title">OpenRouter API Key</span>
          <button className="ep-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ak-body">
          <p className="ak-description">
            This app calls{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noreferrer">
              OpenRouter
            </a>{' '}
            directly from your browser. Your key is stored only in this browser's localStorage and is never sent anywhere except OpenRouter.
          </p>

          <label className="ak-label" htmlFor="ak-input">
            API key
            <a
              className="ak-get-key"
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
            >
              Get a key ↗
            </a>
          </label>

          <div className="ak-input-row">
            <input
              id="ak-input"
              className="ak-input"
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="sk-or-..."
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <button
              className="ak-toggle"
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Hide key' : 'Show key'}
            >
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="ak-actions">
            <button className="ak-cancel" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="ak-save"
              type="button"
              onClick={handleSave}
              disabled={!value.trim()}
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
