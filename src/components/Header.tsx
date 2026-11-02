import React, { useState, useEffect, useRef } from 'react';
import { Globe, Crosshair, Search, X, Activity } from 'lucide-react';
import type { WardMeta } from '../types';
import { AnimatedLogo } from './AnimatedLogo';

interface HeaderProps {
  wards: WardMeta[];
  onSelectWard: (ward: WardMeta) => void;
  onIndiaView: () => void;
  onPuneView: () => void;
  onOpenGapModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wards,
  onSelectWard,
  onIndiaView,
  onPuneView,
  onOpenGapModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredWards = searchQuery.trim()
    ? wards
        .filter((w) => {
          const q = searchQuery.toLowerCase();
          return (
            w.wardName.toLowerCase().includes(q) ||
            String(w.wardNo).toLowerCase().includes(q) ||
            w.corp.toLowerCase().includes(q)
          );
        })
        .slice(0, 10)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-nav glass-nav">
      {/* Row 1: Centered "MIND THE GAP" in Solid Stylish Color */}
      <div className="header-row-top">
        <AnimatedLogo onOpenGapModal={onOpenGapModal} />
      </div>

      {/* Separator DIV to cleanly partition the title and navbar */}
      <div className="header-nav-divider" />

      {/* Row 2: Search Bar and Navigation Actions Below the Divider */}
      <div className="header-row-bottom">
        {/* Ward Search Input */}
        <div className="search-container" ref={containerRef}>
          <div className="search-input-wrapper">
            <Search size={14} color="#2563eb" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search 73 wards (e.g. Kalyani Nagar, Talwade, Ward 5)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            <div className="search-kbd-hint">⌘K</div>
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setIsOpen(false);
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {isOpen && searchQuery.trim() && (
            <div className="search-results glass-dropdown">
              {filteredWards.length > 0 ? (
                filteredWards.map((w) => (
                  <div
                    key={w.id}
                    className="search-item"
                    onClick={() => {
                      onSelectWard(w);
                      setSearchQuery(w.wardName);
                      setIsOpen(false);
                    }}
                  >
                    <div>
                      <strong>{w.wardName}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                        (Ward {w.wardNo || 'N/A'})
                      </span>
                    </div>
                    <span className={`hover-badge ${w.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`}>
                      {w.corp}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
                  No wards match "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="nav-actions">
          <button
            className="btn btn-gap-accent"
            onClick={onOpenGapModal}
            title="Open Mind the GAP Disparity & Equity Analysis"
          >
            <Activity size={14} />
            <span>Gap Insights</span>
          </button>

          <button className="btn btn-nav-glass" onClick={onIndiaView} title="Zoom out to whole India view">
            <Globe size={14} />
            <span>India View</span>
          </button>

          <button className="btn btn-nav-primary" onClick={onPuneView} title="Zoom to Pune Metropolitan Wards">
            <Crosshair size={14} />
            <span>Pune Wards</span>
          </button>
        </div>
      </div>
    </header>
  );
};
