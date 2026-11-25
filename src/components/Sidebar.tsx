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
  Flame,
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
  isLegendOpen?: boolean;
  onToggleLegend?: () => void;
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
  isLegendOpen = true,
  onToggleLegend,
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
    !visibility.metroRoutes &&
    !visibility.metroStations &&
    !visibility.metro &&
    !visibility.majorRoads &&
    !visibility.allRoads &&
    !visibility.transitDesert &&
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
      if (visibility.metroRoutes) onToggleLayer('metroRoutes');
      if (visibility.metroStations) onToggleLayer('metroStations');
      if (visibility.metro) onToggleLayer('metro');
      if (visibility.majorRoads) onToggleLayer('majorRoads');
      if (visibility.allRoads) onToggleLayer('allRoads');
      if (visibility.transitDesert) onToggleLayer('transitDesert');
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

          {/* Compact Thematic Indicator */}
          <div className="sidebar-micro-note">
            <span className="micro-note-dot-indicator" />
            <span className="micro-note-text">
              {thematic === 'corp' && 'PMC (41) & PCMC (32) unified boundaries'}
              {thematic === 'pop' && 'Census 2026 population density gradient'}
              {thematic === 'transit' && 'Public transit coverage density gradient'}
            </span>
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
                <div className="layer-subtext">3,319 Real Transit Stops</div>
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

          {/* Metro Corridors (Lines 1 & 2 Routes) */}
          <div
            className={`layer-card ${visibility.metroRoutes ? 'active' : ''}`}
            onClick={() => onToggleLayer('metroRoutes')}
          >
            <div className="layer-info">
              <div className="layer-badge-icon" style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                <TrainFront size={14} />
              </div>
              <div>
                <div className="layer-title-text">Metro Rail Corridors</div>
                <div className="layer-subtext">Lines 1 & 2 (133 Alignments)</div>
              </div>
            </div>
            <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
              <span className={`status-pill ${visibility.metroRoutes ? 'pill-active' : ''}`}>
                {visibility.metroRoutes ? 'ON' : 'OFF'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={visibility.metroRoutes}
                  onChange={() => onToggleLayer('metroRoutes')}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* Metro Stations (28 Stations) */}
          <div
            className={`layer-card ${visibility.metroStations ? 'active' : ''}`}
            onClick={() => onToggleLayer('metroStations')}
          >
            <div className="layer-info">
              <div className="layer-badge-icon" style={{ background: '#eff6ff', color: '#0284c7', border: '1px solid #bfdbfe' }}>
                <Milestone size={14} />
              </div>
              <div>
                <div className="layer-title-text">Metro Stations</div>
                <div className="layer-subtext">28 Stations & District Court Hub</div>
              </div>
            </div>
            <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
              <span className={`status-pill ${visibility.metroStations ? 'pill-active' : ''}`}>
                {visibility.metroStations ? 'ON' : 'OFF'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={visibility.metroStations}
                  onChange={() => onToggleLayer('metroStations')}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {(visibility.metroRoutes || visibility.metroStations || visibility.metro) && (
            <div className="sidebar-micro-note">
              <div className="micro-note-dots">
                <span className="micro-dot" style={{ background: '#7c3aed' }} title="Line 1: Purple Line" />
                <span className="micro-dot" style={{ background: '#0284c7' }} title="Line 2: Aqua Line" />
                <span className="micro-dot" style={{ background: '#1d4ed8', border: '1px solid #93c5fd' }} title="District Court Hub" />
              </div>
              <span className="micro-note-text">
                Lines 1 &amp; 2 operational corridors
              </span>
            </div>
          )}
        </div>

        {/* SECTION 4: TRANSIT GAP & DESERT ANALYSIS */}
        <div className="sidebar-section">
          <div className="section-label">Transit Desert & Gap Analysis</div>

          {/* Transit Desert Surface (100m Grid) */}
          <div
            className={`layer-card ${visibility.transitDesert ? 'active' : ''}`}
            onClick={() => onToggleLayer('transitDesert')}
          >
            <div className="layer-info">
              <div className="layer-badge-icon" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                <Flame size={14} />
              </div>
              <div>
                <div className="layer-title-text">Transit Desert Heatmap</div>
                <div className="layer-subtext">100m Grid Index (70,598 Points)</div>
              </div>
            </div>
            <div className="layer-control-wrap" onClick={(e) => e.stopPropagation()}>
              <span className={`status-pill ${visibility.transitDesert ? 'pill-active' : ''}`}>
                {visibility.transitDesert ? 'ON' : 'OFF'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={visibility.transitDesert}
                  onChange={() => onToggleLayer('transitDesert')}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {visibility.transitDesert && (
            <div className="sidebar-micro-note">
              <div className="micro-note-ramp">
                <span style={{ background: '#b91c1c' }} />
                <span style={{ background: '#f97316' }} />
                <span style={{ background: '#eab308' }} />
                <span style={{ background: '#65a30d' }} />
                <span style={{ background: '#047857' }} />
              </div>
              <span className="micro-note-text">
                5 Natural Breaks deficit bands
              </span>
            </div>
          )}
        </div>

        {/* SECTION 5: ROAD NETWORK & ARTERIALS */}
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
