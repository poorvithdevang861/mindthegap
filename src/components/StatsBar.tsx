import React from 'react';
import { LandPlot, Users, BusFront, Route, Milestone } from 'lucide-react';

interface StatsBarProps {
  wardCount: number;
  totalPopulation: number;
  stopCount: number;
  routeCount: number;
  roadCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  wardCount,
  totalPopulation,
  stopCount,
  routeCount,
  roadCount,
}) => {
  return (
    <div className="bottom-stats-bar">
      <div className="stat-chip">
        <LandPlot size={14} className="stat-icon" />
        <span className="stat-label">Wards</span>
        <span className="stat-num">{wardCount}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-chip">
        <Users size={14} className="stat-icon" />
        <span className="stat-label">Population</span>
        <span className="stat-num">{(totalPopulation / 1_000_000).toFixed(2)}M</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-chip">
        <BusFront size={14} className="stat-icon" />
        <span className="stat-label">Bus Stops</span>
        <span className="stat-num">{stopCount.toLocaleString()}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-chip">
        <Route size={14} className="stat-icon" />
        <span className="stat-label">Transit Routes</span>
        <span className="stat-num">{routeCount}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-chip">
        <Milestone size={14} className="stat-icon" />
        <span className="stat-label">Road Segments</span>
        <span className="stat-num">{roadCount.toLocaleString()}</span>
      </div>
    </div>
  );
};
