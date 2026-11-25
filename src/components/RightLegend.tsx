import React, { useState } from 'react';
import { Layers, EyeOff, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { LayerVisibility, ThematicOption, CorpFilter } from '../types';

interface RightLegendProps {
  isOpen: boolean;
  onToggle: () => void;
  visibility: LayerVisibility;
  thematic: ThematicOption;
  corpFilter: CorpFilter;
}

export const RightLegend: React.FC<RightLegendProps> = ({
  isOpen,
  onToggle,
  visibility,
  thematic,
  corpFilter,
}) => {
  // Category collapse state (false = expanded, true = collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Compute active layers count for the badge
  const activeCount = [
    visibility.transitDesert,
    visibility.metroRoutes || visibility.metroStations || visibility.metro,
    visibility.routes || visibility.stops,
    visibility.wards,
    visibility.majorRoads || visibility.allRoads,
  ].filter(Boolean).length;

  // Floating collapsed pill when closed
  if (!isOpen) {
    return (
      <div className="right-legend-collapsed-wrapper">
        <button
          type="button"
          className="right-legend-pill-btn"
          onClick={onToggle}
          title="Show map legend"
          aria-label="Show map legend"
        >
          <Layers size={13} className="legend-icon-accent" />
          <span className="legend-pill-text">Map legend</span>
          {activeCount > 0 && (
            <span className="legend-pill-count">{activeCount}</span>
          )}
        </button>
      </div>
    );
  }

  const hasAnyLayer = activeCount > 0;

  return (
    <aside className="right-legend-panel glass" aria-label="Map legend">
      {/* Legend Header with Explicit Hide Button */}
      <div className="right-legend-header">
        <div className="right-legend-title-group">
          <div className="right-legend-icon-badge">
            <Layers size={13} />
          </div>
          <div className="right-legend-title-text">
            <h2>Map legend</h2>
            <span className="right-legend-subtitle">Cartographic symbology</span>
          </div>
        </div>

        <div className="right-legend-header-actions">
          {activeCount > 0 && (
            <span className="right-legend-active-chip">
              {activeCount} {activeCount === 1 ? 'layer' : 'layers'}
            </span>
          )}
          {/* Explicit Hide Button directly on the legend */}
          <button
            type="button"
            className="right-legend-hide-btn"
            onClick={onToggle}
            title="Hide legend panel"
            aria-label="Hide legend panel"
          >
            <EyeOff size={13} />
            <span>Hide</span>
          </button>
        </div>
      </div>

      {/* Legend Content Body */}
      <div className="right-legend-body">
        {!hasAnyLayer ? (
          <div className="right-legend-empty">
            <Layers size={18} className="empty-icon" />
            <p className="empty-title">No active spatial layers</p>
            <p className="empty-hint">
              Enable layers on the left sidebar to view their symbology and scales here.
            </p>
          </div>
        ) : (
          <>
            {/* SECTION: TRANSIT DESERT HEATMAP */}
            {visibility.transitDesert && (
              <div className={`legend-section ${collapsedSections.desert ? 'is-collapsed' : ''}`}>
                <div
                  className="legend-section-header clickable"
                  onClick={() => toggleSection('desert')}
                  role="button"
                  tabIndex={0}
                  title={collapsedSections.desert ? 'Expand category' : 'Collapse category'}
                >
                  <div className="legend-section-title-wrap">
                    <h3 className="legend-section-title">Transit gap index</h3>
                    <span className="legend-section-sub">Supply − demand deficit (100m grid)</span>
                  </div>
                  <div className="legend-section-header-right">
                    <span className="legend-section-tag tag-desert">Heatmap</span>
                    <button
                      type="button"
                      className="legend-collapse-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection('desert');
                      }}
                      title={collapsedSections.desert ? 'Expand category' : 'Collapse category'}
                      aria-label={collapsedSections.desert ? 'Expand category' : 'Collapse category'}
                    >
                      {collapsedSections.desert ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {!collapsedSections.desert && (
                  <div className="legend-section-content">
                    <div className="legend-desert-list">
                      <div className="legend-desert-row">
                        <span className="desert-swatch" style={{ background: '#b91c1c' }} />
                        <div className="desert-meta">
                          <span className="desert-name">Critical desert</span>
                          <span className="desert-range">&lt; -0.62</span>
                        </div>
                        <span className="desert-pill pill-critical">Severe deficit</span>
                      </div>

                      <div className="legend-desert-row">
                        <span className="desert-swatch" style={{ background: '#f97316' }} />
                        <div className="desert-meta">
                          <span className="desert-name">High deficit</span>
                          <span className="desert-range">-0.62 to -0.44</span>
                        </div>
                        <span className="desert-pill pill-high">High deficit</span>
                      </div>

                      <div className="legend-desert-row">
                        <span className="desert-swatch" style={{ background: '#eab308' }} />
                        <div className="desert-meta">
                          <span className="desert-name">Moderate deficit</span>
                          <span className="desert-range">-0.44 to -0.27</span>
                        </div>
                        <span className="desert-pill pill-mod">Moderate</span>
                      </div>

                      <div className="legend-desert-row">
                        <span className="desert-swatch" style={{ background: '#65a30d' }} />
                        <div className="desert-meta">
                          <span className="desert-name">Accessible</span>
                          <span className="desert-range">-0.27 to -0.07</span>
                        </div>
                        <span className="desert-pill pill-good">Low deficit (27%)</span>
                      </div>

                      <div className="legend-desert-row">
                        <span className="desert-swatch" style={{ background: '#047857' }} />
                        <div className="desert-meta">
                          <span className="desert-name">Transit oasis</span>
                          <span className="desert-range">&gt; -0.07</span>
                        </div>
                        <span className="desert-pill pill-oasis">High supply (9%)</span>
                      </div>
                    </div>

                    <div className="legend-section-footnote">
                      <Info size={11} />
                      <span>Click any 100m cell on map to inspect local score</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION: METRO NETWORK */}
            {(visibility.metroRoutes || visibility.metroStations || visibility.metro) && (
              <div className={`legend-section ${collapsedSections.metro ? 'is-collapsed' : ''}`}>
                <div
                  className="legend-section-header clickable"
                  onClick={() => toggleSection('metro')}
                  role="button"
                  tabIndex={0}
                  title={collapsedSections.metro ? 'Expand category' : 'Collapse category'}
                >
                  <div className="legend-section-title-wrap">
                    <h3 className="legend-section-title">Metro rail network</h3>
                    <span className="legend-section-sub">MahaMetro Lines 1–4 planned &amp; active</span>
                  </div>
                  <div className="legend-section-header-right">
                    <span className="legend-section-tag tag-metro">Rail</span>
                    <button
                      type="button"
                      className="legend-collapse-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection('metro');
                      }}
                      title={collapsedSections.metro ? 'Expand category' : 'Collapse category'}
                      aria-label={collapsedSections.metro ? 'Expand category' : 'Collapse category'}
                    >
                      {collapsedSections.metro ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {!collapsedSections.metro && (
                  <div className="legend-section-content">
                    <div className="legend-items-stack">
                      {(visibility.metroRoutes || visibility.metro) && (
                        <>
                          <div className="legend-line-row">
                            <span className="metro-line-swatch" style={{ background: '#7c3aed' }} />
                            <div className="legend-row-text">
                              <span className="legend-row-title">Line 1: Purple Line</span>
                              <span className="legend-row-detail">PCMC ⇄ Swargate &amp; Ext. (North-South)</span>
                            </div>
                            <span className="metro-status-pill">Operational</span>
                          </div>

                          <div className="legend-line-row">
                            <span className="metro-line-swatch" style={{ background: '#0284c7' }} />
                            <div className="legend-row-text">
                              <span className="legend-row-title">Line 2: Aqua Line</span>
                              <span className="legend-row-detail">Vanaz ⇄ Ramwadi &amp; Ext. (East-West)</span>
                            </div>
                            <span className="metro-status-pill">Operational</span>
                          </div>

                          <div className="legend-line-row">
                            <span className="metro-line-swatch" style={{ background: '#ec4899' }} />
                            <div className="legend-row-text">
                              <span className="legend-row-title">Line 3: Pink Line</span>
                              <span className="legend-row-detail">Shivajinagar ⇄ Hinjawadi IT Park</span>
                            </div>
                            <span className="metro-status-pill">Operational</span>
                          </div>

                          <div className="legend-line-row">
                            <span className="metro-line-swatch" style={{ background: '#f97316' }} />
                            <div className="legend-row-text">
                              <span className="legend-row-title">Line 4 / 4A / 4B: Orange Line</span>
                              <span className="legend-row-detail">Khadakwasla ⇄ Kharadi &amp; Hadapsar</span>
                            </div>
                            <span className="metro-status-pill" style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#dbeafe' }}>Planned</span>
                          </div>
                        </>
                      )}

                      {(visibility.metroStations || visibility.metro) && (
                        <>
                          <div className="legend-line-row">
                            <span className="metro-hub-symbol" />
                            <div className="legend-row-text">
                              <span className="legend-row-title">District Court interchange</span>
                              <span className="legend-row-detail">Lines 1, 2 &amp; 3 transfer hub</span>
                            </div>
                            <span className="metro-hub-pill">Transfer hub</span>
                          </div>

                          <div className="legend-line-row">
                            <span className="metro-station-symbol" />
                            <div className="legend-row-text">
                              <span className="legend-row-title">Metro stations &amp; stops</span>
                              <span className="legend-row-detail">92 planned &amp; operational stations</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION: BUS NETWORK */}
            {(visibility.routes || visibility.stops) && (
              <div className={`legend-section ${collapsedSections.bus ? 'is-collapsed' : ''}`}>
                <div
                  className="legend-section-header clickable"
                  onClick={() => toggleSection('bus')}
                  role="button"
                  tabIndex={0}
                  title={collapsedSections.bus ? 'Expand category' : 'Collapse category'}
                >
                  <div className="legend-section-title-wrap">
                    <h3 className="legend-section-title">Bus transit network</h3>
                    <span className="legend-section-sub">PMPML bus system</span>
                  </div>
                  <div className="legend-section-header-right">
                    <span className="legend-section-tag tag-bus">Bus</span>
                    <button
                      type="button"
                      className="legend-collapse-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection('bus');
                      }}
                      title={collapsedSections.bus ? 'Expand category' : 'Collapse category'}
                      aria-label={collapsedSections.bus ? 'Expand category' : 'Collapse category'}
                    >
                      {collapsedSections.bus ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {!collapsedSections.bus && (
                  <div className="legend-section-content">
                    <div className="legend-items-stack">
                      {visibility.routes && (
                        <div className="legend-line-row">
                          <span className="bus-route-swatch" style={{ background: '#ec4899' }} />
                          <div className="legend-row-text">
                            <span className="legend-row-title">Bus corridors</span>
                            <span className="legend-row-detail">555 active PMPML transit routes</span>
                          </div>
                        </div>
                      )}

                      {visibility.stops && (
                        <div className="legend-line-row">
                          <span className="bus-stop-swatch" style={{ background: '#2563eb' }} />
                          <div className="legend-row-text">
                            <span className="legend-row-title">Bus stops</span>
                            <span className="legend-row-detail">3,319 verified GTFS stops</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION: ADMINISTRATIVE WARDS */}
            {visibility.wards && (
              <div className={`legend-section ${collapsedSections.wards ? 'is-collapsed' : ''}`}>
                <div
                  className="legend-section-header clickable"
                  onClick={() => toggleSection('wards')}
                  role="button"
                  tabIndex={0}
                  title={collapsedSections.wards ? 'Expand category' : 'Collapse category'}
                >
                  <div className="legend-section-title-wrap">
                    <h3 className="legend-section-title">Administrative wards</h3>
                    <span className="legend-section-sub">
                      {thematic === 'corp'
                        ? 'Municipal jurisdiction'
                        : thematic === 'pop'
                        ? 'Census 2026 population density'
                        : 'Transit coverage density'}
                    </span>
                  </div>
                  <div className="legend-section-header-right">
                    <span className="legend-section-tag tag-wards">
                      {thematic === 'corp' ? 'Jurisdiction' : 'Thematic'}
                    </span>
                    <button
                      type="button"
                      className="legend-collapse-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection('wards');
                      }}
                      title={collapsedSections.wards ? 'Expand category' : 'Collapse category'}
                      aria-label={collapsedSections.wards ? 'Expand category' : 'Collapse category'}
                    >
                      {collapsedSections.wards ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {!collapsedSections.wards && (
                  <div className="legend-section-content">
                    {thematic === 'corp' && (
                      <div className="legend-items-stack">
                        {(corpFilter === 'all' || corpFilter === 'PMC') && (
                          <div className="legend-line-row">
                            <span className="ward-swatch" style={{ background: '#7c3aed' }} />
                            <div className="legend-row-text">
                              <span className="legend-row-title">PMC wards</span>
                              <span className="legend-row-detail">Pune Municipal Corporation</span>
                            </div>
                            <span className="ward-count-chip">41 wards</span>
                          </div>
                        )}

                        {(corpFilter === 'all' || corpFilter === 'PCMC') && (
                          <div className="legend-line-row">
                            <span className="ward-swatch" style={{ background: '#059669' }} />
                            <div className="legend-row-text">
                              <span className="legend-row-title">PCMC wards</span>
                              <span className="legend-row-detail">Pimpri Chinchwad Municipal Corp</span>
                            </div>
                            <span className="ward-count-chip">32 wards</span>
                          </div>
                        )}
                      </div>
                    )}

                    {thematic === 'pop' && (
                      <div className="legend-ramp-wrap">
                        <div className="legend-ramp-bar ramp-pop" />
                        <div className="legend-ramp-labels">
                          <span>&lt; 85k</span>
                          <span>125k</span>
                          <span>&gt; 150k / km²</span>
                        </div>
                      </div>
                    )}

                    {thematic === 'transit' && (
                      <div className="legend-ramp-wrap">
                        <div className="legend-ramp-bar ramp-transit" />
                        <div className="legend-ramp-labels">
                          <span>Gap (&lt; 2)</span>
                          <span>6 / km²</span>
                          <span>High (&gt; 12)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION: STREETS & HIGHWAYS */}
            {(visibility.majorRoads || visibility.allRoads) && (
              <div className={`legend-section ${collapsedSections.roads ? 'is-collapsed' : ''}`}>
                <div
                  className="legend-section-header clickable"
                  onClick={() => toggleSection('roads')}
                  role="button"
                  tabIndex={0}
                  title={collapsedSections.roads ? 'Expand category' : 'Collapse category'}
                >
                  <div className="legend-section-title-wrap">
                    <h3 className="legend-section-title">Street &amp; highway network</h3>
                    <span className="legend-section-sub">Roadway infrastructure</span>
                  </div>
                  <div className="legend-section-header-right">
                    <span className="legend-section-tag tag-roads">Roads</span>
                    <button
                      type="button"
                      className="legend-collapse-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection('roads');
                      }}
                      title={collapsedSections.roads ? 'Expand category' : 'Collapse category'}
                      aria-label={collapsedSections.roads ? 'Expand category' : 'Collapse category'}
                    >
                      {collapsedSections.roads ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {!collapsedSections.roads && (
                  <div className="legend-section-content">
                    <div className="legend-items-stack">
                      {visibility.majorRoads && (
                        <div className="legend-line-row">
                          <span className="road-line-swatch" style={{ background: '#d97706' }} />
                          <div className="legend-row-text">
                            <span className="legend-row-title">Primary arterials</span>
                            <span className="legend-row-detail">6,136 major transit corridors</span>
                          </div>
                        </div>
                      )}

                      {visibility.allRoads && (
                        <div className="legend-line-row">
                          <span className="road-line-swatch" style={{ background: '#64748b' }} />
                          <div className="legend-row-text">
                            <span className="legend-row-title">Local street network</span>
                            <span className="legend-row-detail">75,359 municipal roads</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
