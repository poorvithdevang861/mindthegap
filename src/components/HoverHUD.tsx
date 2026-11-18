import React from 'react';
import { MousePointer } from 'lucide-react';
import type { WardMeta } from '../types';

interface HoverHUDProps {
  ward: WardMeta | null;
}

export const HoverHUD: React.FC<HoverHUDProps> = ({ ward }) => {
  if (!ward) return null;

  return (
    <div className="hover-hud visible">
      <div className="hover-hud-header">
        <span className={`hover-badge ${ward.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`}>
          {ward.corp}
        </span>
        <span className="hover-hud-wardno">
          {ward.wardNo ? `Ward ${ward.wardNo}` : 'Ward Sector'}
        </span>
      </div>

      <div className="hover-hud-title">
        {ward.wardName}
      </div>

      <div className="hover-hud-grid">
        <div className="hover-metric">
          <span className="metric-label">2026 pop. (proj.)</span>
          <strong className="metric-val">
            {ward.censusPop2026 > 0 ? ward.censusPop2026.toLocaleString() : 'N/A'}
          </strong>
        </div>
        <div className="hover-metric">
          <span className="metric-label">2020 pop. (baseline)</span>
          <strong className="metric-val">
            {ward.worldPop2020 > 0 ? ward.worldPop2020.toLocaleString() : 'N/A'}
          </strong>
        </div>
        <div className="hover-metric">
          <span className="metric-label">Land area</span>
          <strong className="metric-val">{ward.areaKm2} km²</strong>
        </div>
        <div className="hover-metric">
          <span className="metric-label">Density</span>
          <strong className="metric-val">
            {ward.popDensityCensus > 0 ? `${ward.popDensityCensus.toLocaleString()} / km²` : 'N/A'}
          </strong>
        </div>
        <div className="hover-metric">
          <span className="metric-label">Public transit</span>
          <strong className="metric-val">
            {ward.busStopsCount} bus • {ward.metroStopsCount} metro
          </strong>
        </div>
        <div className="hover-metric">
          <span className="metric-label">Growth (2020–2026)</span>
          <strong className="metric-val">{ward.growthPct !== 'N/A' ? `+${ward.growthPct}` : 'N/A'}</strong>
        </div>
      </div>

      <div className="hover-hud-footer">
        <MousePointer size={12} className="footer-icon" />
        <span>Click ward for detailed inspector</span>
      </div>
    </div>
  );
};
