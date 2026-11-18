import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Search, X, Activity } from 'lucide-react';
import type { WardMeta } from '../types';
import { AnimatedLogo } from './AnimatedLogo';

interface HeaderProps {
  wards: WardMeta[];
  onSelectWard: (ward: WardMeta) => void;
  onPuneView: () => void;
  onOpenGapModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wards,
  onSelectWard,
  onPuneView,
  onOpenGapModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <header className="top-nav">
      {/* Brand Lockup */}
      <AnimatedLogo onOpenGapModal={onOpenGapModal} />

      {/* Ward Search Input */}
      <div className="search-container" ref={containerRef}>
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search 73 wards by name or number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            aria-label="Search wards"
          />
          <kbd className="search-kbd-hint">⌘K</kbd>
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              title="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && searchQuery.trim() && (
          <div className="search-results">
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
                    <span className="search-item-sub">Ward {w.wardNo || 'N/A'}</span>
                  </div>
                  <span className="search-item-corp">{w.corp}</span>
                </div>
              ))
            ) : (
              <div className="search-empty">No wards match "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="nav-actions">
        <button
          className="btn btn-outline"
          onClick={onOpenGapModal}
          title="Open municipal equity and transit gap analysis"
          type="button"
        >
          <Activity size={15} />
          <span>Gap Analysis</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={onPuneView}
          title="Zoom to Pune Metropolitan Area"
          type="button"
        >
          <Crosshair size={15} />
          <span>Pune View</span>
        </button>
      </div>
    </header>
  );
};
