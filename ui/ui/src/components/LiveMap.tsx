import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Ship, Anchor } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface Route {
    id: string;
    fromId: string;
    toId: string;
    coordinates: [number, number][]; // LineString [lng, lat]
    type: 'Rail' | 'Sea-Rail';
    cost: number;
    time: string;
    isOptimal: boolean;
}

interface LiveMapProps {
    vessels: any[];
    ports: any[];
    routes?: Route[];
    pipelineStatus?: 'healthy' | 'error';
    errorReason?: string | null;
}

// Helper to parse "12.4N, 88.2E" to [lng, lat] for MapLibre (GeoJSON order is Lng, Lat)
const parseCoordinates = (coordStr: string): [number, number] | null => {
    if (!coordStr || coordStr === 'Docked' || coordStr === 'Anchorage') return null;
    const parts = coordStr.split(',').map(s => s.trim());
    if (parts.length !== 2) return null;

    let lat = parseFloat(parts[0].replace(/[NS]/i, ''));
    let lng = parseFloat(parts[1].replace(/[EW]/i, ''));

    if (parts[0].toUpperCase().includes('S')) lat = -lat;
    if (parts[1].toUpperCase().includes('W')) lng = -lng;

    if (isNaN(lat) || isNaN(lng)) return null;
    // MapLibre uses [lng, lat]
    return [lng, lat];
};

