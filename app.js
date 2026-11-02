/**
 * Pune Metropolitan GIS & Ward Intelligence Platform
 * Handles Leaflet mapping, GeoJSON layer management, interactive hover/click,
 * thematic choropleths, spatial analysis, and comprehensive attribute reporting.
 */

// Global State
const state = {
  map: null,
  layers: {
    wards: null,
    stops: null,
    stopsCluster: null,
    routes: null,
    metro: null,
    majorRoads: null,
    allRoads: null,
  },
  data: {
    wards: null,
    stops: null,
    routes: null,
    metro: null,
    majorRoads: null,
  },
  wardIndex: [], // Array of { id, name, num, corp, pop, feature, layer }
  selectedWardFeature: null,
  selectedWardLayer: null,
  hoveredWardLayer: null,
  activeTheme: 'corp', // 'corp' | 'pop' | 'vuln'
  activeCorpFilter: 'all', // 'all' | 'PMC' | 'PCMC'
  tileLayers: {},
};

// Initialize Application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupUIEventListeners();
  loadAllLayers();
});

/**
 * 1. MAP INITIALIZATION
 */
function initMap() {
  // Create map instance with canvas rendering for optimal performance
  state.map = L.map('map', {
    center: [18.553, 73.864],
    zoom: 11,
    zoomControl: false,
    preferCanvas: true,
  });

  // Reposition zoom controls to top-right
  L.control.zoom({ position: 'topright' }).addTo(state.map);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(state.map);

  // Basemap Providers
  state.tileLayers = {
    positron: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }),
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Earthstar Geographics',
      maxZoom: 19,
    }),
  };

  // Add default basemap (Carto Positron)
  state.tileLayers.positron.addTo(state.map);
}

/**
 * 2. DATA LAYER LOADING
 */
async function loadAllLayers() {
  const loading = document.getElementById('loadingIndicator');
  const loadingText = document.getElementById('loadingText');

  try {
    // If preloaded via data.js, load instantly without network/CORS overhead
    if (window.PUNE_SPATIAL_DATA) {
      loadingText.innerText = 'Rendering Pune GIS layers...';
      state.data.wards = window.PUNE_SPATIAL_DATA.wards;
      state.data.stops = window.PUNE_SPATIAL_DATA.stops;
      state.data.routes = window.PUNE_SPATIAL_DATA.routes;
      state.data.majorRoads = window.PUNE_SPATIAL_DATA.majorRoads;
      state.data.metro = window.PUNE_SPATIAL_DATA.wards;

      buildWardIndex(state.data.wards);
      renderWardsLayer();
      renderStopsLayer();
      renderRoutesLayer();
      renderMajorRoadsLayer();
      renderMetroLayer();

      loading.style.display = 'none';

      if (state.layers.wards) {
        state.map.fitBounds(state.layers.wards.getBounds(), { padding: [40, 40] });
      }
      return;
    }

    // 1. Load Wards Layer (Full_Pune_1 (1).geojson)
    loadingText.innerText = 'Loading Pune & Pimpri-Chinchwad Wards...';
    const wardsResp = await fetch('Full_Pune_1 (1).geojson');
    state.data.wards = await wardsResp.json();
    buildWardIndex(state.data.wards);
    renderWardsLayer();

    // 2. Load GTFS Bus Stops (GTFS.geojson)
    loadingText.innerText = 'Loading 3,400+ Bus Stops...';
    const stopsResp = await fetch('GTFS.geojson');
    state.data.stops = await stopsResp.json();
    renderStopsLayer();

    // 3. Load GTFS Bus Routes (GTFSRoutes.geojson)
    loadingText.innerText = 'Loading Bus Transit Network...';
    const routesResp = await fetch('GTFSRoutes.geojson');
    state.data.routes = await routesResp.json();
    renderRoutesLayer();

    // 4. Load Major Road Network (PuneRoads_Major.geojson)
    loadingText.innerText = 'Loading Major Arterial Roads...';
    const roadsResp = await fetch('PuneRoads_Major.geojson');
    state.data.majorRoads = await roadsResp.json();
    renderMajorRoadsLayer();

    // 5. Load Metro Layer
    loadingText.innerText = 'Loading Metro Data...';
    const metroResp = await fetch('Metro.geojson');
    state.data.metro = await metroResp.json();
    renderMetroLayer();

    // Hide loading spinner
    loading.style.display = 'none';

    // Auto-fit to wards bounds
    if (state.layers.wards) {
      state.map.fitBounds(state.layers.wards.getBounds(), { padding: [40, 40] });
    }
  } catch (error) {
    console.error('Error loading GeoJSON layers:', error);
    loadingText.innerHTML = `<span style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading layers: ${error.message}</span>`;
  }
}

