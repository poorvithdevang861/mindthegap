import React from 'react';
import { Building2, Users, Bus, Route, Milestone } from 'lucide-react';

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
    <div className="bottom-stats-bar glass">
      <div className="stat-chip">
        <Building2 size={13} color="#2563eb" />
        <span>
          Wards: <strong>{wardCount}</strong>
        </span>
      </div>
      <div className="stat-chip">
        <Users size={13} color="#7c3aed" />
        <span>
          Total Pop: <strong>{(totalPopulation / 1_000_000).toFixed(2)}M</strong>
        </span>
      </div>
      <div className="stat-chip">
        <Bus size={13} color="#059669" />
        <span>
          Stops: <strong>{stopCount.toLocaleString()}</strong>
        </span>
      </div>
      <div className="stat-chip">
        <Route size={13} color="#ec4899" />
        <span>
          Routes: <strong>{routeCount}</strong>
        </span>
      </div>
      <div className="stat-chip">
        <Milestone size={13} color="#f59e0b" />
        <span>
          Road Segments: <strong>{roadCount.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
};

