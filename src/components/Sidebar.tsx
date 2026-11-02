import React, { useState, useEffect } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Building2,
  Palette,
  RotateCcw,
} from 'lucide-react';
import type { LayerVisibility, ThematicOption, CorpFilter } from '../types';
import { CustomDropdown, type DropdownOption } from './CustomDropdown';

interface SidebarProps {
  visibility: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  thematic: ThematicOption;
  onChangeThematic: (thematic: ThematicOption) => void;
  corpFilter: CorpFilter;
  onChangeCorpFilter: (filter: CorpFilter) => void;
  onResetAll?: () => void;
}

const CORP_OPTIONS: DropdownOption[] = [
  {
    value: 'all',
    label: 'All 73 Wards (PMC & PCMC)',
    sublabel: 'Full Metropolitan Boundary',
    badge: '73 Wards',
    dotColor: '#2563eb',
  },
  {
    value: 'PMC',
    label: 'Pune Municipal Corp (PMC)',
    sublabel: 'Central Metropolitan Sector',
    badge: '41 Wards',
    dotColor: '#7c3aed',
  },
  {
    value: 'PCMC',
    label: 'Pimpri Chinchwad (PCMC)',
    sublabel: 'Northern Industrial Corridor',
    badge: '32 Wards',
    dotColor: '#059669',
  },
];