/**
 * Extract normalized ward information from diverse GeoJSON property schemas
 */
function extractWardMeta(properties) {
  const p = properties || {};
  const isPcmc = Boolean(
    p.Pimpri_Chinchwad_townname === 'Pimpri Chinchwad' ||
    p.Pimpri_Chinchwad_layer === 'PCMC' ||
    p.PCMC_ward_wisepop_data_v3_csv_PCMC_Ward___Area_Name
  );

  const corp = isPcmc ? 'PCMC' : 'PMC';
  
  let wardName = '';
  let wardNo = '';
  let population = 0;
  let pop2026 = 0;

  if (isPcmc) {
    wardName = p.PCMC_ward_wisepop_data_v3_csv_PCMC_Ward___Area_Name || 
               p.Pimpri_Chinchwad_ward_lgd_n || 
               `PCMC Ward ${p.Pimpri_Chinchwad_sourcewa_1 || ''}`;
    wardNo = p.Pimpri_Chinchwad_sourcewa_1 || p.PCMC_ward_wisepop_data_v3_csv_Ward_No || '';
    population = p.PCMC_ward_wisepop_data_v3_csv_Population || 0;
    pop2026 = Math.round(p.Pimpri_Chinchwad_Pop_2026 || 0);
  } else {
    wardName = p.PMC_wards_2025_xlsx___PMC_41_Wards_2025_Population_csv_Ward_Name || 
               `PMC Ward ${p.PMC_wards_2025_xlsx___PMC_41_Wards_2025_Population_csv_Ward_No || p.Polygons_WardNumber || ''}`;
    wardNo = p.PMC_wards_2025_xlsx___PMC_41_Wards_2025_Population_csv_Ward_No || p.Polygons_WardNumber || '';
    population = p.PMC_wards_2025_xlsx___PMC_41_Wards_2025_Population_csv_Population || 0;
    pop2026 = Math.round(p.Polygons_Pop_2026 || 0);
  }

  // Calculate area in km²
  const areaSqM = p.Shape_Area || p.Pimpri_Chinchwad_st_area_sh || 0;
  const areaKm2 = (areaSqM / 1000000).toFixed(2);
  const areaAcres = Math.round(areaSqM * 0.000247105);
  
  // Shape length in km
  const lengthM = p.Shape_Length || p.Pimpri_Chinchwad_st_length_ || 0;
  const lengthKm = (lengthM / 1000).toFixed(2);

  // Vulnerability & Climate (PCMC)
  const vulnLevel = p.Pimpri_Chinchwad_AMJ_Vulner || 'N/A';
  const amjMeanTemp = p.Pimpri_Chinchwad_AMJ_mean ? Number(p.Pimpri_Chinchwad_AMJ_mean).toFixed(1) : null;

  return {
    isPcmc,
    corp,
    wardName,
    wardNo,
    population,
    pop2026,
    areaKm2,
    areaAcres,
    areaSqM,
    lengthKm,
    lengthM,
    vulnLevel,
    amjMeanTemp,
    raw: p,
  };
}

/**
 * Build searchable index of all 97 wards
 */
function buildWardIndex(geojson) {
  state.wardIndex = [];
  geojson.features.forEach((feature, idx) => {
    const meta = extractWardMeta(feature.properties);
    state.wardIndex.push({
      idx,
      id: feature.properties.OBJECTID || idx,
      name: meta.wardName,
      number: meta.wardNo,
      corp: meta.corp,
      population: meta.population,
      feature,
      layer: null, // assigned when layer renders
    });
  });
}

/**
 * 3. WARDS LAYER RENDERING & STYLING
 */
function getWardStyle(feature) {
  const meta = extractWardMeta(feature.properties);
  let fillColor = '#7c3aed'; // PMC default
  let fillOpacity = 0.45;
  let strokeColor = '#ffffff';
  let weight = 1.2;

  // Thematic Styles
  if (state.activeTheme === 'corp') {
    fillColor = meta.corp === 'PCMC' ? '#059669' : '#7c3aed';
  } else if (state.activeTheme === 'pop') {
    // 5-tier population choropleth
    const p = meta.population;
    if (p > 110000) fillColor = '#1e1b4b';
    else if (p > 85000) fillColor = '#4338ca';
    else if (p > 65000) fillColor = '#6366f1';
    else if (p > 45000) fillColor = '#818cf8';
    else fillColor = '#c7d2fe';
    fillOpacity = 0.6;
  } else if (state.activeTheme === 'vuln') {
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
      fillColor = '#94a3b8'; // Not assessed / PMC
      fillOpacity = 0.25;
    }
  }

  // Filter check
  if (state.activeCorpFilter !== 'all' && meta.corp !== state.activeCorpFilter) {
    fillOpacity = 0.05;
    weight = 0.5;
    strokeColor = '#cbd5e1';
  }

  return {
    fillColor,
    fillOpacity,
    color: strokeColor,
    weight,
    opacity: 0.9,
  };
}

