import entriesLogo from '../assets/entries-logo.png';

export default function Header({ onBack }) {
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
      <div className="header-right">
        <span className="header-notebook">📙</span>
      </div>
    </header>
  );
}
