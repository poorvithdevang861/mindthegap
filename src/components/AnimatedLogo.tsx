import React, { useState, useCallback } from 'react';

interface AnimatedLogoProps {
  onOpenGapModal?: () => void;
}

interface LetterItem {
  char: string;
  idx: number;
}

const WORDS: { word: string; letters: LetterItem[] }[] = [
  {
    word: 'Mind',
    letters: [
      { char: 'M', idx: 0 },
      { char: 'i', idx: 1 },
      { char: 'n', idx: 2 },
      { char: 'd', idx: 3 },
    ],
  },
  {
    word: 'The',
    letters: [
      { char: 'T', idx: 4 },
      { char: 'h', idx: 5 },
      { char: 'e', idx: 6 },
    ],
  },
  {
    word: 'Gap',
    letters: [
      { char: 'G', idx: 7 },
      { char: 'a', idx: 8 },
      { char: 'p', idx: 9 },
    ],
  },
];

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onOpenGapModal }) => {
  const [isJumping, setIsJumping] = useState(false);

  // Trigger jump cascade whenever user touches or hovers the text
  const handleTouchOrHover = useCallback(() => {
    setIsJumping(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsJumping(true);
      });
    });
  }, []);

  return (
    <div
      className="brand-lockup"
      onClick={onOpenGapModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenGapModal?.();
        }
      }}
      title="Mind the Gap - Municipal Spatial Equity (Click to open analysis)"
      aria-label="Mind the Gap - Pune Metropolitan Spatial Equity"
    >
      <div className="brand-mark" aria-hidden="true">
        {/* Unified Transit-Ward GIS Emblem */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-emblem-svg"
        >
          {/* Ward Administrative GIS Boundary Polygon */}
          <path
            d="M16 2.5L29 8V24L16 29.5L3 24V8L16 2.5Z"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Ward Internal Sector Partition Line */}
          <path
            d="M3 16C8 18 13 14 18 16C23 18 26 17 29 16"
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Metro Rail Corridor & Train */}
          <g transform="translate(4, 5)">
            <line x1="2" y1="16" x2="16" y2="2" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <rect x="2" y="2" width="9" height="11" rx="2" fill="#7c3aed" />
            <rect x="3.5" y="3.5" width="6" height="3" rx="0.5" fill="#ffffff" />
            <circle cx="4.5" cy="9.5" r="0.8" fill="#ffffff" />
            <circle cx="8.5" cy="9.5" r="0.8" fill="#ffffff" />
          </g>

          {/* Transit Bridge Connector */}
          <path d="M15 13L18 16" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />

          {/* Bus Transit Vehicle */}
          <g transform="translate(16, 14)">
            <rect x="0" y="0" width="10" height="11" rx="2" fill="#1d4ed8" />
            <rect x="1.5" y="1.5" width="7" height="3.5" rx="0.5" fill="#ffffff" />
            <circle cx="2.5" cy="8" r="0.8" fill="#ffffff" />
            <circle cx="7.5" cy="8" r="0.8" fill="#ffffff" />
            <rect x="1" y="10.5" width="1.5" height="1" rx="0.3" fill="#0f172a" />
            <rect x="7.5" y="10.5" width="1.5" height="1" rx="0.3" fill="#0f172a" />
          </g>

          {/* Central Transfer Interchange Station Hub */}
          <circle cx="16" cy="15.5" r="2.2" fill="#ffffff" stroke="#059669" strokeWidth="1.5" />
        </svg>
      </div>

      <div
        className="brand-text"
        onMouseEnter={handleTouchOrHover}
        onTouchStart={handleTouchOrHover}
      >
        {/* 100% Vector-Sharp Interactive Jumpy Title */}
        <div className="brand-title-letters" aria-hidden="true">
          {WORDS.map((w, wIdx) => (
            <span key={w.word} className="brand-word">
              {w.letters.map((l) => (
                <span
                  key={l.idx}
                  className={`brand-letter ${isJumping ? 'jumping' : ''}`}
                  style={{
                    ['--letter-idx' as any]: l.idx,
                  }}
                  onAnimationEnd={l.idx === 9 ? () => setIsJumping(false) : undefined}
                >
                  {l.char}
                </span>
              ))}
              {wIdx < WORDS.length - 1 && <span className="word-spacer" />}
            </span>
          ))}
        </div>
        <span className="sr-only">Mind the Gap</span>
        <span className="brand-subtitle">Pune Metropolitan Spatial Equity</span>
      </div>
    </div>
  );
};
