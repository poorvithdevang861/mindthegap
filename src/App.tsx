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
  const [metroRoutesData, setMetroRoutesData] = useState<FeatureCollection | null>(null);
  const [metroStationsData, setMetroStationsData] = useState<FeatureCollection | null>(null);
  const [majorRoadsData, setMajorRoadsData] = useState<FeatureCollection | null>(null);
  const [allRoadsData, setAllRoadsData] = useState<FeatureCollection | null>(null);
  const [transitDesertGridData, setTransitDesertGridData] = useState<any | null>(null);

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
    metroRoutes: false,
    metroStations: false,
    majorRoads: false,
    allRoads: false,
    transitDesert: false,
  });

  const [thematic, setThematic] = useState<ThematicOption>('corp');
  const [corpFilter, setCorpFilter] = useState<CorpFilter>('all');
  const [mapAction, setMapAction] = useState<{ type: 'india' | 'pune' | 'ward'; timestamp: number } | null>(null);

  // Load Data on Startup
  useEffect(() => {
    async function loadData() {
      try {
        const base = import.meta.env.BASE_URL;
        setLoadingMessage('Loading Pune municipal boundaries & transit layers...');

        const [wardsRes, stopsRes, routesRes, roadsRes, metroRoutesRes, metroStationsRes] =
          await Promise.all([
            fetch(`${base}Full_Pune_1 (1).geojson`),
            fetch(`${base}GTFS.geojson`),
            fetch(`${base}GTFSRoutes.geojson`),
            fetch(`${base}PuneRoads_Major.geojson`),
            fetch(`${base}Metro_Routes.geojson`),
            fetch(`${base}Metro_Stations.geojson`),
          ]);

        const [wardsJson, stopsJson, routesJson, roadsJson, metroRoutesJson, metroStationsJson] =
          await Promise.all([
            wardsRes.json(),
            stopsRes.json(),
            routesRes.json(),
            roadsRes.json(),
            metroRoutesRes.json(),
            metroStationsRes.json(),
          ]);

        setWardsData(wardsJson);
        setStopsData(stopsJson);
        setRoutesData(routesJson);
        setMajorRoadsData(roadsJson);
        setMetroRoutesData(metroRoutesJson);
        setMetroStationsData(metroStationsJson);

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load spatial layers:', err);
        setLoadingMessage(`Error loading layers: ${err.message}`);
      }
    }

    loadData();
  }, []);

  // Lazy load 50MB allRoads layer or 780KB transit desert grid when toggled
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

      if (key === 'transitDesert' && !visibility.transitDesert && !transitDesertGridData) {
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}transit_desert_grid.json`);
          const data = await res.json();
          setTransitDesertGridData(data);
        } catch (err: any) {
          console.error('Could not load transit desert grid data:', err);
        }
      }

      setVisibility((prev) => {
        if (key === 'metro') {
          const next = !(prev.metroStations || prev.metroRoutes);
          return {
            ...prev,
            metro: next,
            metroStations: next,
            metroRoutes: next,
          };
        }
        return {
          ...prev,
          [key]: !prev[key],
        };
      });
    },
    [visibility.allRoads, visibility.transitDesert, allRoadsData, transitDesertGridData]
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
      metroRoutes: false,
      metroStations: false,
      majorRoads: false,
      allRoads: false,
      transitDesert: false,
    });
    setThematic('corp');
    setCorpFilter('all');
    setSelectedWard(null);
    setSelectedFeature(null);
    setHoveredWard(null);
    setMapAction({ type: 'pune', timestamp: Date.now() });
  }, []);

  // Ensure viewport scroll is always anchored to top left (prevent scroll displacement)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedWard]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
        metroRoutesData={metroRoutesData}
        metroStationsData={metroStationsData}
        majorRoadsData={majorRoadsData}
        allRoadsData={allRoadsData}
        transitDesertGridData={transitDesertGridData}
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
