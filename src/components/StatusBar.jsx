import { useState, useEffect } from 'react';

function getTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function StatusBar() {
  const [time, setTime] = useState(getTime);

  useEffect(() => {
    const tick = () => setTime(getTime());
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
    const initial = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60000);
      return () => clearInterval(interval);
    }, msUntilNextMinute);
    return () => clearTimeout(initial);
  }, []);

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span className="status-bar-time">{time}</span>
        {/* Mute / bell-slash — lives next to the time on the left */}
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
          <path
            d="M1 1l11 12M6.5 1.5C4.567 1.5 3 3.067 3 5v3.5L1.5 10h10L10 8.5V5c0-1.933-1.567-3.5-3.5-3.5zM5.5 10.5a1 1 0 002 0"
            stroke="#1a1a1a"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="status-bar-icons">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#1a1a1a"/>
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" fill="#1a1a1a"/>
          <rect x="9" y="3" width="3" height="9" rx="0.5" fill="#1a1a1a"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1a1a1a" opacity="0.3"/>
        </svg>

        {/* Wi-Fi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fill="#1a1a1a"/>
          <path d="M4.5 7.25A4.97 4.97 0 018 6c1.38 0 2.63.56 3.5 1.25" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M1.5 4.5A8.44 8.44 0 018 2c2.49 0 4.73 1.07 6.3 2.77" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>

        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#1a1a1a" strokeOpacity="0.35"/>
          <rect x="2" y="2" width="16" height="8" rx="2" fill="#1a1a1a"/>
          <path d="M23 4v4a2 2 0 000-4z" fill="#1a1a1a" fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}
