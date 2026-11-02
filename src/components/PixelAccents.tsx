import React from 'react';

// 5-Tone Digital Blue Palette
const BLUES: Record<number, string> = {
  1: '#1d4ed8', // deep royal blue
  2: '#2563eb', // primary blue
  3: '#3b82f6', // electric sapphire
  4: '#60a5fa', // bright sky blue
  5: '#38bdf8', // radiant cyan
};

// ============================================================
// 1. EXTREME CORNER PIXEL CLUSTERS FOR NAVBAR
// ============================================================

// [col, row, colorCode, opacity]
const CORNER_PIXELS_TOP_LEFT: [number, number, number, number][] = [
  // Outer corner solid anchor (col: 0..14, row: 0..8)
  [0, 0, 2, 0.95], [1, 0, 3, 0.95], [2, 0, 2, 0.9], [3, 0, 4, 0.85], [4, 0, 3, 0.8], [5, 0, 2, 0.75], [6, 0, 4, 0.7], [7, 0, 3, 0.65], [8, 0, 5, 0.6], [9, 0, 2, 0.55], [10, 0, 4, 0.5], [11, 0, 3, 0.45], [12, 0, 5, 0.4], [13, 0, 2, 0.35], [14, 0, 4, 0.3],
  [0, 1, 1, 0.95], [1, 1, 2, 0.9],  [2, 1, 3, 0.85], [3, 1, 2, 0.8],  [4, 1, 4, 0.75], [5, 1, 3, 0.7],  [6, 1, 2, 0.65], [7, 1, 5, 0.55], [8, 1, 3, 0.5],  [9, 1, 4, 0.4],  [10, 1, 2, 0.35], [11, 1, 5, 0.3],
  [0, 2, 2, 0.9],  [1, 2, 3, 0.85], [2, 2, 1, 0.8],  [3, 2, 4, 0.75], [4, 2, 2, 0.65], [5, 2, 5, 0.55], [6, 2, 3, 0.5],  [7, 2, 4, 0.4],  [8, 2, 2, 0.35], [9, 2, 5, 0.3],
  [0, 3, 1, 0.85], [1, 3, 2, 0.8],  [2, 3, 3, 0.7],  [3, 3, 2, 0.6],  [4, 3, 5, 0.5],  [5, 3, 3, 0.4],  [6, 3, 4, 0.35], [7, 3, 2, 0.3],
  [0, 4, 2, 0.8],  [1, 4, 4, 0.7],  [2, 4, 2, 0.6],  [3, 4, 3, 0.5],  [4, 4, 4, 0.4],  [5, 4, 1, 0.35], [6, 4, 5, 0.3],
  [0, 5, 3, 0.75], [1, 5, 1, 0.65], [2, 5, 4, 0.55], [3, 5, 5, 0.45], [4, 5, 3, 0.35],
  [0, 6, 2, 0.7],  [1, 6, 3, 0.55], [2, 6, 2, 0.45], [3, 6, 4, 0.35],
  [0, 7, 4, 0.6],  [1, 7, 2, 0.45], [2, 7, 5, 0.35],
  [0, 8, 2, 0.5],  [1, 8, 3, 0.35],
  // Floating satellite pixels for digital dissolve effect
  [4, 6, 5, 0.4], [6, 5, 4, 0.35], [8, 3, 3, 0.35], [10, 2, 5, 0.35], [12, 1, 4, 0.3], [15, 0, 3, 0.25],
  [2, 9, 4, 0.35], [1, 10, 2, 0.3], [3, 8, 5, 0.3],
];

// Bottom corner pixels (anchored along the lower border of navbar)
const CORNER_PIXELS_BOTTOM_LEFT: [number, number, number, number][] = [
  [0, 4, 2, 0.9], [1, 4, 3, 0.9], [2, 4, 2, 0.85], [3, 4, 4, 0.8], [4, 4, 3, 0.7], [5, 4, 2, 0.6], [6, 4, 4, 0.5], [7, 4, 5, 0.4], [8, 4, 3, 0.35],
  [0, 3, 1, 0.85], [1, 3, 2, 0.8], [2, 3, 3, 0.7],  [3, 3, 2, 0.6], [4, 3, 5, 0.5], [5, 3, 4, 0.35],
  [0, 2, 2, 0.75], [1, 2, 3, 0.65], [2, 2, 1, 0.55], [3, 2, 4, 0.4],
  [0, 1, 3, 0.65], [1, 1, 4, 0.5],
  [0, 0, 4, 0.5],
  // Satellite floating pixels
  [4, 2, 5, 0.35], [6, 3, 3, 0.3], [9, 4, 4, 0.25],
];

interface NavCornerPixelsProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const NavCornerPixels: React.FC<NavCornerPixelsProps> = ({ position }) => {
  const isTop = position.startsWith('top');
  const isRight = position.endsWith('right');
  const rawPixels = isTop ? CORNER_PIXELS_TOP_LEFT : CORNER_PIXELS_BOTTOM_LEFT;

