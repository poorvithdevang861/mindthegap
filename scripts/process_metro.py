import json
import os

# 1. Load ward boundaries for spatial point-in-polygon matching
with open('public/Full_Pune_1 (1).geojson') as f:
    wards = json.load(f)

def point_in_poly(x, y, poly):
    inside = False
    n = len(poly)
    p1x, p1y = poly[0]
    for i in range(1, n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def find_ward(lon, lat):
    for w in wards['features']:
        name = w['properties'].get('name') or w['properties'].get('ward_name') or w['properties'].get('Ward_Name') or w['properties'].get('Name') or 'Pune Municipal Sector'
        geom = w['geometry']
        gtype = geom['type']
        coords = geom['coordinates']
        if gtype == 'Polygon':
            if point_in_poly(lon, lat, coords[0]):
                return name
        elif gtype == 'MultiPolygon':
            for poly in coords:
                if point_in_poly(lon, lat, poly[0]):
                    return name
    return 'Metropolitan Sector'

# 2. Process Metro Stations New.json (92 stations)
with open('Metro Stations New.json') as f:
    stations_data = json.load(f)

line1_purple_names = {
    'PCMC', 'Sant Tukaram Nagar', 'Nashik Phata', 'Kasarwadi', 'Phugewadi', 
    'Dapodi', 'Bopodi', 'Shivaji Nagar', 'Shivajinagar', 'District Court (Aqua Line)',
    'Kasaba Peth', 'Mahatma Phule Mandai', 'Swargate',
    # Ext 1A
    'Market Yard', 'Bibwewadi', 'Padmavati', 'Balaji Nagar', 'Katraj',
    # Ext 1B
    'Bhakti Shakti', 'Nigdi', 'Akurdi', 'Chinchwad'
}

line2_aqua_names = {
    'Vanaz', 'Anandnagar', 'Paud Phata', 'SNDT College', 'Garware College', 
    'Deccan Gymkhana', 'Chhatrapati Sambhaji Udyan', 'PMC', 'District Court (Aqua Line)',
    'RTO (Pune)', 'Pune Railway Station', 'Ruby Hall Clinic', 'Bund Garden', 
    'Yerawada', 'Kalyani Nagar', 'Ramwadi',
    # Ext 2A
    'Kothrud Bus Depot', 'Chandani Chowk', 'Karve Putala', 'Nal Stop',
    # Ext 2B
    'Viman Nagar', 'Somnath Nagar', 'Kharadi Bypass', 'Tulaja Bhavani', 
    'Ubale Nagar', 'Upper Kharadi Rd', 'Wagheshwar Temple', 'Wagholi', 
    'Siddharth Nagar', 'Bakori Phata', 'Vitthalwadi'
}

line3_pink_names = {
    'Mitcon Balewadi', 'Agriculture College', 'Bhosalenagar RBI',
    'Shree Shiv Chhatrapati Sports Complex Mahalunge',
    'Savitribai Phule Pune University', 'Sakalnagar', 'Aundh', 
    'Baner Pashan Link Road', 'Baner Gaon', 'Balewadi Phata', 
    'Balewadi High Street', 'R K Laxman Museum Balewadi'
}

line4_orange_names = {
    'Hadapsar Railway Station', 'Dahanukar Colony', 'Karve Nagar', 'Warje',
    'Daulat Nagar', 'Manik Baug', 'Dalvewadi', 'Nanded City', 'Dhayari Phata',
    'Hingane Chowk', 'Rajaram Pul', 'Deshpande Udyan', 'Dandekar Pul',
    'Seven Loves Chowk', 'Ramtekadi', 'Hadapsar', 'Magarpatta South',
    'Magarpatta North', 'Sainath Nagar', 'Kharadi Chowk', 'Hadapsar Phata',
    'Hadapsar Bus Depot', 'Hadapsar Gliding Club', 'Akashwani', 'Laxmi Colony',
    'Draksha Baug', 'Manjari Phata', 'Stud Farm'
}

enriched_stations = []
for idx, feat in enumerate(stations_data['features']):
    p = dict(feat.get('properties', {}))
    geom = feat.get('geometry', {})
    coords = geom.get('coordinates', [0, 0])
    name = (p.get('Name') or '').strip()
    
    # Defaults
    line_id = 'line2'
    line_name = 'Aqua Line (Line 2)'
    color = '#0284c7'
    status = 'Operational'
    corridor = 'Vanaz ⇄ Ramwadi'
    station_type = 'Elevated Station'
    is_interchange = False
    interchange_desc = ''

    if name in line1_purple_names:
        line_id = 'line1'
        line_name = 'Purple Line (Line 1)'
        color = '#7c3aed'
        if name in {'Market Yard', 'Bibwewadi', 'Padmavati', 'Balaji Nagar', 'Katraj'}:
            status = 'Approved / Planned'
            corridor = 'Swargate ⇄ Katraj (Extension 1A)'
            station_type = 'Underground Station'
        elif name in {'Bhakti Shakti', 'Nigdi', 'Akurdi', 'Chinchwad'}:
            status = 'Under Construction'
            corridor = 'PCMC ⇄ Nigdi (Extension 1B)'
            station_type = 'Elevated Station'
        else:
            status = 'Operational'
            corridor = 'PCMC ⇄ Swargate'
            station_type = 'Underground Station' if name in {'Shivaji Nagar', 'Shivajinagar', 'District Court (Aqua Line)', 'Kasaba Peth', 'Mahatma Phule Mandai', 'Swargate'} else 'Elevated Station'
    elif name in line2_aqua_names:
        line_id = 'line2'
        line_name = 'Aqua Line (Line 2)'
        color = '#0284c7'
        if name in {'Kothrud Bus Depot', 'Chandani Chowk', 'Karve Putala', 'Paud Phata'}:
            status = 'Approved / Planned'
            corridor = 'Vanaz ⇄ Chandani Chowk (Extension 2A)'
            station_type = 'Elevated Station'
        elif name in {'Viman Nagar', 'Somnath Nagar', 'Kharadi Bypass', 'Tulaja Bhavani', 'Ubale Nagar', 'Upper Kharadi Rd', 'Wagheshwar Temple', 'Wagholi', 'Siddharth Nagar', 'Bakori Phata', 'Vitthalwadi'}:
            status = 'Approved / Planned'
            corridor = 'Ramwadi ⇄ Wagholi (Extension 2B)'
            station_type = 'Elevated Station'
        else:
            status = 'Operational'
            corridor = 'Vanaz ⇄ Ramwadi'
            station_type = 'Underground Station' if name in {'District Court (Aqua Line)'} else 'Elevated Station'
    elif name in line3_pink_names:
        line_id = 'line3'
        line_name = 'Pink Line (Line 3)'
        color = '#ec4899'
        status = 'Under Construction'
        corridor = 'Shivajinagar ⇄ Hinjawadi IT Park'
        station_type = 'Elevated Station'
    elif name in line4_orange_names:
        line_id = 'line4'
        line_name = 'Line 4 / 4A / 4B (Orange Line)'
        color = '#f97316'
        status = 'Approved / Planned'
        corridor = 'Khadakwasla ⇄ Swargate ⇄ Hadapsar ⇄ Kharadi'
        station_type = 'Elevated Station'

    # Interchange classification
    if name in {'District Court (Aqua Line)', 'Shivajinagar', 'Shivaji Nagar'}:
        is_interchange = True
        interchange_desc = 'Lines 1, 2 & 3 Transfer Interchange'
    elif name in {'Swargate'}:
        is_interchange = True
        interchange_desc = 'Lines 1 & 4 Multi-Modal Hub'
    elif name in {'Nal Stop'}:
        is_interchange = True
        interchange_desc = 'Lines 2 & 4 Transfer Hub'
    elif name in {'Hadapsar', 'Hadapsar Railway Station'}:
        is_interchange = True
        interchange_desc = 'Lines 4 & 4B Rail Junction'
    elif name in {'Kharadi Chowk'}:
        is_interchange = True
        interchange_desc = 'Lines 2 & 4 Junction'

    ward_name = find_ward(coords[0], coords[1])

    p.update({
        'OBJECTID': idx + 1,
        'Name': name,
        'name': name,
        'station_name': name,
        'line_id': line_id,
        'line_name': line_name,
        'color': color,
        'corridor': corridor,
        'status': status,
        'station_type': station_type,
        'is_interchange': is_interchange,
        'interchange_desc': interchange_desc,
        'ward_name': ward_name
    })

    enriched_stations.append({
        'type': 'Feature',
        'id': idx + 1,
        'geometry': geom,
        'properties': p
    })

stations_out = {
    'type': 'FeatureCollection',
    'name': 'Pune_Metro_Stations_92',
    'features': enriched_stations
}

with open('public/Metro_Stations.geojson', 'w') as f:
    json.dump(stations_out, f, indent=2)

with open('public/Metro Stations New.json', 'w') as f:
    json.dump(stations_out, f, indent=2)

print(f'Saved {len(enriched_stations)} stations to public/Metro_Stations.geojson and public/Metro Stations New.json')

# 3. Process Metro Routes New.json (222 alignments)
with open('Metro Routes New.json') as f:
    routes_data = json.load(f)

def extract_points(coords):
    pts = []
    if not coords:
        return pts
    if isinstance(coords[0], (int, float)):
        return [coords]
    for item in coords:
        if isinstance(item, list):
            if len(item) >= 2 and isinstance(item[0], (int, float)):
                pts.append(item)
            else:
                pts.extend(extract_points(item))
    return pts

enriched_routes = []
for idx, feat in enumerate(routes_data['features']):
    p = dict(feat.get('properties', {}))
    geom = feat.get('geometry', {})
    raw_name = (p.get('Name') or '').strip()

    pts = extract_points(geom.get('coordinates', []))
    if pts:
        lons = [pt[0] for pt in pts]
        lats = [pt[1] for pt in pts]
        avg_lon = sum(lons) / len(lons)
        avg_lat = sum(lats) / len(lats)
    else:
        avg_lon, avg_lat = 73.85, 18.52

    # Categorize route
    if 'Purple' in raw_name:
        line_id = 'line1'
        line_name = 'Purple Line (Line 1)'
        color = '#7c3aed'
        weight = 4.5
        is_siding = False
        if 'Extension 1A' in raw_name or 'Katraj' in raw_name:
            corridor = 'Swargate ⇄ Katraj (Extension 1A)'
            status = 'Approved / Planned'
            dash_array = '6, 4'
        elif 'Extension 1B' in raw_name or 'Nigdi' in raw_name:
            corridor = 'PCMC ⇄ Nigdi (Extension 1B)'
            status = 'Under Construction'
            dash_array = '6, 4'
        else:
            corridor = 'PCMC ⇄ Swargate'
            status = 'Operational'
            dash_array = None
    elif 'Aqua' in raw_name:
        line_id = 'line2'
        line_name = 'Aqua Line (Line 2)'
        color = '#0284c7'
        weight = 4.5
        is_siding = False
        if 'Extension 2A' in raw_name or 'Chandani' in raw_name:
            corridor = 'Vanaz ⇄ Chandani Chowk (Extension 2A)'
            status = 'Approved / Planned'
            dash_array = '6, 4'
        elif 'Extension 2B' in raw_name or 'Wagholi' in raw_name:
            corridor = 'Ramwadi ⇄ Wagholi (Extension 2B)'
            status = 'Approved / Planned'
            dash_array = '6, 4'
        else:
            corridor = 'Vanaz ⇄ Ramwadi'
            status = 'Operational'
            dash_array = None
    elif 'Line 3' in raw_name or 'Pink' in raw_name:
        line_id = 'line3'
        line_name = 'Pink Line (Line 3)'
        color = '#ec4899'
        corridor = 'Shivajinagar ⇄ Hinjawadi IT Park'
        status = 'Under Construction'
        weight = 4.5
        is_siding = False
        dash_array = None
    elif 'Line 4' in raw_name or 'Line 4A' in raw_name or 'Line 4B' in raw_name:
        line_id = 'line4'
        line_name = 'Line 4 / 4A / 4B (Orange Line)'
        color = '#f97316'
        weight = 4.0
        is_siding = False
        dash_array = '5, 5'
        if '4B' in raw_name or 'Loni' in raw_name:
            corridor = 'Hadapsar ⇄ Loni Kalbhor (Line 4B)'
        else:
            corridor = 'Khadakwasla ⇄ Swargate ⇄ Kharadi (Line 4)'
        status = 'Approved / Planned'
    else: # Placemark / Siding / Connectors
        is_siding = True
        weight = 2.5
        dash_array = '3, 3'
        if avg_lon < 73.83 and 18.49 < avg_lat < 18.52:
            line_id = 'line2'
            line_name = 'Aqua Line (Vanaz Hill View Depot)'
            color = '#0284c7'
            corridor = 'Vanaz Depot Siding & Turnout'
            status = 'Operational'
        elif 73.83 <= avg_lon <= 73.86 and 18.52 <= avg_lat <= 18.56:
            line_id = 'line1'
            line_name = 'Purple Line (Range Hills Depot)'
            color = '#7c3aed'
            corridor = 'Range Hills Depot Alignment'
            status = 'Operational'
        elif avg_lat > 18.57 and avg_lon >= 73.80:
            line_id = 'line1'
            line_name = 'Purple Line (Northern Crossover Track)'
            color = '#7c3aed'
            corridor = 'PCMC - Pimpri Crossover Siding'
            status = 'Operational'
        elif avg_lon < 73.80 and avg_lat > 18.55:
            line_id = 'line3'
            line_name = 'Pink Line (Maan Depot Track)'
            color = '#ec4899'
            corridor = 'Hinjawadi IT Park Depot Siding'
            status = 'Under Construction'
        elif avg_lon > 73.88 and 18.52 < avg_lat < 18.57:
            line_id = 'line2'
            line_name = 'Aqua Line (Kalyani Nagar / Ramwadi Turnout)'
            color = '#0284c7'
            corridor = 'Ramwadi Operational Siding'
            status = 'Operational'
        else:
            line_id = 'metro_service'
            line_name = 'Metro Operational Service Siding'
            color = '#0284c7'
            corridor = 'Interchange & Crossover Siding'
            status = 'Operational'

    clean_name = raw_name if (raw_name and raw_name != 'Placemark') else line_name

    p.update({
        'OBJECTID': idx + 1,
        'Name': clean_name,
        'name': clean_name,
        'line_id': line_id,
        'line_name': line_name,
        'color': color,
        'corridor': corridor,
        'status': status,
        'is_siding': is_siding,
        'weight': weight,
        'dash_array': dash_array
    })

    enriched_routes.append({
        'type': 'Feature',
        'id': idx + 1,
        'geometry': geom,
        'properties': p
    })

routes_out = {
    'type': 'FeatureCollection',
    'name': 'Pune_Metro_Routes_222',
    'features': enriched_routes
}

with open('public/Metro_Routes.geojson', 'w') as f:
    json.dump(routes_out, f, indent=2)

with open('public/Metro Routes New.json', 'w') as f:
    json.dump(routes_out, f, indent=2)

print(f'Saved {len(enriched_routes)} routes to public/Metro_Routes.geojson and public/Metro Routes New.json')
