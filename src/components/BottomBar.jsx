export default function BottomBar({ onGoDeeper, isLoading }) {
  return (
    <div className="bottom-bar">
      <div className="bottom-bar-icons">
        <button className="icon-btn" aria-label="Voice input">
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
            <rect x="3.5" y="1" width="7" height="12" rx="3.5" stroke="#888" strokeWidth="1.5"/>
            <path d="M1 11c0 3.314 2.686 6 6 6s6-2.686 6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 17v4" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <button
        className="go-deeper-btn"
        onClick={onGoDeeper}
        disabled={isLoading}
      >
        {isLoading ? 'Thinking…' : 'Go Deeper'}
      </button>
    </div>
  );
}
