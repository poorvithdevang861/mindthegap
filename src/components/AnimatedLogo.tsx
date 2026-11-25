import React, { useState, useEffect, useRef } from 'react';

interface AnimatedLogoProps {
  onOpenGapModal?: () => void;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onOpenGapModal }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger whole-word bounce animation once when hero enters viewport
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="brand-lockup"
      ref={containerRef}
      onClick={onOpenGapModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenGapModal?.();
        }
      }}
      title="Mind The Gap - Municipal Spatial Equity (Click to open analysis)"
      aria-label="Mind The Gap - Pune Metropolitan Spatial Equity"
    >
      <div className="brand-mark" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}train_logo.png`}
          alt="Mind The Gap Transit Train Icon"
          className="brand-train-icon"
          width="28"
          height="28"
        />
      </div>

      <div className="brand-text">
        <h1 className={`brand-title-cherry ${hasAnimated ? 'bounce-in' : ''}`}>
          Mind The Gap
        </h1>
        <span className="brand-subtitle">Pune Metropolitan Spatial Equity</span>
      </div>
    </div>
  );
};
