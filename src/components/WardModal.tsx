import React, { useState, useMemo } from 'react';
import { X, Crosshair, Users, ThermometerSun, Bus, Info, FileText, FileSpreadsheet } from 'lucide-react';
import type { WardMeta, BusStop } from '../types';
import { extractClimateData } from '../utils/geo';
import { downloadTableAsPdf, downloadTableAsExcel } from '../utils/exportTable';

interface WardModalProps {
  ward: WardMeta | null;
  feature: any;
  busStopsInWard: BusStop[];
  onClose: () => void;
  onZoomToWard: () => void;
}

type TabKey = 'profile' | 'transit' | 'climate';

export const WardModal: React.FC<WardModalProps> = ({
  ward,
  feature: _feature,
  busStopsInWard,
  onClose,
  onZoomToWard,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [transitFilter, setTransitFilter] = useState('');

  if (!ward) return null;

  const rawProps = ward.raw || {};
  const climateData = extractClimateData(rawProps);

  // Filtered transit stops
  const filteredStops = useMemo(() => {
    if (!transitFilter.trim()) return busStopsInWard;
    const q = transitFilter.toLowerCase();
    return busStopsInWard.filter(
      (s) => s.name.toLowerCase().includes(q) || String(s.id).includes(q)
    );
  }, [busStopsInWard, transitFilter]);

  // Authoritative parameters from new_metrics_table with all irrelevant parameters removed
  const rows = [
    { label: 'Ward / Area Name', value: ward.wardName },
    { label: 'Ward Number', value: ward.wardNo ? `Ward ${ward.wardNo}` : 'N/A' },
    {
      label: 'Governing Municipal Corporation',
      value:
        ward.corp === 'PCMC'
          ? 'Pimpri Chinchwad Municipal Corporation (PCMC)'
          : 'Pune Municipal Corporation (PMC)',
    },
    {
      label: 'Census Projected Population (2026)',
      value:
        ward.censusPop2026 > 0
          ? `${ward.censusPop2026.toLocaleString()} citizens`
          : 'Not recorded',
      highlight: true,
    },
    {
      label: 'WorldPop Baseline Population (2020)',
      value:
        ward.worldPop2020 > 0
          ? `${ward.worldPop2020.toLocaleString()} citizens`
          : 'Not recorded',
    },
    {
      label: 'Projected Population Growth (2020 → 2026)',
      value: ward.growthPct !== 'N/A' ? `+${ward.growthPct}` : 'N/A',
      color: '#059669',
    },
    {
      label: 'Geographic Land Area',
      value: `${ward.areaKm2} km²`,
    },
    {
      label: 'Population Density (Census 2026)',
      value:
        ward.popDensityCensus > 0
          ? `${ward.popDensityCensus.toLocaleString()} people / km²`
          : 'N/A',
    },
    {
      label: 'Population Density (WorldPop 2020)',
      value:
        ward.popDensityWorldPop > 0
          ? `${ward.popDensityWorldPop.toLocaleString()} people / km²`
          : 'N/A',
    },
    {
      label: 'Public Bus Transit Stops',
      value: `${ward.busStopsCount} stops`,
      color: '#2563eb',
    },
    {
      label: 'Metro Rapid Transit Stations',
      value: `${ward.metroStopsCount} stations`,
      color: ward.metroStopsCount > 0 ? '#7c3aed' : '#64748b',
    },
    {
      label: 'Transit Stop Density',
      value: `${ward.transitDensity} stops per km²`,
    },
    ...(ward.vulnLevel && ward.vulnLevel !== 'N/A'
      ? [
          {
            label: 'Summer Heat Vulnerability',
            value: `${ward.vulnLevel} Risk (${ward.amjMeanTemp || '48+'}°C surface mean)`,
            color:
              ward.vulnLevel === 'High'
                ? '#dc2626'
                : ward.vulnLevel === 'Medium'
                ? '#d97706'
                : '#059669',
          },
        ]
      : []),
  ];

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ward-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <span
              className={`hover-badge ${ward.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              {ward.corp}
            </span>
            <div>
              <h2>{ward.wardName}</h2>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {ward.corp === 'PCMC'
                  ? 'Pimpri Chinchwad Municipal Corporation'
                  : 'Pune Municipal Corporation'}{' '}
                • Ward No. {ward.wardNo || 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-outline" onClick={onZoomToWard} title="Zoom map to this ward">
              <Crosshair size={14} />
              <span>Zoom to Ward</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Top KPI Cards with Accurate Values */}
        <div className="modal-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Census 2026 Pop</div>
            <div className="kpi-val" style={{ color: '#0f172a' }}>
              {ward.censusPop2026.toLocaleString()}
            </div>
            <div className="kpi-sub">Rounded Citizen Count</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">WorldPop 2020 Pop</div>
            <div className="kpi-val" style={{ color: '#4338ca' }}>
              {ward.worldPop2020.toLocaleString()}
            </div>
            <div className="kpi-sub">Baseline Benchmark</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Land Area & Density</div>
            <div className="kpi-val">{ward.areaKm2} km²</div>
            <div className="kpi-sub">{ward.popDensityCensus.toLocaleString()} / km²</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Public Transit Access</div>
            <div className="kpi-val" style={{ color: '#059669' }}>
              {ward.busStopsCount} Bus • {ward.metroStopsCount} Metro
            </div>
            <div className="kpi-sub">{ward.transitDensity} stops per km²</div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} />
            Ward Metrics & Demographics
          </button>
          <button
            className={`tab-btn ${activeTab === 'transit' ? 'active' : ''}`}
            onClick={() => setActiveTab('transit')}
          >
            <Bus size={14} style={{ display: 'inline', marginRight: 4 }} />
            Transit Stops ({ward.busStopsCount})
          </button>
          <button
            className={`tab-btn ${activeTab === 'climate' ? 'active' : ''}`}
            onClick={() => setActiveTab('climate')}
          >
            <ThermometerSun size={14} style={{ display: 'inline', marginRight: 4 }} />
            Microclimate & Heat
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="modal-body">
          {/* TAB 1: Profile & Demographics Table (Clean & Authoritative) */}
          {activeTab === 'profile' && (
            <div className="tab-content active">
              <div className="table-responsive">
                <table className="data-table">
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <th style={{ width: '40%' }}>{r.label}</th>
                        <td>
                          <strong style={{ color: r.color || (r.highlight ? '#1e293b' : 'inherit') }}>
                            {r.value}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Transit Network */}
          {activeTab === 'transit' && (
            <div className="tab-content active">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Stops in Ward:{' '}
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>
                    {ward.busStopsCount} Bus Stops
                  </span>{' '}
                  •{' '}
                  <span style={{ color: '#7c3aed', fontWeight: 700 }}>
                    {ward.metroStopsCount} Metro Stations
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search stops by name..."
                    value={transitFilter}
                    onChange={(e) => setTransitFilter(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      width: '200px',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                      <th style={{ width: '20%' }}>Stop ID</th>
                      <th style={{ width: '55%' }}>Stop Name</th>
                      <th style={{ width: '25%' }}>Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStops.length > 0 ? (
                      filteredStops.map((s, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong style={{ color: '#2563eb' }}>{s.id}</strong>
                          </td>
                          <td>{s.name}</td>
                          <td
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              color: '#64748b',
                            }}
                          >
                            {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}
                        >
                          {transitFilter
                            ? 'No stops match your filter query.'
                            : `${ward.busStopsCount} bus stops and ${ward.metroStopsCount} metro stations recorded in official registry for ${ward.wardName}.`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Microclimate & Heat Vulnerability */}
          {activeTab === 'climate' && (
            <div className="tab-content active">
              {climateData ? (
                <div>
                  <div style={{ marginBottom: '12px', fontSize: '13px', color: '#475569' }}>
                    Monthly surface temperature profile and summer vulnerability indicators for{' '}
                    <strong>{ward.wardName}</strong>:
                  </div>

                  {/* Monthly Temperature Bar Graph */}
                  <div className="temp-bars-container">
                    {climateData.map((m) => {
                      const val = Number(m.mean).toFixed(1);
                      const heightPct = Math.min(Math.max((Number(m.mean) / 55) * 100, 15), 100);
                      return (
                        <div key={m.key} className="temp-bar-col">
                          <span className="temp-val-text">{val}°</span>
                          <div className="temp-bar" style={{ height: `${heightPct}%` }} />
                          <span className="temp-month-name">{m.key}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Climate Table */}
                  <div className="table-responsive">
                    <table className="data-table" style={{ marginTop: '16px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          <th style={{ width: '25%' }}>Month</th>
                          <th style={{ width: '25%' }}>Mean Temp (°C)</th>
                          <th style={{ width: '25%' }}>Min Temp (°C)</th>
                          <th style={{ width: '25%' }}>Max Temp (°C)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {climateData.map((m) => (
                          <tr key={m.key}>
                            <td>
                              <strong>{m.name}</strong>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#dc2626' }}>
                                {Number(m.mean).toFixed(1)} °C
                              </span>
                            </td>
                            <td>{Number(m.min).toFixed(1)} °C</td>
                            <td>{Number(m.max).toFixed(1)} °C</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  <Info size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                    Microclimate surface data not modeled for this sector
                  </p>
                  <p style={{ fontSize: '12px' }}>
                    Detailed satellite surface thermal readings in this dataset are modeled specifically for Pimpri-Chinchwad (PCMC) industrial corridors.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Ward Code:{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {ward.corp}_{ward.wardNo}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-download btn-download-pdf"
              onClick={() => downloadTableAsPdf(ward, rows)}
              title="Download this ward table as a PDF report"
            >
              <FileText size={14} color="#dc2626" />
              <span>Download PDF</span>
            </button>

            <button
              className="btn btn-download btn-download-excel"
              onClick={() => downloadTableAsExcel(ward, rows)}
              title="Download this ward table as an Excel spreadsheet (.xls)"
            >
              <FileSpreadsheet size={14} color="#059669" />
              <span>Download Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
