import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import type { Location } from "../types";

const icon = (active: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${active ? "#D4A843" : "#476E55"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -26],
  });
const youIcon = L.divIcon({ className: "", html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb55"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });

type Pt = Location & { latitude: number; longitude: number };
const hasCoords = (l: Location): l is Pt => l.latitude != null && l.longitude != null;

function Fit({ points, selected, near, radiusKm }: { points: Pt[]; selected: Location | null; near: Props["near"]; radiusKm?: number }) {
  const map = useMap();
  useEffect(() => {
    if (selected && hasCoords(selected)) { map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 14)); return; }
    if (near && !points.length) { map.setView([near.lat, near.lng], 12); return; }
    if (!points.length) return;
    const b = L.latLngBounds(points.map((l) => [l.latitude, l.longitude] as [number, number]));
    if (near) b.extend([near.lat, near.lng]);
    map.fitBounds(b, { padding: [40, 40], maxZoom: 14 });
  }, [points, selected, near, radiusKm, map]);
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 100); return () => clearTimeout(t); }, [map]);
  return null;
}

interface Props {
  locations: Location[];
  selected: Location | null;
  near?: { lat: number; lng: number } | null;
  radiusKm?: number;
  className?: string;
  single?: boolean;
}

export function MapView({ locations, selected, near, radiusKm, className = "h-[60vh] lg:h-[640px]", single }: Props) {
  const points = locations.filter(hasCoords);
  return (
    <MapContainer center={[50.85, 4.35]} zoom={11} className={`${className} w-full rounded-2xl z-0`} scrollWheelZoom={!single}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={20}
      />
      <Fit points={points} selected={selected} near={near ?? null} radiusKm={radiusKm} />
      {near && <>
        <Marker position={[near.lat, near.lng]} icon={youIcon} />
        {radiusKm && <Circle center={[near.lat, near.lng]} radius={radiusKm * 1000} pathOptions={{ color: "#476E55", weight: 1, fillOpacity: 0.05 }} />}
      </>}
      {points.map((l) => (
        <Marker key={l.id} position={[l.latitude, l.longitude]} icon={icon(selected?.id === l.id)}>
          <Popup>
            <b>{l.name}</b><br />{l.address}, {l.city}<br />
            {!single && <Link to={`/location/${l.slug}`}>Voir la fiche</Link>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
