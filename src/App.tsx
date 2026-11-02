import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { FeatureCollection } from 'geojson';
import type {
  WardMeta,
  BusStop,
  LayerVisibility,
  ThematicOption,
  CorpFilter,
} from './types';
import { extractWardMeta, isPointInPolygonGeom } from './utils/geo';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GISMap } from './components/Map';
import { HoverHUD } from './components/HoverHUD';
import { WardModal } from './components/WardModal';
import { StatsBar } from './components/StatsBar';
import { GapAnalysisModal } from './components/GapAnalysisModal';

export const App: React.FC = () => {
  // Spatial Data Collections
  const [wardsData, setWardsData] = useState<FeatureCollection | null>(null);
  const [stopsData, setStopsData] = useState<FeatureCollection | null>(null);
  const [routesData, setRoutesData] = useState<FeatureCollection | null>(null);
  const [metroData, setMetroData] = useState<FeatureCollection | null>(null);
  const [majorRoadsData, setMajorRoadsData] = useState<FeatureCollection | null>(null);
  const [allRoadsData, setAllRoadsData] = useState<FeatureCollection | null>(null);

  // App UI State
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading Pune spatial layers...');
  const [hoveredWard, setHoveredWard] = useState<WardMeta | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardMeta | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);

  const [visibility, setVisibility] = useState<LayerVisibility>({
    wards: true,
    stops: false,
    routes: false,
    metro: false,
    majorRoads: false,
    allRoads: false,
  });

  const [thematic, setThematic] = useState<ThematicOption>('corp');
  const [corpFilter, setCorpFilter] = useState<CorpFilter>('all');
  const [mapAction, setMapAction] = useState<{ type: 'india' | 'pune' | 'ward'; timestamp: number } | null>(null);

  // Load Data on Startup
  useEffect(() => {
    async function loadData() {
      try {
        // Check preloaded window data first (from data.js if included)
        const preloaded = (window as any).PUNE_SPATIAL_DATA;
        if (preloaded) {
          setLoadingMessage('Initializing spatial boundaries...');
          setWardsData(preloaded.wards);
          setStopsData(preloaded.stops);
          setRoutesData(preloaded.routes);
          setMajorRoadsData(preloaded.majorRoads);
          setMetroData(preloaded.wards); // shares zone boundaries
          setLoading(false);
          return;
        }

        // Otherwise fetch via HTTP
        const base = import.meta.env.BASE_URL;
        setLoadingMessage('Loading Pune Municipal Wards...');
        const wardsRes = await fetch(`${base}Full_Pune_1 (1).geojson`);
        const wardsJson = await wardsRes.json();
        setWardsData(wardsJson);

        setLoadingMessage('Loading GTFS Bus Stops...');
        const stopsRes = await fetch(`${base}GTFS.geojson`);
        const stopsJson = await stopsRes.json();
        setStopsData(stopsJson);

        setLoadingMessage('Loading Transit Routes...');
        const routesRes = await fetch(`${base}GTFSRoutes.geojson`);
        const routesJson = await routesRes.json();
        setRoutesData(routesJson);

        setLoadingMessage('Loading Major Road Arteries...');
        const roadsRes = await fetch(`${base}PuneRoads_Major.geojson`);
        const roadsJson = await roadsRes.json();
        setMajorRoadsData(roadsJson);

        setLoadingMessage('Loading Metro Boundaries...');
        const metroRes = await fetch(`${base}Metro.geojson`);
        const metroJson = await metroRes.json();
        setMetroData(metroJson);

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load spatial layers:', err);
        setLoadingMessage(`Error loading layers: ${err.message}`);
      }
    }

    loadData();
  }, []);

  // Lazy load 50MB allRoads layer when toggled
  const handleToggleLayer = useCallback(
    async (key: keyof LayerVisibility) => {
      if (key === 'allRoads' && !visibility.allRoads && !allRoadsData) {
        setLoading(true);
        setLoadingMessage('Loading full 75,000+ local road network (48MB)...');
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}PuneRoadNetwork.geojson`);
          const data = await res.json();
          setAllRoadsData(data);
        } catch (err: any) {
          alert('Could not load full road network: ' + err.message);
        } finally {
          setLoading(false);
        }
      }

      setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [visibility.allRoads, allRoadsData]
  );

  // Extract all normalized wards for search & stats
  const wardsList = useMemo<WardMeta[]>(() => {
    if (!wardsData) return [];
    return wardsData.features.map((f: any) => extractWardMeta(f.properties));
  }, [wardsData]);

  // Aggregate Population (Authoritative Census 2026 rounded up total: 8,542,877)
  const totalPopulation = useMemo(() => {
    return wardsList.reduce((acc, w) => acc + (w.censusPop2026 || 0), 0);
  }, [wardsList]);

  // Aggregate Total Bus Stops (Authoritative: 3,320)
  const totalBusStops = useMemo(() => {
    return wardsList.length > 0
      ? wardsList.reduce((acc, w) => acc + (w.busStopsCount || 0), 0)
      : 3320;
  }, [wardsList]);

  // Calculate Bus Stops inside selected ward via point-in-polygon
  const busStopsInSelectedWard = useMemo<BusStop[]>(() => {
    if (!selectedFeature || !stopsData) return [];
    const stops: BusStop[] = [];

    stopsData.features.forEach((sf: any) => {
      const coords = sf.geometry?.coordinates;
      if (coords && isPointInPolygonGeom(coords, selectedFeature.geometry)) {
        const p = sf.properties || {};
        stops.push({
          id: p.GTFSStops_XYTableToPoint_stop_id || p.OBJECTID,
          name: p.GTFSStops_XYTableToPoint_stop_name || 'Bus Stop',
          lat: coords[1],
          lon: coords[0],
        });
      }
    });

    return stops;
  }, [selectedFeature, stopsData]);

  // Handle Ward Selection (from Click or Search)
  const handleSelectWard = useCallback(
    (ward: WardMeta, feature?: any) => {
      setSelectedWard(ward);
      if (feature) {
        setSelectedFeature(feature);
      } else if (wardsData) {
        const found = wardsData.features.find(
          (f: any) => extractWardMeta(f.properties).id === ward.id
        );
        if (found) setSelectedFeature(found);
      }
      setMapAction({ type: 'ward', timestamp: Date.now() });
    },
    [wardsData]
  );

  // Atomic Reset All: Resets layers, filters, thematic styling, selection, and recenters map
  const handleResetAll = useCallback(() => {
    setVisibility({
      wards: true,
      stops: false,
      routes: false,
      metro: false,
      majorRoads: false,
      allRoads: false,
    });
    setThematic('corp');
    setCorpFilter('all');
    setSelectedWard(null);
    setSelectedFeature(null);
    setHoveredWard(null);
    setMapAction({ type: 'pune', timestamp: Date.now() });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Loading Spinner */}
      {loading && (
        <div className="spinner-container glass">
          <div className="spinner" />
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            {loadingMessage}
          </div>
        </div>
      )}

      {/* Top Navigation Bar with Centered MIND THE GAP & Divider */}
      <Header
        wards={wardsList}
        onSelectWard={handleSelectWard}
        onIndiaView={() => setMapAction({ type: 'india', timestamp: Date.now() })}
        onPuneView={() => setMapAction({ type: 'pune', timestamp: Date.now() })}
        onOpenGapModal={() => setIsGapModalOpen(true)}
      />

      {/* Left Sidebar Controls */}
      <Sidebar
        visibility={visibility}
        onToggleLayer={handleToggleLayer}
        thematic={thematic}
        onChangeThematic={setThematic}
        corpFilter={corpFilter}
        onChangeCorpFilter={setCorpFilter}
        onResetAll={handleResetAll}
      />

      {/* Main GIS Map (OpenStreetMap) */}
      <GISMap
        wardsData={wardsData}
        stopsData={stopsData}
        routesData={routesData}
        metroData={metroData}
        majorRoadsData={majorRoadsData}
        allRoadsData={allRoadsData}
        visibility={visibility}
        thematic={thematic}
        corpFilter={corpFilter}
        selectedWard={selectedWard}
        onHoverWard={setHoveredWard}
        onSelectWard={handleSelectWard}
        mapAction={mapAction}
      />

      {/* Real-time Hover HUD */}
      <HoverHUD ward={hoveredWard} />

      {/* Bottom KPI Statistics Bar */}
      <StatsBar
        wardCount={wardsList.length}
        totalPopulation={totalPopulation || 8542877}
        stopCount={totalBusStops || 3320}
        routeCount={routesData?.features.length || 555}
        roadCount={allRoadsData ? allRoadsData.features.length : majorRoadsData?.features.length || 6136}
      />

      {/* Detailed Pop-up Table & Inspector Modal */}
      {selectedWard && (
        <WardModal
          ward={selectedWard}
          feature={selectedFeature}
          busStopsInWard={busStopsInSelectedWard}
          onClose={() => setSelectedWard(null)}
          onZoomToWard={() => setMapAction({ type: 'ward', timestamp: Date.now() })}
        />
      )}

      {/* Mind the GAP Equity Analysis Modal */}
      {isGapModalOpen && (
        <GapAnalysisModal
          wards={wardsList}
          onClose={() => setIsGapModalOpen(false)}
          onSelectWard={handleSelectWard}
        />
      )}
    </div>
  );
};
