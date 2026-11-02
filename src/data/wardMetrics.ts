import metricsJson from './wardMetricsData.json';

export interface WardMetricEntry {
  wardName: string;
  corp: 'PMC' | 'PCMC';
  wardNo: number;
  busStops: number;
  metroStops: number;
  censusPop2026: number;
  worldPop2020: number;
  areaKm2: number;
  popDensityCensus: number;
  popDensityWorldPop: number;
}

export const WARD_METRICS_MAP: Record<string, WardMetricEntry> = metricsJson as Record<
  string,
  WardMetricEntry
>;

export function getWardMetric(corp: string, wardNo: number | string): WardMetricEntry | undefined {
  const num = parseInt(String(wardNo), 10);
  if (isNaN(num)) return undefined;
  const key = `${corp.toUpperCase()}_${num}`;
  return WARD_METRICS_MAP[key];
}

