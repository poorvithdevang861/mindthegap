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
        <h1 className={`brand-title-cherry ${hasAnimated ? 'bounce-in' : ''}`}>
          Mind The Gap
        </h1>
        <span className="brand-subtitle">Pune Metropolitan Spatial Equity</span>
      </div>
    </div>
  );
};
