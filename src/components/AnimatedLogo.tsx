import React from 'react';

interface AnimatedLogoProps {
  onOpenGapModal?: () => void;
}

interface LetterDef {
  char: string;
  file: string;
  globalIndex: number;
}

const WORD_1: LetterDef[] = [
  { char: 'M', file: 'letter_0_M.png', globalIndex: 0 },
  { char: 'i', file: 'letter_1_i.png', globalIndex: 1 },
  { char: 'n', file: 'letter_2_n.png', globalIndex: 2 },
  { char: 'd', file: 'letter_3_d.png', globalIndex: 3 },
];

const WORD_2: LetterDef[] = [
  { char: 'T', file: 'letter_4_T.png', globalIndex: 4 },
  { char: 'h', file: 'letter_5_h.png', globalIndex: 5 },
  { char: 'e', file: 'letter_6_e.png', globalIndex: 6 },
];

const WORD_3: LetterDef[] = [
  { char: 'G', file: 'letter_7_G.png', globalIndex: 7 },
  { char: 'a', file: 'letter_8_a.png', globalIndex: 8 },
  { char: 'p', file: 'letter_9_p.png', globalIndex: 9 },
];

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onOpenGapModal }) => {
  const base = import.meta.env.BASE_URL;

  const renderWord = (letters: LetterDef[], wordKey: string) => (
    <span className="jumpy-word" key={wordKey}>
      {letters.map((l) => (
        <span
          key={l.file}
          className="jumpy-letter-box"
          style={{
            animationDelay: `${l.globalIndex * 0.08}s`,
            ['--letter-idx' as any]: l.globalIndex,
          }}
          title={l.char}
        >
          <img
            src={`${base}letters/${l.file}`}
            alt={l.char}
            className="jumpy-letter-img"
            draggable={false}
          />
        </span>
      ))}
    </span>
  );

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

      <div className="brand-text">
        {/* Animated Jumpy Logo Letters */}
        <div className="jumpy-title-container" aria-hidden="true">
          {renderWord(WORD_1, 'mind')}
          {renderWord(WORD_2, 'the')}
          {renderWord(WORD_3, 'gap')}
        </div>
        <span className="sr-only">Mind the Gap</span>
        <span className="brand-subtitle">Pune Metropolitan Spatial Equity</span>
      </div>
    </div>
  );
};
