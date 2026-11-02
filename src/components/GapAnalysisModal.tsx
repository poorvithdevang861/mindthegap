import React from 'react';
import { X, Bus, TrendingUp, ArrowRight } from 'lucide-react';
import type { WardMeta } from '../types';

interface GapAnalysisModalProps {
  wards: WardMeta[];
  onClose: () => void;
  onSelectWard: (ward: WardMeta) => void;
}

export const GapAnalysisModal: React.FC<GapAnalysisModalProps> = ({
  wards,
  onClose,
  onSelectWard,
}) => {
  // 1. Transit Gap: Wards with lowest bus stops per 10k residents
  const transitDeficitWards = [...wards]
    .filter((w) => w.censusPop2026 > 25000)
    .sort((a, b) => {
      const rateA = a.busStopsCount / (a.censusPop2026 / 10000);
      const rateB = b.busStopsCount / (b.censusPop2026 / 10000);
      return rateA - rateB;
    })
    .slice(0, 4);

  // 2. High Growth Wards (Projected Growth: 2020 WorldPop to 2026 Census)
  const topGrowthWards = [...wards]
    .filter((w) => w.worldPop2020 > 0 && w.censusPop2026 > 0)
    .map((w) => ({
      ...w,
      growthNumber: Math.round(((w.censusPop2026 - w.worldPop2020) / w.worldPop2020) * 100),
    }))
    .sort((a, b) => b.growthNumber - a.growthNumber)
    .slice(0, 4);

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ward-modal" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="gap-modal-badge">MIND THE GAP</div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Urban Equity & Spatial Gap Analysis
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Bridging infrastructure, public transit access, and municipal demographic growth across Pune Metropolitan Wards
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ background: '#ffffff', color: '#1e293b' }}>
          {/* Metaphor Cards Grid (2-Column Layout) */}
          <div className="gap-cards-grid gap-cards-grid-2col">
            {/* Card 1: Transit Disparity Gap */}
            <div className="gap-card">
              <div className="gap-card-header">
                <div className="gap-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Bus size={18} />
                </div>
                <div>
                  <div className="gap-card-title">Transit Accessibility Gap</div>
                  <div className="gap-card-subtitle">3,320 Bus Stops & 95 Metro Stations</div>
                </div>
              </div>
              <p className="gap-card-desc">
                Transit density is heavily clustered in central urban corridors. Rapidly expanding peripheral sectors exhibit first-mile/last-mile deficits relative to population.
              </p>
              <div className="gap-metrics-strip">
                <div>
                  <span className="metric-label">Central Stop Density</span>
                  <span className="metric-val" style={{ color: '#2563eb' }}>High</span>
                </div>
                <div>
                  <span className="metric-label">Peripheral Deficit</span>
                  <span className="metric-val" style={{ color: '#d97706' }}>Moderate</span>
                </div>
                <div>
                  <span className="metric-label">Metro Alignment</span>
                  <span className="metric-val" style={{ color: '#059669' }}>95 Stations</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
                Highest Transit Deficit Wards:
              </div>
              <div className="gap-list">
                {transitDeficitWards.map((w) => (
                  <div
                    key={w.id}
                    className="gap-list-item"
                    onClick={() => {
                      onSelectWard(w);
                      onClose();
                    }}
                  >
                    <span>{w.wardName}</span>
                    <span className="gap-pill-amber">{w.busStopsCount} stops</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Demographic Pressure Gap */}
            <div className="gap-card">
              <div className="gap-card-header">
                <div className="gap-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="gap-card-title">Demographic Growth Gap</div>
                  <div className="gap-card-subtitle">6.04M (2020) &rarr; 8.54M (2026) (+41.5%)</div>
                </div>
              </div>
              <p className="gap-card-desc">
                Projected 2026 populations place unprecedented demand on road networks (75k+ segments) and municipal infrastructure capacities across Pune & Pimpri Chinchwad.
              </p>
              <div className="gap-metrics-strip">
                <div>
                  <span className="metric-label">Total Population</span>
                  <span className="metric-val" style={{ color: '#0f172a' }}>8.54M</span>
                </div>
                <div>
                  <span className="metric-label">Metro Wards</span>
                  <span className="metric-val" style={{ color: '#059669' }}>73 Wards</span>
                </div>
                <div>
                  <span className="metric-label">Avg Growth</span>
                  <span className="metric-val" style={{ color: '#2563eb' }}>+41.5%</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
                Fastest Growing Wards:
              </div>
              <div className="gap-list">
                {topGrowthWards.map((w) => (
                  <div
                    key={w.id}
                    className="gap-list-item"
                    onClick={() => {
                      onSelectWard(w);
                      onClose();
                    }}
                  >
                    <span>{w.wardName}</span>
                    <span className="gap-pill-green">+{w.growthNumber}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="gap-action-box">
            <div>
              <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>
                Spatial Planning Recommendations
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Cross-reference high population density zones with bus stop distributions to prioritize rapid transit frequency and multimodal connectivity.
              </span>
            </div>
            <button className="btn btn-primary" onClick={onClose}>
              <span>Explore on Map</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