function renderWardsLayer() {
  if (state.layers.wards) {
    state.map.removeLayer(state.layers.wards);
  }

  state.layers.wards = L.geoJSON(state.data.wards, {
    style: getWardStyle,
    onEachFeature: (feature, layer) => {
      // Connect to search index
      const item = state.wardIndex.find(w => w.feature === feature);
      if (item) item.layer = layer;

      // Hover interactions
      layer.on({
        mouseover: (e) => onWardHover(e, feature, layer),
        mouseout: (e) => onWardHoverOut(e, layer),
        click: (e) => onWardClick(e, feature, layer),
      });

      // Quick tooltip
      const meta = extractWardMeta(feature.properties);
      layer.bindTooltip(
        `<div style="font-weight:700;">${meta.wardName}</div>
         <div style="font-size:10px; color:#93c5fd;">${meta.corp} • Ward #${meta.wardNo} • Pop: ${meta.population.toLocaleString()}</div>`,
        { className: 'leaflet-tooltip-ward', sticky: true, direction: 'top' }
      );
    },
  });

  if (document.getElementById('layerToggleWards').checked) {
    state.layers.wards.addTo(state.map);
  }
}

/**
 * 4. WARD HOVER BEHAVIOR
 */
function onWardHover(e, feature, layer) {
  // Highlight stroke
  layer.setStyle({
    weight: 3.5,
    color: '#f59e0b',
    fillOpacity: Math.min(layer.options.fillOpacity + 0.25, 0.9),
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  state.hoveredWardLayer = layer;

  // Update HUD Card
  const meta = extractWardMeta(feature.properties);
  const hud = document.getElementById('hoverHUD');
  
  const corpBadge = document.getElementById('hudBadgeCorp');
  corpBadge.innerText = meta.corp;
  corpBadge.className = `hover-badge ${meta.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`;

  document.getElementById('hudWardNo').innerText = meta.wardNo ? `Ward #${meta.wardNo}` : 'Ward Area';
  document.getElementById('hudWardName').innerText = meta.wardName;
  document.getElementById('hudPopulation').innerText = meta.population > 0 ? meta.population.toLocaleString() : 'N/A';
  document.getElementById('hudArea').innerText = `${meta.areaKm2} km²`;
  document.getElementById('hudPop2026').innerText = meta.pop2026 > 0 ? meta.pop2026.toLocaleString() : 'N/A';

  const vulnContainer = document.getElementById('hudVulnContainer');
  const vulnPill = document.getElementById('hudVulnerability');
  if (meta.vulnLevel && meta.vulnLevel !== 'N/A') {
    vulnContainer.style.display = 'block';
    vulnPill.innerText = `${meta.vulnLevel} (${meta.amjMeanTemp || ''}°C)`;
    vulnPill.className = `hover-badge badge-vuln-${meta.vulnLevel.toLowerCase()}`;
  } else {
    vulnContainer.style.display = 'none';
  }

  hud.classList.add('visible');
}

function onWardHoverOut(e, layer) {
  if (state.selectedWardLayer !== layer) {
    state.layers.wards.resetStyle(layer);
  } else {
    // Keep active selection style
    layer.setStyle({
      weight: 3.5,
      color: '#2563eb',
      fillOpacity: 0.7,
    });
  }
}

/**
 * 5. WARD CLICK: OPEN DETAILED MODAL & POPUP TABLE
 */
function onWardClick(e, feature, layer) {
  // Reset previous selection
  if (state.selectedWardLayer && state.layers.wards) {
    state.layers.wards.resetStyle(state.selectedWardLayer);
  }

  state.selectedWardFeature = feature;
  state.selectedWardLayer = layer;

  // Highlight active selected ward
  layer.setStyle({
    weight: 4,
    color: '#2563eb',
    fillOpacity: 0.75,
  });

  // Pan smoothly
  state.map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 14 });

  // Open Full Ward Inspector Modal
  openWardDetailsModal(feature, layer);
}

