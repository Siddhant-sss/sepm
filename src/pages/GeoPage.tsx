import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  AlertTriangle,
  Compass,
  Navigation,
  Shield,
  Activity,
  Sliders,
  Maximize2,
  Info,
  Clock,
  ArrowRight,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { GeographicFeature } from '../types';
import L from 'leaflet';

export const GeoPage: React.FC = () => {
  const { geoFeatures, weather, activeUser } = useTacticalStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer filters
  const [showBases, setShowBases] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showHazardZones, setShowHazardZones] = useState(true);

  // Selected feature details
  const [selectedFeature, setSelectedFeature] = useState<GeographicFeature | null>(geoFeatures[0]);

  // Scenario Simulator
  const [activeScenario, setActiveScenario] = useState<'normal' | 'bridge-closure' | 'mountain-slide'>('normal');

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [34.6100, -116.8200],
        zoom: 11,
        zoomControl: false,
      });

      // Dark tactical map tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap contributors (Simulated Defense GIS Cache)',
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create LayerGroup for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    const markerGroup = markersLayerRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    // Custom tactical icons generator
    const createTacticalPin = (type: string, status: string) => {
      let color = '#48C774';
      if (status === 'Caution') color = '#F2B84B';
      if (status === 'Compromised' || status === 'Blocked') color = '#FF6464';

      return L.divIcon({
        className: 'custom-tactical-pin',
        html: `
          <div style="background-color: #151A17; border: 2px solid ${color}; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${color}88;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
    };

    // Filter features according to layer checkboxes
    const visibleFeatures = geoFeatures.filter((feat) => {
      if (feat.type.includes('Base') || feat.type.includes('Outpost')) return showBases;
      if (feat.type.includes('Medical')) return showMedical;
      if (feat.type.includes('Warehouse')) return showWarehouses;
      if (feat.type.includes('Bridge') || feat.type.includes('Transit')) return showBridges;
      return true;
    });

    visibleFeatures.forEach((feat) => {
      // Adapt status if scenario is active
      let effectiveStatus = feat.status;
      if (activeScenario === 'bridge-closure' && feat.id === 'GEO-04') {
        effectiveStatus = 'Blocked';
      }
      if (activeScenario === 'mountain-slide' && feat.id === 'GEO-05') {
        effectiveStatus = 'Blocked';
      }

      const marker = L.marker(feat.coordinates, {
        icon: createTacticalPin(feat.type, effectiveStatus),
      });

      marker.on('click', () => {
        setSelectedFeature(feat);
      });

      marker.bindPopup(`
        <div style="background: #202821; color: #E8EBDD; padding: 4px; font-family: Inter, sans-serif;">
          <strong style="color: #B7AA83; text-transform: uppercase; font-size: 11px;">${feat.type}</strong>
          <h4 style="margin: 2px 0; font-size: 13px; font-weight: bold;">${feat.name}</h4>
          <p style="margin: 0; font-size: 11px; color: #A9B39F;">Elevation: ${feat.elevationMeters}m • Accessibility: ${feat.accessibilityScore}%</p>
        </div>
      `);

      markerGroup.addLayer(marker);
    });

    // Draw Transit Corridor Polylines (Simulated Logistics Transit Routes)
    const routeCoords: [number, number][] = [
      [34.5505, -116.8901], // Base HQ
      [34.4820, -116.9600], // Warehouse Depot 4
      [34.5910, -116.8110], // Bridge Bravo
      [34.6200, -116.7800], // Forward Surgical Alpha
      [34.6850, -116.7420], // Outpost Falcon
    ];

    const routeColor = activeScenario === 'bridge-closure' ? '#FF6464' : '#747653';
    const routeLine = L.polyline(routeCoords, {
      color: routeColor,
      weight: 3,
      dashArray: activeScenario === 'bridge-closure' ? '6, 8' : undefined,
      opacity: 0.8,
    });
    markerGroup.addLayer(routeLine);

    // Hazard Area Circle if hazard zones toggled
    if (showHazardZones) {
      const hazardZone = L.circle([34.5910, -116.8110], {
        color: '#F2B84B',
        fillColor: '#F2B84B',
        fillOpacity: 0.15,
        radius: 2500,
        weight: 1,
        dashArray: '4, 4',
      });
      hazardZone.bindTooltip('Flash Flood Inundation Buffer Zone (Bridge Bravo Corridor)');
      markerGroup.addLayer(hazardZone);
    }
  }, [
    geoFeatures,
    showBases,
    showMedical,
    showWarehouses,
    showBridges,
    showHazardZones,
    activeScenario,
  ]);

  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="text-[#48C774]" size={16} />
          <span>
            <strong>Terrain & Infrastructure Risk Telemetry:</strong> Defensive preparedness, weather overlays, and supply conduit resilience. (No autonomous targeting capability).
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#A9B39F]">
          <span className="rounded bg-[#151A17] px-2 py-0.5 border border-[#465044] text-[#B7AA83]">
            DATA SOURCE: REGIONAL DEFENSE GIS (SIMULATED CACHE)
          </span>
        </div>
      </div>

      {/* Main Map + Side Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column (3 spans): Tactical Map and Layer Toggles */}
        <div className="lg:col-span-3 space-y-4">
          <TacticalCard noPadding className="relative">
            {/* Layer Controls Bar overlay on top */}
            <div className="border-b border-[#465044] bg-[#1a211b] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#B7AA83] font-mono font-semibold">
                <Layers size={14} /> Layer Toggles:
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#E8EBDD]">
                  <input
                    type="checkbox"
                    checked={showBases}
                    onChange={(e) => setShowBases(e.target.checked)}
                    className="rounded border-[#465044] bg-[#151A17] text-[#48C774]"
                  />
                  <span>Bases & Outposts</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#E8EBDD]">
                  <input
                    type="checkbox"
                    checked={showBridges}
                    onChange={(e) => setShowBridges(e.target.checked)}
                    className="rounded border-[#465044] bg-[#151A17] text-[#48C774]"
                  />
                  <span>Bridges & Transit Conduits</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#E8EBDD]">
                  <input
                    type="checkbox"
                    checked={showMedical}
                    onChange={(e) => setShowMedical(e.target.checked)}
                    className="rounded border-[#465044] bg-[#151A17] text-[#48C774]"
                  />
                  <span>Medical Facilities</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#E8EBDD]">
                  <input
                    type="checkbox"
                    checked={showWarehouses}
                    onChange={(e) => setShowWarehouses(e.target.checked)}
                    className="rounded border-[#465044] bg-[#151A17] text-[#48C774]"
                  />
                  <span>Warehouses & Fuel</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#F2B84B]">
                  <input
                    type="checkbox"
                    checked={showHazardZones}
                    onChange={(e) => setShowHazardZones(e.target.checked)}
                    className="rounded border-[#465044] bg-[#151A17] text-[#F2B84B]"
                  />
                  <span>Hazard Inundation Buffer</span>
                </label>
              </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div
              ref={mapContainerRef}
              className="h-[520px] w-full bg-[#151A17] z-10"
              style={{ minHeight: '520px' }}
            />

            {/* Map Legend Overlay in bottom left */}
            <div className="absolute bottom-4 left-4 z-20 rounded-md border border-[#465044] bg-[#151A17]/90 backdrop-blur p-2.5 text-[11px] font-mono space-y-1">
              <p className="text-[#B7AA83] font-bold uppercase mb-1">Tactical Map Legend</p>
              <div className="flex items-center gap-2 text-[#48C774]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#48C774]" /> Operational Facility
              </div>
              <div className="flex items-center gap-2 text-[#F2B84B]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F2B84B]" /> Caution / Load Restriction
              </div>
              <div className="flex items-center gap-2 text-[#FF6464]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF6464]" /> Impassable / Blocked Conduit
              </div>
              <div className="flex items-center gap-2 text-[#747653]">
                <span className="h-0.5 w-4 bg-[#747653]" /> Main Logistics Transit Line
              </div>
            </div>
          </TacticalCard>

          {/* Strategic Scenario Comparison Simulator */}
          <TacticalCard
            title="Strategic Disruption & Scenario Comparison"
            subtitle="Simulate environmental hazards, bridge collapse or road blocks to evaluate supply delay"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveScenario('normal')}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    activeScenario === 'normal'
                      ? 'border-[#48C774] bg-[#48C774]/10'
                      : 'border-[#465044] bg-[#1a211b] hover:bg-[#202821]'
                  }`}
                >
                  <p className="font-semibold text-xs text-[#E8EBDD] font-mono">
                    Scenario 1: Baseline Normal
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-1">
                    All bridges passable, weather nominal. Ground convoy transit time: 2.1 hours.
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-[#48C774] font-mono font-bold">
                    TRANSIT DELAY: +0 MIN
                  </span>
                </button>

                <button
                  onClick={() => setActiveScenario('bridge-closure')}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    activeScenario === 'bridge-closure'
                      ? 'border-[#FF6464] bg-[#FF6464]/10'
                      : 'border-[#465044] bg-[#1a211b] hover:bg-[#202821]'
                  }`}
                >
                  <p className="font-semibold text-xs text-[#E8EBDD] font-mono">
                    Scenario 2: Bridge Bravo Flood
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-1">
                    River runoff exceeds abutment limits. Supply convoys rerouted via Southern Pass.
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-[#FF6464] font-mono font-bold">
                    TRANSIT DELAY: +4.2 HOURS
                  </span>
                </button>

                <button
                  onClick={() => setActiveScenario('mountain-slide')}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    activeScenario === 'mountain-slide'
                      ? 'border-[#F2B84B] bg-[#F2B84B]/10'
                      : 'border-[#465044] bg-[#1a211b] hover:bg-[#202821]'
                  }`}
                >
                  <p className="font-semibold text-xs text-[#E8EBDD] font-mono">
                    Scenario 3: Mountain Pass Echo Block
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-1">
                    400m rockfall blocks wheeled vehicles. Emergency supplies require UH-60 airlift.
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-[#F2B84B] font-mono font-bold">
                    AIRLIFT RESUPPLY ONLY
                  </span>
                </button>
              </div>

              {activeScenario !== 'normal' && (
                <div className="p-3 bg-[#151A17] rounded border border-[#FF6464]/50 text-xs text-[#E8EBDD] flex items-start gap-2">
                  <AlertTriangle className="text-[#FF6464] shrink-0 mt-0.5" size={16} />
                  <div>
                    <strong>Impact Assessment on Joint Task Force Operations:</strong>
                    {activeScenario === 'bridge-closure' && (
                      <p className="text-[#A9B39F] mt-0.5">
                        Logistics Convoy Alpha cannot reach Forward Base Falcon directly. Emergency fuel bladders at Falcon are depleted within 36 hours unless secondary route clearance is completed.
                      </p>
                    )}
                    {activeScenario === 'mountain-slide' && (
                      <p className="text-[#A9B39F] mt-0.5">
                        Northern Observation posts isolated from ground medevac. 12th Aviation Regiment placed on high readiness status for hoist extraction.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TacticalCard>
        </div>

        {/* Right Column (1 span): Selected Feature Details & Risk Matrix */}
        <div className="space-y-6">
          {selectedFeature && (
            <TacticalCard
              title="Infrastructure Profile"
              subtitle={`Node ID: ${selectedFeature.id}`}
              badge={<StatusBadge status={selectedFeature.status} size="sm" />}
            >
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#E8EBDD]">{selectedFeature.name}</h4>
                  <p className="text-[11px] text-[#B7AA83] font-mono">{selectedFeature.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px]">
                  <div>
                    <span className="text-[#A9B39F] block">Elevation:</span>
                    <span className="text-[#E8EBDD] font-semibold">{selectedFeature.elevationMeters}m MSL</span>
                  </div>
                  <div>
                    <span className="text-[#A9B39F] block">Accessibility:</span>
                    <span className="text-[#48C774] font-semibold">{selectedFeature.accessibilityScore}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#A9B39F] block">Coordinates:</span>
                    <span className="text-[#E8EBDD]">
                      {selectedFeature.coordinates[0].toFixed(4)}° N, {Math.abs(selectedFeature.coordinates[1]).toFixed(4)}° W
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[#B7AA83] font-mono text-[11px] uppercase block">Operational Role / Capacity:</span>
                  <p className="text-[#E8EBDD] mt-0.5">{selectedFeature.capacityOrDetails}</p>
                </div>

                {selectedFeature.hazardRisks.length > 0 ? (
                  <div className="space-y-2 border-t border-[#465044] pt-2">
                    <span className="text-[#F2B84B] font-mono text-[11px] uppercase block font-semibold">
                      Identified Environmental Hazards:
                    </span>
                    {selectedFeature.hazardRisks.map((risk, idx) => (
                      <div key={idx} className="p-2 rounded bg-[#F2B84B]/10 border border-[#F2B84B]/40 text-[11px]">
                        <div className="flex justify-between font-mono font-semibold text-[#F2B84B]">
                          <span>{risk.type}</span>
                          <span>{risk.severity}</span>
                        </div>
                        <p className="text-[#E8EBDD] mt-0.5">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-t border-[#465044] pt-2 text-[#48C774] font-mono text-[11px]">
                    ✔ No critical structural or weather hazards detected
                  </div>
                )}
              </div>
            </TacticalCard>
          )}

          {/* Infrastructure Directory List */}
          <TacticalCard
            title="Strategic Points of Interest"
            subtitle="Click node to center tactical telemetry"
          >
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {geoFeatures.map((feat) => (
                <div
                  key={feat.id}
                  onClick={() => {
                    setSelectedFeature(feat);
                    if (leafletMapRef.current) {
                      leafletMapRef.current.flyTo(feat.coordinates, 13);
                    }
                  }}
                  className={`p-2.5 rounded border cursor-pointer transition-colors text-xs ${
                    selectedFeature?.id === feat.id
                      ? 'border-[#B7AA83] bg-[#263128]'
                      : 'border-[#465044] bg-[#1a211b] hover:bg-[#202821]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#E8EBDD] truncate">{feat.name}</span>
                    <StatusBadge status={feat.status} size="sm" />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#A9B39F] font-mono">
                    <span>{feat.type}</span>
                    <span>Elev: {feat.elevationMeters}m</span>
                  </div>
                </div>
              ))}
            </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
};
