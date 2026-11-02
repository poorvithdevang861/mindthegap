import type { Feature, FeatureCollection, Geometry } from 'geojson';

export interface WardMeta {
  id: string | number;
  isPcmc: boolean;
  corp: 'PMC' | 'PCMC';
  wardName: string;
  wardNo: string | number;
  // Accurate rounded up population metrics
  censusPop2026: number;
  worldPop2020: number;
  population: number; // Primary rounded up population (Census 2026)
  pop2026: number; // Alias for Census 2026
  popDensityCensus: number; // Rounded people / sq km (Census 2026)
  popDensityWorldPop: number; // Rounded people / sq km (WorldPop 2020)
  busStopsCount: number; // Official bus stops in ward
  metroStopsCount: number; // Official metro stations in ward
  areaKm2: string | number; // Accurate geographic land area (sq km)
  areaAcres: number;
  areaSqM: number;
  growthPct: string; // % growth between 2020 WorldPop and 2026 Census
  transitDensity: string; // Bus stops per sq km
  lengthKm: string;
  lengthM: number;
  vulnLevel: string;
  amjMeanTemp: string | null;
  raw: Record<string, any>;
}

export interface BusStop {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
}

export interface LayerVisibility {
  wards: boolean;
  stops: boolean;
  routes: boolean;
  metro: boolean;
  majorRoads: boolean;
  allRoads: boolean;
}

export type ThematicOption = 'corp' | 'pop' | 'vuln';
export type BasemapOption = 'positron' | 'osm' | 'dark' | 'satellite';
export type CorpFilter = 'all' | 'PMC' | 'PCMC';

export interface MonthClimate {
  key: string;
  name: string;
  mean: number;
  min: number;
  max: number;
}