/**
 * Populate and display the comprehensive Ward Details Modal
 */
function openWardDetailsModal(feature, layer) {
  const meta = extractWardMeta(feature.properties);
  const p = feature.properties;

  // Title & Badges
  const corpBadge = document.getElementById('modalCorpBadge');
  corpBadge.innerText = meta.corp;
  corpBadge.className = `hover-badge ${meta.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}`;

  document.getElementById('modalWardTitle').innerText = meta.wardName;
  document.getElementById('modalWardSubtitle').innerText = 
    `${meta.corp === 'PCMC' ? 'Pimpri Chinchwad Municipal Corporation' : 'Pune Municipal Corporation'} • Ward No. ${meta.wardNo || 'N/A'}`;

  // KPI Highlights
  document.getElementById('modalKpiPop').innerText = meta.population > 0 ? meta.population.toLocaleString() : 'N/A';
  document.getElementById('modalKpiPop2026').innerText = meta.pop2026 > 0 ? meta.pop2026.toLocaleString() : 'N/A';
  document.getElementById('modalKpiArea').innerText = `${meta.areaKm2} km²`;
  document.getElementById('modalKpiAreaAcres').innerText = `${meta.areaAcres.toLocaleString()} acres (${Math.round(meta.areaSqM).toLocaleString()} m²)`;

  const kpiVuln = document.getElementById('modalKpiVuln');
  const kpiTemp = document.getElementById('modalKpiTemp');
  if (meta.vulnLevel && meta.vulnLevel !== 'N/A') {
    kpiVuln.innerText = `${meta.vulnLevel} Risk`;
    kpiVuln.style.color = meta.vulnLevel === 'High' ? '#dc2626' : meta.vulnLevel === 'Medium' ? '#d97706' : '#059669';
    kpiTemp.innerText = `Summer Mean: ${meta.amjMeanTemp || '--'}°C`;
  } else {
    kpiVuln.innerText = 'Unrated';
    kpiVuln.style.color = '#64748b';
    kpiTemp.innerText = 'PMC Area';
  }

  // Bounds
  const bounds = layer.getBounds();
  document.getElementById('modalCoordBounds').innerText = 
    `[${bounds.getSouth().toFixed(4)}°, ${bounds.getWest().toFixed(4)}°] to [${bounds.getNorth().toFixed(4)}°, ${bounds.getEast().toFixed(4)}°]`;

  // TAB 1: Profile & Demographics Table
  renderProfileTable(meta, p);

  // TAB 2: Climate & Heat Vulnerability
  renderClimateSection(meta, p);

  // TAB 3: Transit Connectivity (Bus Stops in this Ward)
  renderTransitSection(feature);

  // TAB 4: Raw Properties Table
  renderRawPropertiesTable(p);

  // Setup Actions
  document.getElementById('modalZoomBtn').onclick = () => {
    state.map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 15 });
  };

  document.getElementById('copyWardJsonBtn').onclick = () => {
    navigator.clipboard.writeText(JSON.stringify(p, null, 2)).then(() => {
      const btn = document.getElementById('copyWardJsonBtn');
      const orig = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-check" style="color:#059669;"></i> Copied!`;
      setTimeout(() => btn.innerHTML = orig, 1800);
    });
  };

  // Show Modal
  document.getElementById('wardModalOverlay').classList.add('active');
}

/**
 * Render Profile & Demographics Table
 */
