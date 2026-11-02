import type { WardMeta, MonthClimate } from '../types';
import { getWardMetric } from '../data/wardMetrics';

/**
 * Extracts and normalizes ward metadata across PMC and PCMC schema differences,
 * strictly backed by the authoritative new_metrics_table with rounded up population values.
 */
export function extractWardMeta(properties: Record<string, any>): WardMeta {
  const p = properties || {};
  const isPcmc = Boolean(
    p.Corporation === 'PCMC' ||
    p.Pimpri_Chinchwad_townname === 'Pimpri Chinchwad' ||
    p.Pimpri_Chinchwad_layer === 'PCMC' ||
    p.PCMC_ward_wisepop_data_v3_csv_PCMC_Ward___Area_Name
  );

  const corp: 'PMC' | 'PCMC' = isPcmc ? 'PCMC' : 'PMC';

  const rawWardNo: string | number =
    p.Ward_No ||
    (isPcmc
      ? p.Pimpri_Chinchwad_sourcewa_1 || p.PCMC_ward_wisepop_data_v3_csv_Ward_No || ''
      : p.PMC_wards_2025_xlsx___PMC_41_Wards_2025_Population_csv_Ward_No || p.Polygons_WardNumber || '');

  const metric = getWardMetric(corp, rawWardNo);

  const wardName = metric
    ? metric.wardName
    : p.Ward_Name ||
      (isPcmc
        ? p.PCMC_ward_wisepop_data_v3_csv_PCMC_Ward___Area_Name || `PCMC Ward ${rawWardNo}`
        : p.PMC_wards_2025_xlsx___PMC_41_Wards_2025_Population_csv_Ward_Name || `PMC Ward ${rawWardNo}`);

  const wardNo = metric ? metric.wardNo : rawWardNo;

  // Accurate rounded up population values from new_metrics_table
  const censusPop2026 = metric
    ? Math.ceil(metric.censusPop2026)
    : Math.ceil(Number(p.Census_Pop_2026 || p.Polygons_Pop_2026 || 0));

  const worldPop2020 = metric
    ? Math.ceil(metric.worldPop2020)
    : Math.ceil(Number(p.WorldPop_Pop_2020 || p.population || 0));

  // Primary rounded up population: Census 2026
  const population = censusPop2026 > 0 ? censusPop2026 : worldPop2020;
  const pop2026 = censusPop2026;

  const areaKm2Num = metric
    ? metric.areaKm2
    : Number(p.Area_SqKm) || (p.Shape_Area || p.Pimpri_Chinchwad_st_area_sh || 0) / 1_000_000;
  const areaKm2 = areaKm2Num > 0 ? areaKm2Num.toFixed(2) : 'N/A';
  const areaSqM = areaKm2Num * 1_000_000;
  const areaAcres = Math.round(areaSqM * 0.000247105);

  const popDensityCensus = metric
    ? metric.popDensityCensus
    : areaKm2Num > 0
    ? Math.ceil(censusPop2026 / areaKm2Num)
    : 0;

  const popDensityWorldPop = metric
    ? metric.popDensityWorldPop
    : areaKm2Num > 0
    ? Math.ceil(worldPop2020 / areaKm2Num)
    : 0;

  const busStopsCount = metric ? metric.busStops : Number(p.Bus_Stops) || 0;
  const metroStopsCount = metric ? metric.metroStops : Number(p.Metro_Stops) || 0;

  const growthPct =
    worldPop2020 > 0 && censusPop2026 > 0
      ? `${(((censusPop2026 - worldPop2020) / worldPop2020) * 100).toFixed(1)}%`
      : 'N/A';

  const transitDensity = areaKm2Num > 0 ? (busStopsCount / areaKm2Num).toFixed(1) : '0';

  // Shape length in km
  const lengthM = p.Shape_Length || p.Pimpri_Chinchwad_st_length_ || 0;
  const lengthKm = (lengthM / 1000).toFixed(2);

  // Vulnerability & Climate (PCMC)
  const vulnLevel = p.AMJ_Vulner || p.Pimpri_Chinchwad_AMJ_Vulner || 'N/A';
  const amjMeanTemp =
    p.AMJ_mean || p.Pimpri_Chinchwad_AMJ_mean
      ? Number(p.AMJ_mean || p.Pimpri_Chinchwad_AMJ_mean).toFixed(1)
      : null;

  return {
    id: p.OBJECTID || `${corp}_${wardNo}`,
    isPcmc,
    corp,
    wardName,
    wardNo,
    censusPop2026,
    worldPop2020,
    population,
    pop2026,
    popDensityCensus,
    popDensityWorldPop,
    busStopsCount,
    metroStopsCount,
    areaKm2,
    areaAcres,
    areaSqM,
    growthPct,
    transitDensity,
    lengthKm,
    lengthM,
    vulnLevel,
    amjMeanTemp,
    raw: p,
  };
}

