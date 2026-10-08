import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  ZoneRisk,
} from '../../types';
import {
  Layers,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Info,
  MapPin,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface LiveWaterMapProps {
  incidents: Incident[];
  zonesRisk?: ZoneRisk[];
  onSelectIncident?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}

export const LiveWaterMap: React.FC<LiveWaterMapProps> = ({
  incidents,
  zonesRisk = [],
  onSelectIncident,
  center = [28.6180, 77.2180],
  zoom = 13,
  heightClass = 'h-[620px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [showZoneRiskOverlay, setShowZoneRiskOverlay] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.locationAddress.toLowerCase().includes(q) ||
          inc.zoneName.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedCategory !== 'ALL' && inc.category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) return false;
      if (selectedZone !== 'ALL' && inc.zoneId !== selectedZone) return false;

      return true;
    });
  }, [incidents, searchQuery, selectedCategory, selectedSeverity, selectedStatus, selectedZone]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
      });

      // CartoDB Dark Matter / OSM style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      zonesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Zones Risk Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !zonesLayerRef.current) return;
    zonesLayerRef.current.clearLayers();

    if (!showZoneRiskOverlay || zonesRisk.length === 0) return;

    zonesRisk.forEach((z) => {
      let color = '#22c55e'; // Green
      let fillColor = '#22c55e';
      if (z.overallRiskLevel === 'EXTREME') {
        color = '#ef4444';
        fillColor = '#ef4444';
      } else if (z.overallRiskLevel === 'HIGH') {
        color = '#f97316';
        fillColor = '#f97316';
      } else if (z.overallRiskLevel === 'MODERATE') {
        color = '#eab308';
        fillColor = '#eab308';
      }

      const circle = L.circle(z.coordinates, {
        radius: z.radiusMeters || 1600,
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 8',
      });

      circle.bindTooltip(
        `<div class="text-xs p-1">
          <div class="font-bold text-slate-900">${z.zoneName}</div>
          <div class="text-[11px] text-slate-600">Overall Risk: <b>${z.overallRiskLevel}</b> (${z.overallRiskScore}/100)</div>
          <div class="text-[10px] text-slate-500">Active Leaks: ${z.activeIncidentCount} | Heat: ${z.heatIndexC}°C</div>
        </div>`,
        { permanent: false, direction: 'top' }
      );

      circle.addTo(zonesLayerRef.current!);
    });
  }, [zonesRisk, showZoneRiskOverlay]);

  // Sync Incident Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    filteredIncidents.forEach((inc) => {
      // Determine marker color
      let markerColor = '#eab308'; // Medium (yellow)
      let pulseRing = false;

      if (inc.status === 'RESOLVED' || inc.status === 'CLOSED') {
        markerColor = '#22c55e'; // Green
      } else if (inc.severity === 'CRITICAL') {
        markerColor = '#ef4444'; // Red
        pulseRing = true;
      } else if (inc.severity === 'HIGH') {
        markerColor = '#f97316'; // Orange
      }

      const iconHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          ${
            pulseRing
              ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${markerColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ''
          }
          <div style="width: 22px; height: 22px; border-radius: 50%; background: ${markerColor}; border: 2.5px solid #0f172a; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
            ${inc.severity === 'CRITICAL' ? '!' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker(inc.coordinates, { icon: customIcon });

      // Build rich popup HTML
      const popupContent = `
        <div style="font-family: inherit; width: 260px; padding: 12px; background: #0f172a; color: #f8fafc; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px;">${inc.id}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${markerColor}22; color: ${markerColor}; border: 1px solid ${markerColor}55;">
              ${inc.severity}
            </span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 6px;">
            ${inc.title}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            📍 ${inc.locationAddress}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px 8px; background: #1e293b; border-radius: 6px; font-size: 10px; margin-bottom: 10px;">
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Est. Loss</div>
              <div style="color: #38bdf8; font-weight: 700;">${inc.estimatedWaterLossLitersPerDay.toLocaleString()} L/d</div>
            </div>
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Affected</div>
              <div style="color: #f1f5f9; font-weight: 700;">~${inc.affectedPopulation.toLocaleString()}</div>
            </div>
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Status</div>
              <div style="color: #10b981; font-weight: 700;">${inc.status}</div>
            </div>
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Team</div>
              <div style="color: #f1f5f9; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${inc.assignedTeamName ? 'Team 7' : 'Pending'}
              </div>
            </div>
          </div>
          <button id="view-btn-${inc.id}" style="width: 100%; background: #0284c7; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center; transition: background 0.2s;">
            Open Incident Details →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, closeButton: false });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${inc.id}`);
        if (btn && onSelectIncident) {
          btn.onclick = () => {
            onSelectIncident(inc);
            marker.closePopup();
          };
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredIncidents, onSelectIncident]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 bg-slate-900/90 p-3 text-xs">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident ID, address, zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="PIPELINE_LEAK">Pipeline Leak</option>
            <option value="WATER_SHORTAGE">Water Shortage</option>
            <option value="FLOODING">Flooding</option>
            <option value="DRAINAGE_PROBLEM">Drainage</option>
            <option value="WATER_CONTAMINATION">Contamination</option>
            <option value="TANK_OVERFLOW">Tank Overflow</option>
            <option value="INFRASTRUCTURE_DAMAGE">Damage</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">🟢 Resolved</option>
          </select>

          {/* Zone */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Zones</option>
            <option value="zone-14">Sector 14 (Central)</option>
            <option value="zone-07">Sector 7 (Tech Hub)</option>
            <option value="zone-22">Sector 22 (South)</option>
            <option value="zone-09">Sector 9 (Industrial)</option>
            <option value="zone-03">Sector 3 (North)</option>
          </select>

          {/* Zone Heat/Water Risk Overlay Toggle */}
          <button
            onClick={() => setShowZoneRiskOverlay(!showZoneRiskOverlay)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              showZoneRiskOverlay
                ? 'border-amber-600/50 bg-amber-950/40 text-amber-300'
                : 'border-slate-800 bg-slate-950/80 text-slate-400'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Heat/Water Risk Overlay</span>
          </button>
        </div>
      </div>

      {/* Leaflet Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0 dark-map`} />

      {/* Floating Legend / Quick Status Overlay */}
      <div className="absolute bottom-4 left-4 z-20 max-w-xs rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 backdrop-blur-md shadow-xl text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span>GIS Map Legend</span>
          </div>
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="text-[10px] text-slate-400 hover:text-white"
          >
            {isLegendOpen ? 'Hide' : 'Show'}
          </button>
        </div>

        {isLegendOpen && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-slate-300">Critical (&gt;80 priority)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-300">High (60-79)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="text-slate-300">Medium (40-59)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Resolved / Safe</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Showing: <b>{filteredIncidents.length}</b> markers</span>
              <span className="text-cyan-400">Live Spatial Sync</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