function renderProfileTable(meta, p) {
  const tbody = document.getElementById('profileTableBody');
  const cPop = Math.ceil(p.Census_Pop_2026 || meta.pop2026 || 0);
  const wPop = Math.ceil(p.WorldPop_Pop_2020 || meta.population || 0);
  const growth = wPop > 0 && cPop > 0 ? `+${(((cPop - wPop) / wPop) * 100).toFixed(1)}%` : 'N/A';
  const area = p.Area_SqKm || meta.areaKm2;
  const busStops = p.Bus_Stops !== undefined ? p.Bus_Stops : 0;
  const metroStops = p.Metro_Stops !== undefined ? p.Metro_Stops : 0;

  const rows = [
    { label: 'Ward / Area Name', value: p.Ward_Name || meta.wardName },
    { label: 'Ward Number', value: p.Ward_No ? `#${p.Ward_No}` : (meta.wardNo ? `#${meta.wardNo}` : 'N/A') },
    { label: 'Governing Municipal Body', value: (p.Corporation || meta.corp) === 'PCMC' ? 'Pimpri Chinchwad Municipal Corporation (PCMC)' : 'Pune Municipal Corporation (PMC)' },
    { label: 'Census Projected Population (2026)', value: cPop > 0 ? `${cPop.toLocaleString()} citizens` : 'Not recorded' },
    { label: 'WorldPop Baseline Population (2020)', value: wPop > 0 ? `${wPop.toLocaleString()} citizens` : 'Not recorded' },
    { label: 'Population Growth (2020 → 2026)', value: growth },
    { label: 'Geographic Land Area', value: `${area} km²` },
    { label: 'Population Density (Census 2026)', value: p.Pop_Density_Census_2026 ? `${Number(p.Pop_Density_Census_2026).toLocaleString()} people / km²` : 'N/A' },
    { label: 'Population Density (WorldPop 2020)', value: p.Pop_Density_WorldPop_2020 ? `${Number(p.Pop_Density_WorldPop_2020).toLocaleString()} people / km²` : 'N/A' },
    { label: 'Public Bus Transit Stops', value: `${busStops} stops` },
    { label: 'Metro Rapid Transit Stations', value: `${metroStops} stations` },
  ];

  tbody.innerHTML = rows.map(r => `
    <tr>
      <th>${r.label}</th>
      <td><strong>${r.value}</strong></td>
    </tr>
  `).join('');
}

/**
 * Render Climate & Heat Vulnerability Section
 */
function renderClimateSection(meta, p) {
  const availSec = document.getElementById('climateAvailableSection');
  const unavailSec = document.getElementById('climateUnavailableSection');
  const barsContainer = document.getElementById('tempBars');
  const tbody = document.getElementById('climateTableBody');

  // Check if monthly climate data exists
  if (p.Pimpri_Chinchwad_Apr_mean) {
    availSec.style.display = 'block';
    unavailSec.style.display = 'none';

    const months = [
      { key: 'Jan', name: 'January', mean: p.Pimpri_Chinchwad_Jan_mean, min: p.Pimpri_Chinchwad_Jan_min, max: p.Pimpri_Chinchwad_Jan_max },
      { key: 'Feb', name: 'February', mean: p.Pimpri_Chinchwad_Feb_mean, min: p.Pimpri_Chinchwad_Feb_min, max: p.Pimpri_Chinchwad_Feb_max },
      { key: 'Mar', name: 'March', mean: p.Pimpri_Chinchwad_Mar_mean, min: p.Pimpri_Chinchwad_Mar_min, max: p.Pimpri_Chinchwad_Mar_max },
      { key: 'Apr', name: 'April', mean: p.Pimpri_Chinchwad_Apr_mean, min: p.Pimpri_Chinchwad_Apr_min, max: p.Pimpri_Chinchwad_Apr_max },
      { key: 'May', name: 'May', mean: p.Pimpri_Chinchwad_May_mean, min: p.Pimpri_Chinchwad_May_min, max: p.Pimpri_Chinchwad_May_max },
      { key: 'Jun', name: 'June', mean: p.Pimpri_Chinchwad_Jun_mean, min: p.Pimpri_Chinchwad_Jun_min, max: p.Pimpri_Chinchwad_Jun_max },
      { key: 'Oct', name: 'October', mean: p.Pimpri_Chinchwad_Oct_mean, min: p.Pimpri_Chinchwad_Oct_min, max: p.Pimpri_Chinchwad_Oct_max },
      { key: 'Nov', name: 'November', mean: p.Pimpri_Chinchwad_Nov_mean, min: p.Pimpri_Chinchwad_Nov_min, max: p.Pimpri_Chinchwad_Nov_max },
    ];

    // Build mini bar charts (normalize heights relative to 55°C max)
    barsContainer.innerHTML = months.map(m => {
      const val = Number(m.mean).toFixed(1);
      const heightPct = Math.min(Math.max((Number(m.mean) / 55) * 100, 15), 100);
      return `
        <div class="temp-bar-col">
          <span class="temp-val-text">${val}°</span>
          <div class="temp-bar" style="height: ${heightPct}%;"></div>
          <span class="temp-month-name">${m.key}</span>
        </div>
      `;
    }).join('');

    // Table rows
    tbody.innerHTML = months.map(m => `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td><span style="font-weight:700; color: #dc2626;">${Number(m.mean).toFixed(1)} °C</span></td>
        <td>${Number(m.min).toFixed(1)} °C</td>
        <td>${Number(m.max).toFixed(1)} °C</td>
      </tr>
    `).join('');
  } else {
    availSec.style.display = 'none';
    unavailSec.style.display = 'block';
  }
}

