export default function IOSKeyboard() {
  const row1 = ['Q','W','E','R','T','Y','U','I','O','P'];
  const row2 = ['A','S','D','F','G','H','J','K','L'];
  const row3 = ['Z','X','C','V','B','N','M'];

  return (
    <div className="ios-keyboard no-screenshot">
      <div className="ios-kb-quicktype">
        <span className="ios-qt-word">Well</span>
        <span className="ios-qt-sep" />
        <span className="ios-qt-word">I</span>
        <span className="ios-qt-sep" />
        <span className="ios-qt-word">think</span>
      </div>
      <div className="ios-kb-rows">
        <div className="ios-kb-row">
          {row1.map(k => <span key={k} className="ios-kb-key">{k}</span>)}
        </div>
        <div className="ios-kb-row">
          {row2.map(k => <span key={k} className="ios-kb-key">{k}</span>)}
        </div>
        <div className="ios-kb-row">
          <span className="ios-kb-key ios-kb-key-fn ios-kb-key-wide">
            <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
              <path d="M1 4.5L5.5 9L8.5 6L12 9.5L16 1" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {row3.map(k => <span key={k} className="ios-kb-key">{k}</span>)}
          <span className="ios-kb-key ios-kb-key-fn ios-kb-key-wide">
            <svg width="17" height="13" viewBox="0 0 20 14" fill="none">
              <path d="M8 1H17C18.1 1 19 1.9 19 3V11C19 12.1 18.1 13 17 13H8L1 7L8 1Z" stroke="#1a1a1a" strokeWidth="1.5"/>
              <path d="M12 5L8.5 9M8.5 5L12 9" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        <div className="ios-kb-row ios-kb-row-bottom">
          <span className="ios-kb-key ios-kb-key-fn ios-kb-key-num">123</span>
          <span className="ios-kb-key ios-kb-key-fn ios-kb-key-globe">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke="#1a1a1a" strokeWidth="1.5"/>
              <ellipse cx="12" cy="12" rx="3.8" ry="9.5" stroke="#1a1a1a" strokeWidth="1.5"/>
              <path d="M2.5 12h19M4 7.5h16M4 16.5h16" stroke="#1a1a1a" strokeWidth="1.3"/>
            </svg>
          </span>
          <span className="ios-kb-key ios-kb-key-space">space</span>
          <span className="ios-kb-key ios-kb-key-fn ios-kb-key-return">return</span>
        </div>
      </div>
    </div>
  );
}
