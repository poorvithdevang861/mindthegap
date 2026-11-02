import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  dotColor?: string;
}

interface CustomDropdownProps {
  label: string;
  icon?: React.ReactNode;
  headerBadge?: string;
  value: string;
  onChange: (value: any) => void;
  options: DropdownOption[];
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  icon,
  headerBadge,
  value,
  onChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <div className="custom-dropdown-container" ref={containerRef}>
      {/* Label Row */}
      <div className="custom-dropdown-label-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon}
          <span className="custom-dropdown-label-text">{label}</span>
        </div>
        {headerBadge && <span className="select-pill-badge">{headerBadge}</span>}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {selectedOption.dotColor && (
            <span
              className="dropdown-dot"
              style={{ background: selectedOption.dotColor }}
            />
          )}
          <span className="custom-dropdown-value-text">{selectedOption.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`custom-dropdown-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {/* Styled Floating Menu (Not default OS select menu) */}
      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  {opt.dotColor && (
                    <span
                      className="dropdown-dot"
                      style={{ background: opt.dotColor }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="dropdown-item-title">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="dropdown-item-sublabel">{opt.sublabel}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {opt.badge && <span className="dropdown-item-badge">{opt.badge}</span>}
                  {isSelected && <Check size={14} color="#2563eb" style={{ flexShrink: 0 }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