/**
 * Point-in-polygon algorithm to associate bus stops with the selected ward
 */
function isPointInRing(point, ring) {
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

function isPointInPolygonGeom(point, geometry) {
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

/**
 * Render Transit Connectivity Tab
 */
function renderTransitSection(feature) {
  const tbody = document.getElementById('wardStopsTableBody');
  const countSpan = document.getElementById('wardStopCount');
  tbody.innerHTML = '';

  if (!state.data.stops) {
    countSpan.innerText = 'Transit data loading...';
    return;
  }

  // Find all bus stops within this ward geometry
  const stopsInWard = [];
  state.data.stops.features.forEach(stopFeat => {
    const pt = stopFeat.geometry.coordinates; // [lon, lat]
    if (isPointInPolygonGeom(pt, feature.geometry)) {
      const p = stopFeat.properties;
      stopsInWard.push({
        id: p.GTFSStops_XYTableToPoint_stop_id || p.OBJECTID,
        name: p.GTFSStops_XYTableToPoint_stop_name || 'Bus Stop',
        lat: pt[1].toFixed(4),
        lon: pt[0].toFixed(4),
      });
    }
  });

  countSpan.innerText = stopsInWard.length;

  if (stopsInWard.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px;">No bus stops recorded directly within this ward polygon boundary.</td></tr>`;
    return;
  }

  function displayStops(list) {
    tbody.innerHTML = list.map(s => `
      <tr>
        <td><strong style="color:#2563eb;">#${s.id}</strong></td>
        <td>${s.name}</td>
        <td style="font-family: monospace; font-size:11px; color:#64748b;">${s.lat}, ${s.lon}</td>
      </tr>
    `).join('');
  }

  displayStops(stopsInWard);

  // Search filter inside ward stops
  const filterInput = document.getElementById('filterWardStopsInput');
  filterInput.value = '';
  filterInput.oninput = (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = stopsInWard.filter(s => s.name.toLowerCase().includes(q) || String(s.id).includes(q));
    displayStops(filtered);
  };
}

/**
 * Render All Raw Properties Table
 */
function renderRawPropertiesTable(properties) {
  const tbody = document.getElementById('rawPropsTableBody');
  const keys = Object.keys(properties).sort();

  function displayProps(filteredKeys) {
    tbody.innerHTML = filteredKeys.map(k => `
      <tr>
        <th style="word-break: break-all; font-family: monospace; font-size: 11px;">${k}</th>
        <td style="word-break: break-word;">${properties[k] !== null && properties[k] !== undefined && properties[k] !== '' ? properties[k] : '<em style="color:#cbd5e1;">empty</em>'}</td>
      </tr>
    `).join('');
  }

  displayProps(keys);

  const searchInput = document.getElementById('rawPropSearchInput');
  searchInput.value = '';
  searchInput.oninput = (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = keys.filter(k => k.toLowerCase().includes(q) || String(properties[k]).toLowerCase().includes(q));
    displayProps(filtered);
  };
}

/**
 * 6. TRANSIT & INFRASTRUCTURE LAYERS RENDERING
 */
function renderStopsLayer() {
  if (state.layers.stopsCluster) {
    state.map.removeLayer(state.layers.stopsCluster);
  }

  state.layers.stopsCluster = L.markerClusterGroup({
    maxClusterRadius: 45,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div style="background:#2563eb; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [28, 28],
      });
    },
  });

  const geojsonLayer = L.geoJSON(state.data.stops, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85,
      });
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const name = p.GTFSStops_XYTableToPoint_stop_name || 'Bus Stop';
      const id = p.GTFSStops_XYTableToPoint_stop_id || p.OBJECTID;
      layer.bindTooltip(`<b>${name}</b><br><small style="color:#2563eb;">Stop ID: #${id}</small>`, {
        className: 'leaflet-tooltip-ward',
      });
    },
  });

  state.layers.stopsCluster.addLayer(geojsonLayer);

  if (document.getElementById('layerToggleStops').checked) {
    state.layers.stopsCluster.addTo(state.map);
  }
}

