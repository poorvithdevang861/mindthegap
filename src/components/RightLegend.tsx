import React from 'react';
import { Layers, X, ChevronRight, Info } from 'lucide-react';
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
          title="Open map legend"
          aria-label="Open map legend"
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
      {/* Legend Header */}
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
          <button
            type="button"
            className="right-legend-close-btn"
            onClick={onToggle}
            title="Collapse legend panel"
            aria-label="Collapse legend panel"
          >
            <ChevronRight size={14} />
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
              <div className="legend-section">
                <div className="legend-section-header">
                  <div>
                    <h3 className="legend-section-title">Transit gap index</h3>
                    <span className="legend-section-sub">Supply − demand deficit (100m grid)</span>
                  </div>
                  <span className="legend-section-tag tag-desert">Heatmap</span>
                </div>

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
                  <span>Click any 100m cell on the map to inspect local score</span>
                </div>
              </div>
            )}

            {/* SECTION: METRO NETWORK */}
            {(visibility.metroRoutes || visibility.metroStations || visibility.metro) && (
              <div className="legend-section">
                <div className="legend-section-header">
                  <div>
                    <h3 className="legend-section-title">Metro rail network</h3>
                    <span className="legend-section-sub">MahaMetro Phase 1 corridors</span>
                  </div>
                  <span className="legend-section-tag tag-metro">Rail</span>
                </div>

                <div className="legend-items-stack">
                  {(visibility.metroRoutes || visibility.metro) && (
                    <>
                      <div className="legend-line-row">
                        <span className="metro-line-swatch" style={{ background: '#7c3aed' }} />
                        <div className="legend-row-text">
                          <span className="legend-row-title">Line 1: Purple Line</span>
                          <span className="legend-row-detail">PCMC ⇄ Swargate (North-South)</span>
                        </div>
                        <span className="metro-status-pill">Operational</span>
                      </div>

                      <div className="legend-line-row">
                        <span className="metro-line-swatch" style={{ background: '#0284c7' }} />
                        <div className="legend-row-text">
                          <span className="legend-row-title">Line 2: Aqua Line</span>
                          <span className="legend-row-detail">Vanaz ⇄ Ramwadi (East-West)</span>
                        </div>
                        <span className="metro-status-pill">Operational</span>
                      </div>
                    </>
                  )}

                  {(visibility.metroStations || visibility.metro) && (
                    <>
                      <div className="legend-line-row">
                        <span className="metro-hub-symbol" />
                        <div className="legend-row-text">
                          <span className="legend-row-title">District Court interchange</span>
                          <span className="legend-row-detail">Lines 1 &amp; 2 transfer hub</span>
                        </div>
                        <span className="metro-hub-pill">Transfer hub</span>
                      </div>

                      <div className="legend-line-row">
                        <span className="metro-station-symbol" />
                        <div className="legend-row-text">
                          <span className="legend-row-title">Operational stations</span>
                          <span className="legend-row-detail">28 elevated &amp; underground stops</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: BUS NETWORK */}
            {(visibility.routes || visibility.stops) && (
              <div className="legend-section">
                <div className="legend-section-header">
                  <div>
                    <h3 className="legend-section-title">Bus transit network</h3>
                    <span className="legend-section-sub">PMPML bus system</span>
                  </div>
                  <span className="legend-section-tag tag-bus">Bus</span>
                </div>

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

            {/* SECTION: ADMINISTRATIVE WARDS */}
            {visibility.wards && (
              <div className="legend-section">
                <div className="legend-section-header">
                  <div>
                    <h3 className="legend-section-title">Administrative wards</h3>
                    <span className="legend-section-sub">
                      {thematic === 'corp'
                        ? 'Municipal jurisdiction'
                        : thematic === 'pop'
                        ? 'Census 2026 population density'
                        : 'Transit coverage density'}
                    </span>
                  </div>
                  <span className="legend-section-tag tag-wards">
                    {thematic === 'corp' ? 'Jurisdiction' : 'Thematic'}
                  </span>
                </div>

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

            {/* SECTION: STREETS & HIGHWAYS */}
            {(visibility.majorRoads || visibility.allRoads) && (
              <div className="legend-section">
                <div className="legend-section-header">
                  <div>
                    <h3 className="legend-section-title">Street &amp; highway network</h3>
                    <span className="legend-section-sub">Roadway infrastructure</span>
                  </div>
                  <span className="legend-section-tag tag-roads">Roads</span>
                </div>

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
          </>
        )}
      </div>
    </aside>
  );
};