const LiveMap: React.FC<LiveMapProps> = ({ vessels, ports, routes = [], pipelineStatus = 'healthy', errorReason }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Initialize Map
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: [
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors'
                    }
                },
                layers: [
                    {
                        id: 'osm-tiles',
                        type: 'raster',
                        source: 'osm',
                        minzoom: 0,
                        maxzoom: 19
                    }
                ]
            },
            center: [85.0, 20.0],
            zoom: 4
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            // Add Route Source
            map.current?.addSource('routes', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: routes.map(route => ({
                        type: 'Feature',
                        properties: {
                            id: route.id,
                            type: route.type,
                            cost: route.cost,
                            time: route.time,
                            isOptimal: route.isOptimal,
                            errorReason: route.isOptimal ? errorReason : null
                        },
                        geometry: {
                            type: 'LineString',
                            coordinates: route.coordinates
                        }
                    }))
                }
            });

            // Add Route Layer (Optimal)
            map.current?.addLayer({
                id: 'routes-optimal',
                type: 'line',
                source: 'routes',
                filter: ['==', 'isOptimal', true],
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': pipelineStatus === 'error' ? '#EF4444' : '#10b981', // Red if error, else Emerald
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });

            // Add Route Layer (Standard)
            map.current?.addLayer({
                id: 'routes-standard',
                type: 'line',
                source: 'routes',
                filter: ['==', 'isOptimal', false],
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#94a3b8', // Slate 400
                    'line-width': 3,
                    'line-dasharray': [2, 2],
                    'line-opacity': 0.6
                }
            });

            // Popup interactions
            ['routes-optimal', 'routes-standard'].forEach(layer => {
                map.current?.on('click', layer, (e) => {
                    const props = e.features?.[0]?.properties;
                    if (props) {
                        let html = `
                                <div style="color:black; font-weight:bold;">${props.type} Route</div>
                                <div style="color:#333;">Cost: ₹${props.cost}/Ton</div>
                                <div style="color:#333;">Time: ${props.time}</div>
                                ${props.isOptimal ? '<div style="color:#059669; font-weight:bold; margin-top:4px;">★ Best Choice</div>' : ''}
                             `;

                        // Add Error Reason if exists
                        if (props.errorReason) {
                            html += `<div style="color:#EF4444; font-weight:bold; margin-top:4px; border-top:1px solid #ddd; padding-top:4px;">⚠️ ${props.errorReason}</div>`;
                        }

                        new maplibregl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(html)
                            .addTo(map.current!);
                    }
                });

                map.current?.on('mouseenter', layer, () => {
                    if (map.current) map.current.getCanvas().style.cursor = 'pointer';
                });
                map.current?.on('mouseleave', layer, () => {
                    if (map.current) map.current.getCanvas().style.cursor = '';
                });
            });
        });

        const resizeMap = () => {
            if (map.current) {
                map.current.resize();
            }
        };

        // Force resize after a small delay to handle layout shifts
        setTimeout(resizeMap, 100);
        setTimeout(resizeMap, 500);
        window.addEventListener('resize', resizeMap);

        return () => {
            window.removeEventListener('resize', resizeMap);
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update Routes & Colors dynamically
    useEffect(() => {
        if (!map.current) return;

        // Update Line Colors based on status
        if (map.current.getLayer('routes-optimal')) {
            map.current.setPaintProperty('routes-optimal', 'line-color', pipelineStatus === 'error' ? '#EF4444' : '#10b981');
        }

        if (!map.current.getSource('routes')) return;

        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: routes.map(route => ({
                type: 'Feature',
                properties: {
                    id: route.id,
                    type: route.type,
                    cost: route.cost,
                    time: route.time,
                    isOptimal: route.isOptimal,
                    errorReason: route.isOptimal ? errorReason : null
                },
                geometry: {
                    type: 'LineString',
                    coordinates: route.coordinates
                }
            }))
        };

        (map.current.getSource('routes') as maplibregl.GeoJSONSource).setData(geojson);
    }, [routes, pipelineStatus, errorReason]);

    // Update Markers
    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add Port Markers
        ports.forEach(port => {
            if (!port.coordinates) return;
            const [lat, lng] = port.coordinates; // Props are [lat, lng]

            const el = document.createElement('div');
            el.className = 'marker-port';
            el.innerHTML = renderToStaticMarkup(
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: 'rgba(6, 78, 59, 0.9)', borderRadius: '50%', border: '2px solid #10b981', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', color: '#34d399' }}>
                    <Anchor size={16} />
                </div>
            );

            const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(
                `<div style="color: #000; font-weight: bold; font-family: sans-serif;">${port.name}</div>
         <div style="color: #444; font-family: sans-serif;">Yard: ${port.yardOccupancy}%</div>`
            );

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat]) // MapLibre takes [lng, lat]
                .setPopup(popup)
                .addTo(map.current!);

            markers.current.push(marker);
        });

        // Add Vessel Markers
        vessels.forEach(vessel => {
            const coords = parseCoordinates(vessel.coordinates);
            if (coords) {
                const el = document.createElement('div');
                el.className = 'marker-vessel';
                el.innerHTML = renderToStaticMarkup(
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: 'rgba(30, 58, 138, 0.9)', borderRadius: '50%', border: '2px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', color: '#60a5fa' }}>
                        <Ship size={16} />
                    </div>
                );

                const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(
                    `<div style="color: #000; font-weight: bold; font-family: sans-serif;">${vessel.name}</div>
                     <div style="color: #444; font-family: sans-serif;">${vessel.status}</div>
                     <div style="color: #666; font-size: 0.8em; font-family: sans-serif;">Speed: ${vessel.speed} kn</div>`
                );

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat(coords)
                    .setPopup(popup)
                    .addTo(map.current!);

                markers.current.push(marker);
            }
        });

    }, [ports, vessels]);

    return (
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0 bg-gray-50">
            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full"
                style={{ width: '100%', height: '100%' }} // Explicit inline style
            />

            <div className="absolute top-4 left-4 bg-white/95 p-3 rounded-xl border border-gray-200 text-xs z-[10] shadow-sm backdrop-blur-sm">
                <div className="font-bold text-text-primary mb-2">Pipeline Health</div>
                <div className={`flex items-center gap-2 mb-1 font-medium ${pipelineStatus === 'healthy' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${pipelineStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                    {pipelineStatus === 'healthy' ? 'Optimal Flow' : 'Constraint Violation Detected'}
                </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-xl border border-gray-200 text-xs text-text-secondary z-[10] pointer-events-none shadow-sm backdrop-blur-sm">
                <div className="font-bold mb-1 text-text-primary">Legend</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Port</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Vessel</div>
                <div className="flex items-center gap-2 mt-1 border-t border-gray-200 pt-1"><span className="w-4 h-1 rounded bg-emerald-500"></span> Best Route</div>
                <div className="flex items-center gap-2"><span className="w-4 h-1 rounded bg-slate-400 border-b border-t-0 border-dashed"></span> Other Route</div>
            </div>
        </div>
    );
};

export default LiveMap;