function renderRoutesLayer() {
  state.layers.routes = L.geoJSON(state.data.routes, {
    style: {
      color: '#ec4899',
      weight: 2,
      opacity: 0.65,
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      layer.bindTooltip(`<b>Bus Route #${p.LineVarID || 'Transit'}</b><br>Length: ${Math.round(p.Shape_Length || 0)}m`, {
        className: 'leaflet-tooltip-ward',
      });
      layer.on({
        mouseover: (e) => {
          layer.setStyle({ color: '#06b6d4', weight: 4, opacity: 1 });
          layer.bringToFront();
        },
        mouseout: (e) => {
          state.layers.routes.resetStyle(layer);
        },
      });
    },
  });

  if (document.getElementById('layerToggleRoutes').checked) {
    state.layers.routes.addTo(state.map);
  }
}

function renderMetroLayer() {
  state.layers.metro = L.geoJSON(state.data.metro, {
    style: {
      color: '#0284c7',
      weight: 2,
      dashArray: '5, 5',
      fillColor: '#38bdf8',
      fillOpacity: 0.1,
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip('<b>Metro Alignment / Zone</b>', { className: 'leaflet-tooltip-ward' });
    },
  });

  if (document.getElementById('layerToggleMetro').checked) {
    state.layers.metro.addTo(state.map);
  }
}

