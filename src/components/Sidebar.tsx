import React, { useState, useEffect } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Building2,
  Palette,
  RotateCcw,
  LandPlot,
  BusFront,
  TrainFront,
  Route,
  Milestone,
  Network,
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
    label: 'Municipal Jurisdiction',
    sublabel: 'PMC (41 Wards) vs PCMC (32 Wards)',
    dotColor: '#7c3aed',
  },
  {
    value: 'pop',
    label: 'Population Density',
    sublabel: 'Census 2026 Density (people / km²)',
    dotColor: '#2563eb',
  },
  {
    value: 'transit',
    label: 'Transit Coverage Density',
    sublabel: 'Transit Access (stops / km²)',
    dotColor: '#059669',
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
            <h2>Layer Controls</h2>
            <span style={{ fontSize: '10.5px', color: '#64748b' }}>Spatial Data Overlays</span>
          </div>
        </div>
        <span className="badge-active-count">{activeCount} of 6 Active</span>
      </div>

      {/* Sidebar Scrollable Body */}
      <div className="sidebar-content">
        {/* SECTION 1: JURISDICTION & THEMATIC VIEWS */}
        <div className="sidebar-section">
          <div className="section-label">Jurisdiction & Thematic Views</div>

          {/* Dropdown 1: Jurisdiction Filter */}
          <CustomDropdown
            label="Municipal Jurisdiction"
            icon={<Building2 size={13} color="#2563eb" />}
            headerBadge={corpFilter === 'all' ? '73 Wards' : corpFilter === 'PMC' ? '41 Wards' : '32 Wards'}
            value={corpFilter}
            onChange={onChangeCorpFilter}
            options={CORP_OPTIONS}
          />

          {/* Dropdown 2: Thematic Choropleth */}
          <div style={{ marginTop: '10px' }}>
            <CustomDropdown
              label="Thematic Choropleth"
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
                  <span>Sparse (&lt; 85k)</span>
                  <span>125k</span>
                  <span>Dense (&gt; 150k)</span>
                </div>
              </div>
            )}

            {thematic === 'transit' && (
              <div>
                <div className="legend-bar-container">
                  <span
                    className="legend-gradient-bar"
                    style={{
                      background: 'linear-gradient(to right, #d1fae5, #6ee7b7, #10b981, #059669, #064e3b)',
                    }}
                  />
                </div>
                <div className="legend-bar-labels">
                  <span>Gap (&lt; 2 / km²)</span>
                  <span>6 / km²</span>
                  <span>High (&gt; 12 / km²)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: ADMINISTRATIVE BOUNDARIES */}
        <div className="sidebar-section">
          <div className="section-label">Administrative Boundaries</div>

          <div
            className={`layer-card ${visibility.wards ? 'active' : ''}`}
            onClick={() => onToggleLayer('wards')}
          >
            <div className="layer-info">
              <div className="layer-badge-icon" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <LandPlot size={14} />
              </div>
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
          <div className="section-label">Public Transit Network</div>

          {/* Bus Stops */}
          <div
            className={`layer-card ${visibility.stops ? 'active' : ''}`}
            onClick={() => onToggleLayer('stops')}
          >
            <div className="layer-info">
              <div className="layer-badge-icon" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                <BusFront size={14} />
              </div>
              <div>
                <div className="layer-title-text">Bus Stops (GTFS)</div>
                <div className="layer-subtext">3,320 Transit Stops</div>
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
              <div className="layer-badge-icon" style={{ background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8' }}>
                <Route size={14} />
              </div>
              <div>
                <div className="layer-title-text">Bus Corridors</div>
                <div className="layer-subtext">555 Transit Routes</div>
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
              <div className="layer-badge-icon" style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                <TrainFront size={14} />
              </div>
              <div>
                <div className="layer-title-text">Metro Rail Network</div>
                <div className="layer-subtext">Lines 1, 2, 3 & 4 (95 Stations & Routes)</div>
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

          {visibility.metro && (
            <div
              style={{
                marginTop: '6px',
                padding: '8px 10px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Corridor Legend
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                  Line 1: Purple Line
                </span>
                <span style={{ fontSize: '9.5px', color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  Operational
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
                  Line 2: Aqua Line
                </span>
                <span style={{ fontSize: '9.5px', color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  Operational
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', flexShrink: 0 }} />
                  Line 3: Pink Line
                </span>
                <span style={{ fontSize: '9.5px', color: '#d97706', background: '#fffbeb', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  Under Constr.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                  Line 4 & 4A/B
                </span>
                <span style={{ fontSize: '9.5px', color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  Planned
                </span>
              </div>
              <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                ○ <strong>Solid circle</strong>: Station • ◎ <strong>Larger badge</strong>: Transfer Hub
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: ROAD NETWORK & ARTERIALS */}
        <div className="sidebar-section">
          <div className="section-label">Street & Highway Network</div>

          {/* Major Roads */}
          <div
            className={`layer-card ${visibility.majorRoads ? 'active' : ''}`}
            onClick={() => onToggleLayer('majorRoads')}
          >
            <div className="layer-info">
              <div className="layer-badge-icon" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                <Milestone size={14} />
              </div>
              <div>
                <div className="layer-title-text">Primary Arterials</div>
                <div className="layer-subtext">6,136 Major Corridors</div>
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
              <div className="layer-badge-icon" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                <Network size={14} />
              </div>
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
