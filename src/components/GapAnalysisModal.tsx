import React, { useState, useMemo } from 'react';
import { X, BusFront, TrainFront, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import type { WardMeta } from '../types';
import { getWardMetric } from '../data/wardMetrics';

interface GapAnalysisModalProps {
  wards: WardMeta[];
  onClose: () => void;
  onSelectWard: (ward: WardMeta) => void;
}

interface RankedWardItem {
  rank: number;
  corp: 'PMC' | 'PCMC';
  wardNo: number;
  label: string;
  category: 'worst' | 'best';
}

const RANKED_DATA: RankedWardItem[] = [
  // 10 Worst (Critical Transit Deficit):
  { rank: 1, corp: 'PMC', wardNo: 26, label: 'Ghorpade Peth - Guruwar Peth - Samatabhoomi', category: 'worst' },
  { rank: 2, corp: 'PMC', wardNo: 39, label: 'Upper Super Indiranagar', category: 'worst' },
  { rank: 3, corp: 'PMC', wardNo: 21, label: 'Mukund Nagar - Salisbury Park', category: 'worst' },
  { rank: 4, corp: 'PMC', wardNo: 19, label: 'Kondhwa Khurd - Kausarbag', category: 'worst' },
  { rank: 5, corp: 'PMC', wardNo: 23, label: 'Ravivar Peth - Nana Peth', category: 'worst' },
  { rank: 6, corp: 'PMC', wardNo: 2, label: 'Phulenagar - Nagpur Chawl', category: 'worst' },
  { rank: 7, corp: 'PCMC', wardNo: 28, label: 'Masulkar Colony', category: 'worst' },
  { rank: 8, corp: 'PCMC', wardNo: 19, label: 'Walhekarwadi', category: 'worst' },
  { rank: 9, corp: 'PCMC', wardNo: 27, label: 'Morwadi', category: 'worst' },
  { rank: 10, corp: 'PCMC', wardNo: 21, label: 'Dalvinagar', category: 'worst' },

  // 5 Best (Overserved / High Supply):
  { rank: 1, corp: 'PCMC', wardNo: 13, label: 'Nigdi Gaothan', category: 'best' },
  { rank: 2, corp: 'PMC', wardNo: 28, label: 'Janata Vasahat - Hingne Khurd', category: 'best' },
  { rank: 3, corp: 'PMC', wardNo: 29, label: 'Deccan Gymkhana - Happy Colony', category: 'best' },
  { rank: 4, corp: 'PCMC', wardNo: 30, label: 'Chakrapani Vasahat', category: 'best' },
  { rank: 5, corp: 'PCMC', wardNo: 20, label: 'Chinchwadnagar', category: 'best' },
];

export const GapAnalysisModal: React.FC<GapAnalysisModalProps> = ({
  wards,
  onClose,
  onSelectWard,
}) => {
  const [activeTab, setActiveTab] = useState<'worst' | 'best' | 'all'>('worst');

  // Match each ranked item with its corresponding authoritative WardMeta
  const resolvedList = useMemo(() => {
    return RANKED_DATA.map((item) => {
      let matched = wards.find(
        (w) => w.corp === item.corp && String(w.wardNo) === String(item.wardNo)
      );

      if (!matched) {
        matched = wards.find((w) =>
          w.wardName.toLowerCase().includes(item.label.toLowerCase().slice(0, 10))
        );
      }

      if (!matched) {
        const metric = getWardMetric(item.corp, item.wardNo);
        if (metric) {
          matched = {
            id: `${item.corp}_${item.wardNo}`,
            isPcmc: item.corp === 'PCMC',
            corp: item.corp,
            wardName: metric.wardName,
            wardNo: metric.wardNo,
            censusPop2026: metric.censusPop2026,
            worldPop2020: metric.worldPop2020,
            population: metric.censusPop2026,
            pop2026: metric.censusPop2026,
            popDensityCensus: metric.popDensityCensus,
            popDensityWorldPop: metric.popDensityWorldPop,
            busStopsCount: metric.busStops,
            metroStopsCount: metric.metroStops,
            areaKm2: metric.areaKm2,
            areaAcres: Math.round(metric.areaKm2 * 247.105),
            areaSqM: metric.areaKm2 * 1_000_000,
            growthPct: 'N/A',
            transitDensity: (metric.busStops / (metric.areaKm2 || 1)).toFixed(1),
            transitDesertScore:
              metric.transitDesertScore !== undefined
                ? `${metric.transitDesertScore > 0 ? '+' : ''}${metric.transitDesertScore.toFixed(3)}`
                : '-0.500',
            transitDesertStatus: metric.transitDesertStatus || 'High Transit Deficit',
            transitDesertColor: metric.transitDesertColor || '#ea580c',
            lengthKm: 'N/A',
            lengthM: 0,
            vulnLevel: 'N/A',
            amjMeanTemp: null,
            raw: {},
          };
        }
      }

      return {
        ...item,
        meta: matched,
      };
    });
  }, [wards]);

  const worstList = useMemo(
    () => resolvedList.filter((item) => item.category === 'worst'),
    [resolvedList]
  );

  const bestList = useMemo(
    () => resolvedList.filter((item) => item.category === 'best'),
    [resolvedList]
  );

  const displayList = useMemo(() => {
    if (activeTab === 'worst') return worstList;
    if (activeTab === 'best') return bestList;
    return resolvedList;
  }, [activeTab, worstList, bestList, resolvedList]);

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ward-modal" style={{ maxWidth: '940px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Spatial Transit Gap Analysis
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  15 Benchmark Wards
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                Pune Metropolitan Transit Supply &amp; Deficit Ranking
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Supply–demand deficit index calculated across 70,598 100m grid cells in Pune (PMC) and Pimpri Chinchwad (PCMC)
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ background: '#ffffff', color: '#1e293b' }}>
          {/* Key Metric Overview Cards - Unwrapped, Calm, Craft-first */}
          <div className="gap-summary-grid">
            <div className="gap-summary-card">
              <div className="gap-summary-top">
                <div className="gap-summary-title-row">
                  <Flame size={16} strokeWidth={2.4} color="#b91c1c" />
                  <span className="gap-summary-title">10 Critical Transit Deserts</span>
                </div>
                <span className="gap-summary-chip chip-worst">Severe Deficit</span>
              </div>
              <div className="gap-summary-stats">
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Pop. Affected</span>
                  <span className="gap-stat-val">1.08M citizens</span>
                </div>
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Avg Bus Stops</span>
                  <span className="gap-stat-val">23 / ward</span>
                </div>
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Metro Stations</span>
                  <span className="gap-stat-val">0 active</span>
                </div>
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Mean Deficit</span>
                  <span className="gap-stat-val" style={{ color: '#b91c1c' }}>-0.582</span>
                </div>
              </div>
              <p className="gap-summary-desc">
                High-density peripheral and congested inner-city sectors experiencing severe supply deficits relative to commuter demand.
              </p>
            </div>

            <div className="gap-summary-card">
              <div className="gap-summary-top">
                <div className="gap-summary-title-row">
                  <CheckCircle2 size={16} strokeWidth={2.4} color="#15803d" />
                  <span className="gap-summary-title">5 Overserved Transit Hubs</span>
                </div>
                <span className="gap-summary-chip chip-best">High Supply</span>
              </div>
              <div className="gap-summary-stats">
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Pop. Served</span>
                  <span className="gap-stat-val">432K citizens</span>
                </div>
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Avg Bus Stops</span>
                  <span className="gap-stat-val">34 / ward</span>
                </div>
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Metro Stations</span>
                  <span className="gap-stat-val">3 stations</span>
                </div>
                <div className="gap-stat-col">
                  <span className="gap-stat-label">Mean Deficit</span>
                  <span className="gap-stat-val" style={{ color: '#15803d' }}>-0.429</span>
                </div>
              </div>
              <p className="gap-summary-desc">
                Central arterial corridors with dense bus network coverage and direct access to Pune Metro Lines 1 &amp; 2.
              </p>
            </div>
          </div>

          {/* Tab Selector - No Box Wraps */}
          <div className="gap-tabs-container">
            <div className="gap-tabs">
              <button
                type="button"
                className={`gap-tab-btn ${activeTab === 'worst' ? 'active active-worst' : ''}`}
                onClick={() => setActiveTab('worst')}
              >
                <Flame size={14} strokeWidth={2.4} />
                <span>10 Worst Deficit Wards</span>
                <span className="gap-tab-count">10</span>
              </button>

              <button
                type="button"
                className={`gap-tab-btn ${activeTab === 'best' ? 'active active-best' : ''}`}
                onClick={() => setActiveTab('best')}
              >
                <CheckCircle2 size={14} strokeWidth={2.4} />
                <span>5 Best Served Wards</span>
                <span className="gap-tab-count">5</span>
              </button>

              <button
                type="button"
                className={`gap-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span>All 15 Key Wards</span>
                <span className="gap-tab-count">15</span>
              </button>
            </div>
          </div>

          {/* Authoritative Transit Gap Ranking Table */}
          <div className="gap-table-wrap">
            <table className="gap-table">
              <thead>
                <tr>
                  <th style={{ width: '52px', textAlign: 'center' }}>Rank</th>
                  <th>Ward / Area Name</th>
                  <th style={{ width: '85px' }}>Corp</th>
                  <th style={{ width: '100px' }}>Bus Stops</th>
                  <th style={{ width: '90px' }}>Metro</th>
                  <th style={{ width: '130px' }}>Pop. (2026)</th>
                  <th style={{ width: '165px' }}>Transit Gap Index</th>
                  <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((item) => {
                  const meta = item.meta;
                  if (!meta) return null;
                  const isWorst = item.category === 'worst';

                  return (
                    <tr
                      key={`${item.corp}_${item.wardNo}`}
                      onClick={() => {
                        onSelectWard(meta);
                        onClose();
                      }}
                      className="gap-table-row"
                    >
                      <td style={{ textAlign: 'center' }}>
                        <span className="gap-rank-mono">
                          {String(item.rank).padStart(2, '0')}
                        </span>
                      </td>

                      <td>
                        <div className="gap-ward-name">{meta.wardName}</div>
                        <div className="gap-ward-sub">Ward No. {meta.wardNo}</div>
                      </td>

                      <td>
                        <span
                          className={`hover-badge ${meta.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`}
                          style={{ fontSize: '10.5px', padding: '2px 7px' }}
                        >
                          {meta.corp}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <BusFront size={13} strokeWidth={2.4} color="#0f172a" />
                          <span style={{ fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                            {meta.busStopsCount}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>stops</span>
                        </div>
                      </td>

                      <td>
                        {meta.metroStopsCount > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrainFront size={13} strokeWidth={2.4} color="#7c3aed" />
                            <span style={{ fontWeight: 700, color: '#7c3aed', fontVariantNumeric: 'tabular-nums' }}>
                              {meta.metroStopsCount} stns
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>
                        )}
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                          {meta.censusPop2026.toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: meta.transitDesertColor,
                            }}
                          >
                            {meta.transitDesertScore}
                          </span>
                          <span
                            className={`gap-status-tag ${isWorst ? 'tag-critical' : 'tag-oasis'}`}
                          >
                            {isWorst ? 'Severe Deficit' : 'High Supply'}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="gap-inspect-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectWard(meta);
                            onClose();
                          }}
                          title="Inspect ward on map"
                        >
                          <span>Inspect</span>
                          <ArrowRight size={11} strokeWidth={2.4} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Callout */}
          <div className="gap-action-box">
            <div>
              <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px', fontWeight: 600 }}>
                Interactive Spatial Navigation
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Select any ward above to navigate to its boundary and inspect local 100m grid cell deficit indices on the map.
              </span>
            </div>
            <button className="btn btn-primary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Explore Map</span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