function renderMajorRoadsLayer() {
  state.layers.majorRoads = L.geoJSON(state.data.majorRoads, {
    style: (feature) => {
      const fclass = (feature.properties.fclass || '').toLowerCase();
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

      return {
        color,
        weight,
        opacity: 0.75,
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const name = p.fname || `${p.fclass || 'Road'}`;
      layer.bindTooltip(`<b>${name}</b><br><small>Class: ${p.fclass}</small>`, { className: 'leaflet-tooltip-ward' });
    },
  });

  if (document.getElementById('layerToggleMajorRoads').checked) {
    state.layers.majorRoads.addTo(state.map);
  }
}

/**
 * 7. UI EVENT LISTENERS & SEARCH
 */
function setupUIEventListeners() {
  // Navigation: India View
  document.getElementById('btnIndiaView').addEventListener('click', () => {
    // Whole of India bounds [South, West] to [North, East]
    state.map.fitBounds([
      [6.75, 68.1],
      [35.5, 97.4],
    ], { padding: [20, 20] });
  });

  // Navigation: Pune Wards View
  document.getElementById('btnPuneView').addEventListener('click', () => {
    if (state.layers.wards) {
      state.map.fitBounds(state.layers.wards.getBounds(), { padding: [40, 40] });
    }
  });

  // Basemap Selector
  document.getElementById('basemapSelect').addEventListener('change', (e) => {
    const selected = e.target.value;
    Object.values(state.tileLayers).forEach(layer => state.map.removeLayer(layer));
    if (state.tileLayers[selected]) {
      state.tileLayers[selected].addTo(state.map);
      // Bring active overlays above tiles
      if (state.layers.majorRoads) state.layers.majorRoads.bringToFront();
      if (state.layers.routes) state.layers.routes.bringToFront();
      if (state.layers.wards) state.layers.wards.bringToFront();
      if (state.layers.stopsCluster) state.layers.stopsCluster.bringToFront();
    }
  });

  // Layer Toggles
  document.getElementById('layerToggleWards').addEventListener('change', (e) => {
    if (e.target.checked && state.layers.wards) state.layers.wards.addTo(state.map);
    else if (state.layers.wards) state.map.removeLayer(state.layers.wards);
    updateActiveLayersBadge();
  });

  document.getElementById('layerToggleStops').addEventListener('change', (e) => {
    if (e.target.checked && state.layers.stopsCluster) state.layers.stopsCluster.addTo(state.map);
    else if (state.layers.stopsCluster) state.map.removeLayer(state.layers.stopsCluster);
    updateActiveLayersBadge();
  });

  document.getElementById('layerToggleRoutes').addEventListener('change', (e) => {
    if (e.target.checked && state.layers.routes) state.layers.routes.addTo(state.map);
    else if (state.layers.routes) state.map.removeLayer(state.layers.routes);
    updateActiveLayersBadge();
  });

  document.getElementById('layerToggleMetro').addEventListener('change', (e) => {
    if (e.target.checked && state.layers.metro) state.layers.metro.addTo(state.map);
    else if (state.layers.metro) state.map.removeLayer(state.layers.metro);
    updateActiveLayersBadge();
  });

  document.getElementById('layerToggleMajorRoads').addEventListener('change', (e) => {
    if (e.target.checked && state.layers.majorRoads) state.layers.majorRoads.addTo(state.map);
    else if (state.layers.majorRoads) state.map.removeLayer(state.layers.majorRoads);
    updateActiveLayersBadge();
  });

  // All Local Roads (75k on-demand loader)
  document.getElementById('layerToggleAllRoads').addEventListener('change', async (e) => {
    if (e.target.checked) {
      if (!state.layers.allRoads) {
        const loading = document.getElementById('loadingIndicator');
        const loadingText = document.getElementById('loadingText');
        loading.style.display = 'flex';
        loadingText.innerText = 'Loading all 75,000+ local streets (48MB)...';

        try {
          const resp = await fetch('PuneRoadNetwork.geojson');
          const data = await resp.json();
          state.layers.allRoads = L.geoJSON(data, {
            style: {
              color: '#94a3b8',
              weight: 0.8,
              opacity: 0.4,
            },
          });
          state.layers.allRoads.addTo(state.map);
        } catch (err) {
          alert('Could not load full road network: ' + err.message);
        } finally {
          loading.style.display = 'none';
        }
      } else {
        state.layers.allRoads.addTo(state.map);
      }
    } else {
      if (state.layers.allRoads) state.map.removeLayer(state.layers.allRoads);
    }
    updateActiveLayersBadge();
  });

  // Thematic Ward Styling
  document.querySelectorAll('input[name="wardColorTheme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.activeTheme = e.target.value;
      if (state.layers.wards) {
        state.layers.wards.setStyle(getWardStyle);
      }
    });
  });

  // Filter Wards by Corporation
  document.getElementById('filterCorporation').addEventListener('change', (e) => {
    state.activeCorpFilter = e.target.value;
    if (state.layers.wards) {
      state.layers.wards.setStyle(getWardStyle);
    }
  });

  // Sidebar Toggle
  const sidebar = document.getElementById('sidebarPanel');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const toggleIcon = document.getElementById('toggleIcon');
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
      toggleIcon.className = 'fa-solid fa-chevron-right';
    } else {
      toggleIcon.className = 'fa-solid fa-chevron-left';
    }
  });

  // Search Autocomplete
  const searchInput = document.getElementById('wardSearchInput');
  const searchResults = document.getElementById('searchResults');
  const clearBtn = document.getElementById('clearSearchBtn');

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      searchResults.style.display = 'none';
      clearBtn.style.display = 'none';
      return;
    }
    clearBtn.style.display = 'block';

    const matches = state.wardIndex.filter(w => 
      w.name.toLowerCase().includes(q) || 
      String(w.number).toLowerCase().includes(q) ||
      w.corp.toLowerCase().includes(q)
    ).slice(0, 10);

    if (matches.length === 0) {
      searchResults.innerHTML = `<div style="padding:10px 14px; color:#94a3b8; font-size:12px;">No wards match "${q}"</div>`;
      searchResults.style.display = 'block';
      return;
    }

    searchResults.innerHTML = matches.map(w => `
      <div class="search-item" data-idx="${w.idx}">
        <div>
          <strong>${w.name}</strong>
          <span style="font-size:10px; color:#64748b; margin-left:4px;">(Ward #${w.number || 'N/A'})</span>
        </div>
        <span class="hover-badge ${w.corp === 'PCMC' ? 'badge-pcmc' : 'badge-pmc'}">${w.corp}</span>
      </div>
    `).join('');

    searchResults.style.display = 'block';

    // Click handler on search results
    searchResults.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = Number(item.getAttribute('data-idx'));
        const ward = state.wardIndex[idx];
        if (ward && ward.layer) {
          onWardClick(null, ward.feature, ward.layer);
        }
        searchResults.style.display = 'none';
        searchInput.value = ward.name;
      });
    });
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.style.display = 'none';
    clearBtn.style.display = 'none';
  });

  // Close search on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchResults.style.display = 'none';
    }
  });

  // Modal Close Handlers
  const modalOverlay = document.getElementById('wardModalOverlay');
  document.getElementById('modalCloseBtn').onclick = () => modalOverlay.classList.remove('active');
  document.getElementById('closeModalFooterBtn').onclick = () => modalOverlay.classList.remove('active');
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });

  // Modal Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

function updateActiveLayersBadge() {
  let count = 0;
  if (document.getElementById('layerToggleWards').checked) count++;
  if (document.getElementById('layerToggleStops').checked) count++;
  if (document.getElementById('layerToggleRoutes').checked) count++;
  if (document.getElementById('layerToggleMetro').checked) count++;
  if (document.getElementById('layerToggleMajorRoads').checked) count++;
  if (document.getElementById('layerToggleAllRoads').checked) count++;
  document.getElementById('activeLayersCount').innerText = `${count} Active`;
}
