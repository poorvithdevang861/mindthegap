import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FeatureCollection } from 'geojson';
import type {
  WardMeta,
  LayerVisibility,
  ThematicOption,
  CorpFilter,
  BasemapOption,
  BusStop,
} from '../types';
import { extractWardMeta } from '../utils/geo';

interface MapProps {
  wardsData: FeatureCollection | null;
  stopsData: FeatureCollection | null;
  routesData: FeatureCollection | null;
  metroData: FeatureCollection | null;
  majorRoadsData: FeatureCollection | null;
  allRoadsData: FeatureCollection | null;
  visibility: LayerVisibility;
  thematic: ThematicOption;
  corpFilter: CorpFilter;
  selectedWard: WardMeta | null;
  onHoverWard: (ward: WardMeta | null) => void;
  onSelectWard: (ward: WardMeta, feature: any) => void;
  mapAction: { type: 'india' | 'pune' | 'ward'; timestamp: number } | null;
}

export const GISMap: React.FC<MapProps> = ({
  wardsData,
  stopsData,
  routesData,
  metroData,
  majorRoadsData,
  allRoadsData,
  visibility,
  thematic,
  corpFilter,
  selectedWard,
  onHoverWard,
  onSelectWard,
  mapAction,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Layer references
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.GeoJSON | null>(null);
  const metroLayerRef = useRef<L.GeoJSON | null>(null);
  const majorRoadsLayerRef = useRef<L.GeoJSON | null>(null);
  const allRoadsLayerRef = useRef<L.GeoJSON | null>(null);

  // Track ward layers by ID
  const wardFeatureLayersRef = useRef<Map<string | number, L.Layer>>(new Map());
  const initialBoundsSetRef = useRef(false);

  // 1. Initialize Leaflet Map with OpenStreetMap as the dedicated basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.553, 73.864],
      zoom: 11,
      zoomControl: false,
      preferCanvas: true,
    });

    // Single Authoritative Basemap: OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    // Ensure Leaflet computes correct dimensions with the two-tier header
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Render Wards GeoJSON Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !wardsData) return;

    if (wardsLayerRef.current) {
      map.removeLayer(wardsLayerRef.current);
      wardFeatureLayersRef.current.clear();
    }

    const getStyle = (feature: any) => {
      const meta = extractWardMeta(feature.properties);
      let fillColor = '#7c3aed';
      let fillOpacity = 0.45;
      let strokeColor = '#ffffff';
      let weight = 1.2;

      if (thematic === 'corp') {
        fillColor = meta.corp === 'PCMC' ? '#059669' : '#7c3aed';
      } else if (thematic === 'pop') {
        const p = meta.censusPop2026;
        if (p > 150000) fillColor = '#1e1b4b';
        else if (p > 125000) fillColor = '#4338ca';
        else if (p > 95000) fillColor = '#6366f1';
        else if (p > 85000) fillColor = '#818cf8';
        else fillColor = '#c7d2fe';
        fillOpacity = 0.65;
      } else if (thematic === 'vuln') {
        if (meta.vulnLevel === 'High') {
          fillColor = '#dc2626';
          fillOpacity = 0.65;
        } else if (meta.vulnLevel === 'Medium') {
          fillColor = '#f59e0b';
          fillOpacity = 0.6;
        } else if (meta.vulnLevel === 'Low') {
          fillColor = '#10b981';
          fillOpacity = 0.55;
        } else {
          fillColor = '#94a3b8';
          fillOpacity = 0.25;
        }
      }

      // Filter check
      if (corpFilter !== 'all' && meta.corp !== corpFilter) {
        fillOpacity = 0.05;
        weight = 0.5;
        strokeColor = '#cbd5e1';
      }

      // Selected ward check
      if (selectedWard && selectedWard.id === meta.id) {
        strokeColor = '#2563eb';
        weight = 3.5;
        fillOpacity = Math.min(fillOpacity + 0.25, 0.85);
      }

      return {
        fillColor,
        fillOpacity,
        color: strokeColor,
        weight,
        opacity: 0.9,
      };
    };

    const wardsLayer = L.geoJSON(wardsData, {
      style: getStyle,
      onEachFeature: (feature, layer) => {
        const meta = extractWardMeta(feature.properties);
        wardFeatureLayersRef.current.set(meta.id, layer);

        layer.on({
          mouseover: (e) => {
            const l = e.target as L.Path;
            l.setStyle({
              weight: 3.5,
              color: '#f59e0b',
              fillOpacity: 0.75,
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              l.bringToFront();
            }
            onHoverWard(meta);
          },
          mouseout: (e) => {
            const l = e.target as L.Path;
            wardsLayer.resetStyle(l);
            onHoverWard(null);
          },
          click: () => {
            onSelectWard(meta, feature);
          },
        });

        layer.bindTooltip(
          `<div style="font-weight:800; font-size:12.5px; color:#0f172a; margin-bottom:2px; line-height:1.2;">${meta.wardName}</div>
           <div style="display:flex; align-items:center; gap:6px; margin: 3px 0 4px 0;">
             <span style="font-size:9.5px; font-weight:700; padding:1px 6px; border-radius:4px; background:${meta.corp === 'PCMC' ? '#ecfdf5' : '#f5f3ff'}; color:${meta.corp === 'PCMC' ? '#059669' : '#7c3aed'}; border:1px solid ${meta.corp === 'PCMC' ? '#a7f3d0' : '#ddd6fe'};">${meta.corp}</span>
             <span style="font-size:10.5px; font-weight:600; color:#334155;">Ward ${meta.wardNo}</span>
           </div>
           <div style="font-size:11px; color:#475569; margin-bottom:2px;">
             Population: <strong style="color:#0f172a;">${meta.censusPop2026.toLocaleString()}</strong>
             <span style="color:#94a3b8; margin:0 4px;">•</span>
             Area: <strong style="color:#0f172a;">${meta.areaKm2} km²</strong>
           </div>
           <div style="font-size:10.5px; color:#059669; font-weight:600;">Transit: ${meta.busStopsCount} Bus • ${meta.metroStopsCount} Metro Stops</div>`,
          { className: 'leaflet-tooltip-ward', sticky: true, direction: 'top' }
        );
      },
    });

    if (visibility.wards) {
      wardsLayer.addTo(map);
      if (!initialBoundsSetRef.current) {
        map.fitBounds(wardsLayer.getBounds(), { padding: [40, 40] });
        initialBoundsSetRef.current = true;
      }
    }
    wardsLayerRef.current = wardsLayer;
  }, [wardsData, thematic, corpFilter, selectedWard, visibility.wards]);

  // 4. Render Transit Bus Stops
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !stopsData) return;

    if (stopsLayerRef.current) {
      map.removeLayer(stopsLayerRef.current);
    }

    const group = L.layerGroup();
    L.geoJSON(stopsData, {
      pointToLayer: (_feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 3.5,
          fillColor: '#2563eb',
          color: '#ffffff',
          weight: 1.2,
          opacity: 0.9,
          fillOpacity: 0.85,
        });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const name = p.GTFSStops_XYTableToPoint_stop_name || 'Bus Stop';
        const id = p.GTFSStops_XYTableToPoint_stop_id || p.OBJECTID;
        layer.bindTooltip(
          `<div style="font-weight:700; color:#0f172a; font-size:12px;">${name}</div>
           <div style="font-size:10px; color:#2563eb; font-weight:600; margin-top:2px;">GTFS Bus Stop • ID ${id}</div>`,
          { className: 'leaflet-tooltip-ward' }
        );
      },
    }).eachLayer((l) => group.addLayer(l));

    if (visibility.stops) {
      group.addTo(map);
    }
    stopsLayerRef.current = group;
  }, [stopsData, visibility.stops]);

  // 5. Render Transit Bus Routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routesData) return;

    if (routesLayerRef.current) {
      map.removeLayer(routesLayerRef.current);
    }

    const routesLayer = L.geoJSON(routesData, {
      style: {
        color: '#ec4899',
        weight: 2,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        layer.bindTooltip(
          `<div style="font-weight:700; color:#0f172a; font-size:12px;">Bus Route ${p.LineVarID || 'Transit'}</div>
           <div style="font-size:10px; color:#ec4899; font-weight:600; margin-top:2px;">Corridor Length: ${(Number(p.Shape_Length || 0) / 1000).toFixed(1)} km</div>`,
          { className: 'leaflet-tooltip-ward' }
        );
        layer.on({
          mouseover: (e) => {
            const l = e.target as L.Path;
            l.setStyle({ color: '#06b6d4', weight: 4, opacity: 1 });
            l.bringToFront();
          },
          mouseout: (e) => {
            const l = e.target as L.Path;
            routesLayer.resetStyle(l);
          },
        });
      },
    });

    if (visibility.routes) {
      routesLayer.addTo(map);
    }
    routesLayerRef.current = routesLayer;
  }, [routesData, visibility.routes]);

  // 6. Render Metro Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !metroData) return;

    if (metroLayerRef.current) {
      map.removeLayer(metroLayerRef.current);
    }

    const metroLayer = L.geoJSON(metroData, {
      style: {
        color: '#0284c7',
        weight: 2,
        dashArray: '5, 5',
        fillColor: '#38bdf8',
        fillOpacity: 0.1,
      },
      onEachFeature: (_feature, layer) => {
        layer.bindTooltip(
          `<div style="font-weight:700; color:#0284c7; font-size:12px;">Metro Rapid Transit Corridor</div>
           <div style="font-size:10px; color:#475569; margin-top:2px;">Metro Alignment & Station Influence Zone</div>`,
          { className: 'leaflet-tooltip-ward' }
        );
      },
    });

    if (visibility.metro) {
      metroLayer.addTo(map);
    }
    metroLayerRef.current = metroLayer;
  }, [metroData, visibility.metro]);

  // 7. Render Major Roads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !majorRoadsData) return;

    if (majorRoadsLayerRef.current) {
      map.removeLayer(majorRoadsLayerRef.current);
    }

    const majorRoadsLayer = L.geoJSON(majorRoadsData, {
      style: (feature) => {
        const fclass = (feature?.properties?.fclass || '').toLowerCase();
        let color = '#f59e0b';
        let weight = 1.6;

        if (fclass.includes('motorway') || fclass.includes('trunk')) {
          color = '#ea580c';
          weight = 3.2;
        } else if (fclass.includes('primary')) {
          color = '#f97316';
          weight = 2.4;
        } else if (fclass.includes('secondary')) {
          color = '#eab308';
          weight = 1.8;
        }

        return { color, weight, opacity: 0.75 };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const name = p.fname || `${p.fclass || 'Road'}`;
        layer.bindTooltip(
          `<div style="font-weight:700; color:#0f172a; font-size:12px;">${name}</div>
           <div style="font-size:10px; color:#ea580c; font-weight:600; margin-top:2px;">Artery Class: ${p.fclass || 'Primary Road'}</div>`,
          { className: 'leaflet-tooltip-ward' }
        );
      },
    });

    if (visibility.majorRoads) {
      majorRoadsLayer.addTo(map);
    }
    majorRoadsLayerRef.current = majorRoadsLayer;
  }, [majorRoadsData, visibility.majorRoads]);

  // 8. Render All Local Roads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !allRoadsData) return;

    if (allRoadsLayerRef.current) {
      map.removeLayer(allRoadsLayerRef.current);
    }

    const allRoadsLayer = L.geoJSON(allRoadsData, {
      style: {
        color: '#94a3b8',
        weight: 0.8,
        opacity: 0.4,
      },
    });

    if (visibility.allRoads) {
      allRoadsLayer.addTo(map);
    }
    allRoadsLayerRef.current = allRoadsLayer;
  }, [allRoadsData, visibility.allRoads]);

  // 9. Handle Map Navigation Actions
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapAction) return;

    if (mapAction.type === 'india') {
      map.fitBounds(
        [
          [6.75, 68.1],
          [35.5, 97.4],
        ],
        { padding: [20, 20] }
      );
    } else if (mapAction.type === 'pune') {
      if (wardsLayerRef.current) {
        map.fitBounds(wardsLayerRef.current.getBounds(), { padding: [40, 40] });
      }
    } else if (mapAction.type === 'ward' && selectedWard) {
      const layer = wardFeatureLayersRef.current.get(selectedWard.id);
      if (layer && 'getBounds' in layer) {
        map.fitBounds((layer as L.Polygon).getBounds(), { padding: [60, 60], maxZoom: 15 });
      }
    }
  }, [mapAction, selectedWard]);

  return <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '100%' }} />;
};