/**
 * Extracts 8-month climate metrics for wards that contain surface temperature records
 */
export function extractClimateData(p: Record<string, any>): MonthClimate[] | null {
  const hasClimate = p.Pimpri_Chinchwad_Apr_mean || p.Apr_mean;
  if (!hasClimate) return null;

  const getMean = (m: string) => p[`${m}_mean`] || p[`Pimpri_Chinchwad_${m}_mean`];
  const getMin = (m: string) => p[`${m}_min`] || p[`Pimpri_Chinchwad_${m}_min`];
  const getMax = (m: string) => p[`${m}_max`] || p[`Pimpri_Chinchwad_${m}_max`];

  return [
    { key: 'Jan', name: 'January', mean: getMean('Jan'), min: getMin('Jan'), max: getMax('Jan') },
    { key: 'Feb', name: 'February', mean: getMean('Feb'), min: getMin('Feb'), max: getMax('Feb') },
    { key: 'Mar', name: 'March', mean: getMean('Mar'), min: getMin('Mar'), max: getMax('Mar') },
    { key: 'Apr', name: 'April', mean: getMean('Apr'), min: getMin('Apr'), max: getMax('Apr') },
    { key: 'May', name: 'May', mean: getMean('May'), min: getMin('May'), max: getMax('May') },
    { key: 'Jun', name: 'June', mean: getMean('Jun'), min: getMin('Jun'), max: getMax('Jun') },
    { key: 'Oct', name: 'October', mean: getMean('Oct'), min: getMin('Oct'), max: getMax('Oct') },
    { key: 'Nov', name: 'November', mean: getMean('Nov'), min: getMin('Nov'), max: getMax('Nov') },
  ];
}

/**
 * Fast ray-casting point-in-polygon algorithm to associate points with polygons
 */
function isPointInRing(point: [number, number], ring: number[][]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  const n = ring.length;
  let p1x = ring[0][0];
  let p1y = ring[0][1];

  for (let i = 1; i <= n; i++) {
    const p2x = ring[i % n][0];
    const p2y = ring[i % n][1];

    if (y > Math.min(p1y, p2y)) {
      if (y <= Math.max(p1y, p2y)) {
        if (x <= Math.max(p1x, p2x)) {
          let xints = p1x;
          if (p1y !== p2y) {
            xints = ((y - p1y) * (p2x - p1x)) / (p2y - p1y) + p1x;
          }
          if (p1x === p2x || x <= xints) {
            inside = !inside;
          }
        }
      }
    }
    p1x = p2x;
    p1y = p2y;
  }
  return inside;
}

export function isPointInPolygonGeom(point: [number, number], geometry: any): boolean {
  if (!geometry || !geometry.coordinates) return false;
  const type = geometry.type;
  const coords = geometry.coordinates;

  if (type === 'Polygon') {
    return isPointInRing(point, coords[0]);
  } else if (type === 'MultiPolygon') {
    for (let i = 0; i < coords.length; i++) {
      if (isPointInRing(point, coords[i][0])) {
        return true;
      }
    }
  }
  return false;
}

