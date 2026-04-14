"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useRef, useCallback } from "react";

const DEFAULT_CENTER = { lat: 28.6024, lng: -81.2001 };
const API_KEY = "AIzaSyCuYIVr7hc_of89Fx6m3vZ_9NmFjCGRLk0";

interface MapProps {
  lat:   number | null;
  lon:   number | null;
  gsLat?: number | null;
  gsLon?: number | null;
}

export default function MapComponent({ lat, lon, gsLat, gsLon }: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const rocketPos = lat !== null && lon !== null
    ? { lat, lng: lon }
    : null;

  const gsPos = gsLat != null && gsLon != null
    ? { lat: gsLat, lng: gsLon }
    : null;

  const center = rocketPos ?? gsPos ?? DEFAULT_CENTER;

  // Fit bounds to show both markers when both are present
  const onLoadWithBounds = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (rocketPos && gsPos) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(rocketPos);
      bounds.extend(gsPos);
      map.fitBounds(bounds, 80);
    }
  }, [rocketPos?.lat, rocketPos?.lng, gsPos?.lat, gsPos?.lng]);

  return (
    <LoadScript googleMapsApiKey={API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px", borderRadius: "12px" }}
        zoom={15}
        center={center}
        onLoad={onLoadWithBounds}
        options={{ mapTypeId: "hybrid", zoomControl: true }}
      >
        {/* 🚀 Rocket marker — cyan */}
        {rocketPos && (
          <Marker
            position={rocketPos}
            title={`ROCKET — LAT: ${lat?.toFixed(6)}  LON: ${lon?.toFixed(6)}`}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#00d9ff",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}

        {/* 🖥️ Ground station marker — orange */}
        {gsPos && (
          <Marker
            position={gsPos}
            title={`GROUND STATION — LAT: ${gsLat?.toFixed(6)}  LON: ${gsLon?.toFixed(6)}`}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#ff8800",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}