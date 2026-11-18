import React from 'react';

interface AnimatedLogoProps {
  onOpenGapModal?: () => void;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onOpenGapModal }) => {
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
      title="Mind the Gap - Municipal Spatial Equity Analysis"
    >
      <div className="brand-mark" aria-hidden="true">
        <span className="brand-datum">+</span>
      </div>
      <div className="brand-text">
        <span className="brand-title">Mind the Gap</span>
        <span className="brand-subtitle">Pune Metropolitan Spatial Equity</span>
      </div>
    </div>
  );
};
