import React, { useState } from 'react';

interface AnimatedLogoProps {
  onOpenGapModal?: () => void;
}

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
      {/* Pure Typography: Solid One Color with Style, Animates ONLY on Hover */}
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
    </div>
  );
};