  const width = isTop ? 95 : 60;
  const height = isTop ? 65 : 32;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`nav-corner-pixels nav-corner-${position}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: isTop ? 0 : 'auto',
        bottom: !isTop ? 0 : 'auto',
        left: !isRight ? 0 : 'auto',
        right: isRight ? 0 : 'auto',
        pointerEvents: 'none',
        zIndex: 0,
        transform: `${isRight ? 'scaleX(-1)' : ''} ${!isTop ? 'scaleY(-1)' : ''}`.trim() || undefined,
      }}
    >
      {rawPixels.map(([col, row, colorCode, opacity]) => (
        <rect
          key={`${col}-${row}`}
          x={col * 5.5 + 2}
          y={row * 5.5 + 2}
          width={3.8}
          height={3.8}
          fill={BLUES[colorCode]}
          opacity={opacity}
          className="corner-pixel-block"
        />
      ))}
    </svg>
  );
};

// ============================================================
// 2. PIXELATED SIDE WINGS FOR "MIND THE GAP" ROW
// Flows from MIND THE GAP out to the extreme edges of the row
// ============================================================

// Pixel blocks along the horizontal wing (x: 0..300, y: 0..24)
// Coordinates in a 300x24 space
const WING_PIXELS: [number, number, number, number, number][] = [
  // [x, y, w, h, colorCode]
  // Dense stepped cluster near center (x: 270..300)
  [294, 2, 4, 4, 3],
  [288, 2, 4, 4, 2],
  [282, 2, 4, 4, 4],
  [276, 2, 4, 4, 1],
  [294, 8, 4, 4, 2],
  [288, 8, 4, 4, 5],
  [282, 8, 4, 4, 2],
  [294, 14, 4, 4, 4],
  [288, 14, 4, 4, 3],
  [282, 14, 4, 4, 1],
  [294, 20, 4, 4, 2],
  [288, 20, 4, 4, 4],
  [282, 20, 4, 4, 3],
  [276, 20, 4, 4, 2],

  // Stepped mid cluster (x: 230..270)
  [268, 6, 5, 4, 2],
  [260, 6, 5, 4, 3],
  [252, 6, 5, 4, 5],
  [268, 16, 5, 4, 3],
  [260, 16, 5, 4, 4],
  [252, 16, 5, 4, 2],
  [244, 10, 5, 5, 4],
  [236, 10, 5, 5, 2],

  // Digital frequency line (x: 180..230)
  [226, 11, 6, 4, 3],
  [218, 5, 4, 4, 4],
  [218, 11, 4, 4, 2],
  [218, 17, 4, 4, 5],
  [210, 11, 5, 4, 1],
  [202, 11, 5, 4, 3],
  [194, 7, 4, 4, 4],
  [194, 15, 4, 4, 2],
  [186, 11, 5, 4, 5],

  // Mid scatter pulse (x: 130..180)
  [176, 11, 6, 4, 2],
  [168, 8, 4, 4, 3],
  [168, 14, 4, 4, 4],
  [160, 11, 5, 4, 2],
  [152, 11, 5, 4, 1],
  [144, 5, 4, 4, 5],
  [144, 17, 4, 4, 3],
  [136, 11, 5, 4, 4],

  // Dissolving digital trail towards extreme corner (x: 0..130)
  [126, 11, 6, 4, 2],
  [116, 11, 5, 4, 3],
  [106, 9, 4, 4, 4],
  [96, 11, 5, 4, 1],
  [86, 11, 5, 4, 5],
  [76, 11, 5, 4, 2],
  [64, 7, 4, 4, 4],
  [64, 15, 4, 4, 3],
  [52, 11, 5, 4, 2],
  [40, 11, 4, 4, 4],
  [28, 11, 4, 4, 5],
  [16, 11, 4, 4, 3],
  [4, 11, 4, 4, 2],
];

interface PixelRowWingProps {
  side: 'left' | 'right';
}

export const PixelRowWing: React.FC<PixelRowWingProps> = ({ side }) => {
  const isLeft = side === 'left';

  return (
    <div
      className={`pixel-row-wing pixel-wing-${side}`}
      style={{
        flex: 1,
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isLeft ? 'flex-end' : 'flex-start',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.85,
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="24"
        viewBox="0 0 300 24"
        preserveAspectRatio={isLeft ? 'xMaxYMid meet' : 'xMinYMid meet'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{
          transform: !isLeft ? 'scaleX(-1)' : undefined,
          maxWidth: '420px',
        }}
      >
        {WING_PIXELS.map(([x, y, w, h, colorCode], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={BLUES[colorCode]}
            className="wing-pixel-block"
            style={{
              opacity: x > 250 ? 0.95 : x > 150 ? 0.8 : x > 70 ? 0.6 : 0.45,
            }}
          />
        ))}
      </svg>
    </div>
  );
};
