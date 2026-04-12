import { KeyRound } from 'lucide-react';
import entriesLogo from '../assets/entries-logo.png';

export default function Header({ onBack, onOpenApiKey }) {
  return (
    <header className="header">
      <div style={{ width: 28, display: 'flex', alignItems: 'center' }}>
        {onBack && (
          <button className="header-back" onClick={onBack} aria-label="Back">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M9 1L1 8.5L9 16" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      <div className="header-title">
        <img src={entriesLogo} alt="Entries" className="header-logo" />
      </div>
      <div className={`header-right${onOpenApiKey ? ' header-right-with-actions' : ''}`}>
        {onOpenApiKey && (
          <button
            type="button"
            className="header-api-key-btn"
            onClick={onOpenApiKey}
            aria-label="OpenRouter API key"
          >
            <KeyRound size={18} strokeWidth={2} aria-hidden />
          </button>
        )}
        <span className="header-notebook">{'\u{1F4D9}'}</span>
      </div>
    </header>
  );
}