const THEMATIC_OPTIONS: DropdownOption[] = [
  {
    value: 'corp',
    label: 'Municipal Corporation',
    sublabel: 'PMC Purple vs PCMC Green',
    dotColor: '#7c3aed',
  },
  {
    value: 'pop',
    label: 'Population Density (2026)',
    sublabel: 'Census 2026 Density Choropleth',
    dotColor: '#2563eb',
  },
  {
    value: 'vuln',
    label: 'Heat Vulnerability Index',
    sublabel: 'PCMC Surface Thermal Risk',
    dotColor: '#dc2626',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  visibility,
  onToggleLayer,
  thematic,
  onChangeThematic,
  corpFilter,
  onChangeCorpFilter,
  onResetAll,
}) => {
  // Respect user's collapse preference; only collapse by default on small mobile screens (< 768px)
  const [collapsed, setCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  const activeCount = Object.values(visibility).filter(Boolean).length;

  // Default state: wards=ON, all other layers=OFF, thematic='corp', corpFilter='all'
  const isDefaultState =
    visibility.wards &&
    !visibility.stops &&
    !visibility.routes &&
    !visibility.metro &&
    !visibility.majorRoads &&
    !visibility.allRoads &&
    thematic === 'corp' &&
    corpFilter === 'all';

  const handleReset = () => {
    if (isDefaultState) return;
    if (onResetAll) {
      onResetAll();
    } else {
      if (!visibility.wards) onToggleLayer('wards');
      if (visibility.stops) onToggleLayer('stops');
      if (visibility.routes) onToggleLayer('routes');
      if (visibility.metro) onToggleLayer('metro');
      if (visibility.majorRoads) onToggleLayer('majorRoads');
      if (visibility.allRoads) onToggleLayer('allRoads');
      onChangeThematic('corp');
      onChangeCorpFilter('all');
    }
  };

  return (
    <aside className={`sidebar-docked ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse/Expand Floating Button permanently anchored to the right border */}
      <button
        className="sidebar-docked-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand Layer Controls' : 'Collapse Layer Controls'}
        aria-label={collapsed ? 'Expand Layer Controls' : 'Collapse Layer Controls'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar Header */}
      <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sidebar-header-icon">
              <Layers size={15} color="#2563eb" />
            </div>
            <div>
              <h2>Control Center</h2>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>Layers & Visualization</span>
            </div>
          </div>
          <span className="badge-active-count">{activeCount} of 6 Active</span>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="sidebar-content">
          {/* SECTION 1: MAP VIEW SETTINGS (DROPDOWNS WITH CONSISTENT STYLING) */}
          <div className="sidebar-section">
            <div className="section-label">Map View Settings</div>

            {/* Dropdown 1: Corporation Filter (Custom styled dropdown) */}
            <CustomDropdown
              label="Filter Corporation Wards"
              icon={<Building2 size={13} color="#2563eb" />}
              headerBadge={corpFilter === 'all' ? '73 Wards' : corpFilter === 'PMC' ? '41 Wards' : '32 Wards'}
              value={corpFilter}
              onChange={onChangeCorpFilter}
              options={CORP_OPTIONS}
            />

            {/* Dropdown 2: Thematic Color Mode (Custom styled dropdown) */}
            <div style={{ marginTop: '10px' }}>
              <CustomDropdown
                label="Ward Map Color Theme"
                icon={<Palette size={13} color="#7c3aed" />}
                value={thematic}
                onChange={onChangeThematic}
                options={THEMATIC_OPTIONS}
              />
            </div>

            {/* Intuitive Dynamic Legend for Currently Selected Thematic Theme */}
            <div className="thematic-legend-card">
              <div className="thematic-legend-title">Active Map Legend:</div>

              {thematic === 'corp' && (
                <div className="legend-items-grid">
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#7c3aed' }} />
                    <span className="legend-text">PMC Wards (41)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#059669' }} />
                    <span className="legend-text">PCMC Wards (32)</span>
                  </div>
                </div>
              )}

              {thematic === 'pop' && (
                <div>
                  <div className="legend-bar-container">
                    <span className="legend-gradient-bar" />
                  </div>
                  <div className="legend-bar-labels">
                    <span>Low (&lt; 85k)</span>
                    <span>125k</span>
                    <span>High (&gt; 150k)</span>
                  </div>
                </div>
              )}

              {thematic === 'vuln' && (
                <div className="legend-items-grid">
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#dc2626' }} />
                    <span className="legend-text">High Risk (&gt;49°C)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#f59e0b' }} />
                    <span className="legend-text">Medium Risk</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#10b981' }} />
                    <span className="legend-text">Low Risk</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: PRIMARY BOUNDARY LAYER */}
          <div className="sidebar-section">
            <div className="section-label">Primary Boundary Layer</div>

            <div
              className={`layer-card ${visibility.wards ? 'active' : ''}`}
              onClick={() => onToggleLayer('wards')}
            >
              <div className="layer-info">
                <span
                  className="layer-badge-dot"
                  style={{ background: 'linear-gradient(135deg, #059669, #7c3aed)' }}
                />
                <div>
                  <div className="layer-title-text">Municipal Wards</div>
                  <div className="layer-subtext">73 Unified Wards (41 PMC & 32 PCMC)</div>
                </div>
              </div>
              <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
                <span className={`status-pill ${visibility.wards ? 'pill-active' : ''}`}>
                  {visibility.wards ? 'ON' : 'OFF'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={visibility.wards}
                    onChange={() => onToggleLayer('wards')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: PUBLIC TRANSIT NETWORK */}
          <div className="sidebar-section">
            <div className="section-label">Public Transit (GTFS & Metro)</div>

            {/* Bus Stops */}
            <div
              className={`layer-card ${visibility.stops ? 'active' : ''}`}
              onClick={() => onToggleLayer('stops')}
            >
              <div className="layer-info">
                <span className="layer-badge-dot" style={{ background: '#2563eb' }} />
                <div>
                  <div className="layer-title-text">Bus Stops (GTFS)</div>
                  <div className="layer-subtext">3,320 Verified Transit Stops</div>
                </div>
              </div>
              <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
                <span className={`status-pill ${visibility.stops ? 'pill-active' : ''}`}>
                  {visibility.stops ? 'ON' : 'OFF'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={visibility.stops}
                    onChange={() => onToggleLayer('stops')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            {/* Bus Routes */}
            <div
              className={`layer-card ${visibility.routes ? 'active' : ''}`}
              onClick={() => onToggleLayer('routes')}
            >
              <div className="layer-info">
                <span className="layer-badge-dot" style={{ background: '#ec4899' }} />
                <div>
                  <div className="layer-title-text">Bus Transit Routes</div>
                  <div className="layer-subtext">555 Active Bus Corridors</div>
                </div>
              </div>
              <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
                <span className={`status-pill ${visibility.routes ? 'pill-active' : ''}`}>
                  {visibility.routes ? 'ON' : 'OFF'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={visibility.routes}
                    onChange={() => onToggleLayer('routes')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            {/* Metro Corridors */}
            <div
              className={`layer-card ${visibility.metro ? 'active' : ''}`}
              onClick={() => onToggleLayer('metro')}
            >
              <div className="layer-info">
                <span className="layer-badge-dot" style={{ background: '#0284c7' }} />
                <div>
                  <div className="layer-title-text">Metro Rail Corridors</div>
                  <div className="layer-subtext">95 Metro Stations & Alignments</div>
                </div>
              </div>
              <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
                <span className={`status-pill ${visibility.metro ? 'pill-active' : ''}`}>
                  {visibility.metro ? 'ON' : 'OFF'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={visibility.metro}
                    onChange={() => onToggleLayer('metro')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 4: ROAD INFRASTRUCTURE */}
          <div className="sidebar-section">
            <div className="section-label">Road Infrastructure</div>

            {/* Major Roads */}
            <div
              className={`layer-card ${visibility.majorRoads ? 'active' : ''}`}
              onClick={() => onToggleLayer('majorRoads')}
            >
              <div className="layer-info">
                <span className="layer-badge-dot" style={{ background: '#f59e0b' }} />
                <div>
                  <div className="layer-title-text">Major Arterial Roads</div>
                  <div className="layer-subtext">6,136 Highways & Arteries</div>
                </div>
              </div>
              <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
                <span className={`status-pill ${visibility.majorRoads ? 'pill-active' : ''}`}>
                  {visibility.majorRoads ? 'ON' : 'OFF'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={visibility.majorRoads}
                    onChange={() => onToggleLayer('majorRoads')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            {/* All Roads */}
            <div
              className={`layer-card ${visibility.allRoads ? 'active' : ''}`}
              onClick={() => onToggleLayer('allRoads')}
            >
              <div className="layer-info">
                <span className="layer-badge-dot" style={{ background: '#94a3b8' }} />
                <div>
                  <div className="layer-title-text">All Local Streets</div>
                  <div className="layer-subtext">75,359 Streets (Complete 48MB)</div>
                </div>
              </div>
              <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
                <span className={`status-pill ${visibility.allRoads ? 'pill-active' : ''}`}>
                  {visibility.allRoads ? 'ON' : 'OFF'}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={visibility.allRoads}
                    onChange={() => onToggleLayer('allRoads')}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Reset Action with Disabled / Active States */}
          <div style={{ paddingTop: '6px', paddingBottom: '4px' }}>
            <button
              className={`btn-reset ${isDefaultState ? 'btn-reset-disabled' : 'btn-reset-active'}`}
              onClick={handleReset}
              disabled={isDefaultState}
              title={
                isDefaultState
                  ? 'Default map view active - no filters or layers changed'
                  : 'Reset layers and filters to default view'
              }
            >
              <RotateCcw size={13} className={isDefaultState ? 'reset-disabled-icon' : 'reset-active-icon'} />
              <span>Reset Layers &amp; Filters</span>
            </button>
          </div>
        </div>
      </aside>
  );
};
