import React from 'react';
import { MousePointer, Bus, Building2 } from 'lucide-react';
import type { WardMeta } from '../types';

interface HoverHUDProps {
  ward: WardMeta | null;
}

export const HoverHUD: React.FC<HoverHUDProps> = ({ ward }) => {
  if (!ward) return null;

  return (
    <div className="hover-hud glass visible">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span className={`hover-badge ${ward.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`}>
          {ward.corp}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
          {ward.wardNo ? `Ward ${ward.wardNo}` : 'Ward Area'}
        </span>
      </div>

      <div
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.3,
          marginBottom: '8px',
        }}
      >
        {ward.wardName}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '11px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '8px',
        }}
      >
        <div>
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>2026 Pop (Census)</span>
          <strong style={{ color: '#0f172a' }}>
            {ward.censusPop2026 > 0 ? ward.censusPop2026.toLocaleString() : 'N/A'}
          </strong>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>2020 Pop (WorldPop)</span>
          <strong style={{ color: '#4338ca' }}>
            {ward.worldPop2020 > 0 ? ward.worldPop2020.toLocaleString() : 'N/A'}
          </strong>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Land Area</span>
          <strong style={{ color: '#0f172a' }}>{ward.areaKm2} km²</strong>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Pop Density</span>
          <strong style={{ color: '#0f172a' }}>
            {ward.popDensityCensus > 0 ? `${ward.popDensityCensus.toLocaleString()}/km²` : 'N/A'}
          </strong>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Public Transit</span>
          <strong style={{ color: '#059669' }}>
            {ward.busStopsCount} Bus • {ward.metroStopsCount} Metro
          </strong>
        </div>
        {ward.vulnLevel && ward.vulnLevel !== 'N/A' ? (
          <div>
            <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Heat Risk</span>
            <span className={`hover-badge badge-vuln-${ward.vulnLevel.toLowerCase()}`}>
              {ward.vulnLevel} ({ward.amjMeanTemp || ''}°C)
            </span>
          </div>
        ) : (
          <div>
            <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Growth (20-26)</span>
            <strong style={{ color: '#059669' }}>+{ward.growthPct}</strong>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: '10px',
          color: '#2563eb',
          fontWeight: 600,
          marginTop: '10px',
          textAlign: 'center',
          background: '#eff6ff',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        <MousePointer size={12} />
        <span>Click ward for detailed data table</span>
      </div>
    </div>
  );
};
