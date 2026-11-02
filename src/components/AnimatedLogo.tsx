import React, { useState } from 'react';

interface AnimatedLogoProps {
  onOpenGapModal?: () => void;
}

// 5 shades of vibrant digital blue
const COLOR_MAP: Record<number, string> = {
  1: '#1d4ed8', // deep royal blue
  2: '#2563eb', // primary blue
  3: '#3b82f6', // electric sapphire
  4: '#60a5fa', // bright sky blue
  5: '#38bdf8', // radiant cyan-blue
};

// [col, row, colorCode, delayMs] - 6 columns (0..5) x 8 rows (0..7)
const PIXEL_DATA_LEFT: [number, number, number, number][] = [
  // Top corner horizontal bar
  [0, 0, 2, 0],
  [1, 0, 3, 40],
  [2, 0, 2, 80],
  [3, 0, 4, 120],
  [4, 0, 3, 160],
  [5, 0, 5, 200],
  // Top corner stepped drop
  [0, 1, 1, 40],
  [1, 1, 2, 80],
  [2, 1, 3, 120],
  [0, 2, 2, 80],
  [1, 2, 1, 120],
  // Center notch (stepped spur pointing toward text)
  [0, 3, 1, 120],
  [1, 3, 2, 160],
  [2, 3, 3, 200],
  [3, 3, 4, 240],
  [0, 4, 2, 160],
  [1, 4, 3, 200],
  [2, 4, 2, 240],
  [3, 4, 5, 280],
  // Bottom stepped rise
  [0, 5, 2, 200],
  [1, 5, 1, 240],
  [0, 6, 1, 240],
  [1, 6, 2, 280],
  [2, 6, 3, 320],
  // Bottom corner horizontal bar
  [0, 7, 2, 280],
  [1, 7, 3, 320],
  [2, 7, 2, 360],
  [3, 7, 4, 400],
  [4, 7, 3, 440],
  [5, 7, 5, 480],
  // Satellite floating pixels for retro-digital HUD aesthetic
  [4, 2, 4, 140],
  [4, 5, 4, 260],
];

// Exact horizontal mirror of left bracket
const PIXEL_DATA_RIGHT: [number, number, number, number][] = PIXEL_DATA_LEFT.map(
  ([col, row, colorCode, delayMs]) => [5 - col, row, colorCode, delayMs]
);

const PixelBracket: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const pixels = side === 'left' ? PIXEL_DATA_LEFT : PIXEL_DATA_RIGHT;

  return (
    <svg
      width="26"
      height="34"
      viewBox="0 0 26 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pixel-bracket pixel-bracket-${side}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {pixels.map(([col, row, colorCode, delayMs]) => (
        <rect
          key={`${col}-${row}`}
          x={col * 4.2}
          y={row * 4.2}
          width={3.2}
          height={3.2}
          fill={COLOR_MAP[colorCode]}
          className="pixel-block"
          style={{ '--pixel-delay': `${delayMs}ms` } as React.CSSProperties}
        />
      ))}
    </svg>
  );
};

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onOpenGapModal }) => {
  const [isClicking, setIsClicking] = useState(false);

  const text = 'MIND THE GAP';
  const chars = text.split('');

  const handleClick = () => {
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 700);
    if (onOpenGapModal) {
      setTimeout(() => onOpenGapModal(), 300);
    }
  };

  return (
    <div
      className={`logo-container ${isClicking ? 'logo-clicking' : ''}`}
      onClick={handleClick}
      title="MIND THE GAP - Hover to animate, click for Urban Gap Analysis"
    >
      {/* Blue Pixelated Left Corner Bracket */}
      <PixelBracket side="left" />

      {/* Pure Typography: Solid One Color with Style, Animates ONLY on Hover (No background box) */}
      <div className="jumping-text">
        {chars.map((char, index) => {
          if (char === ' ') {
            return (
              <span key={index} className="jumping-text__space">
                &nbsp;
              </span>
            );
          }

          return (
            <span
              key={index}
              className="jumping-text__char"
              style={{ '--char-index': index } as React.CSSProperties}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Blue Pixelated Right Corner Bracket */}
      <PixelBracket side="right" />
    </div>
  );
};
