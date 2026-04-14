"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useRef, useCallback } from "react";

const DEFAULT_CENTER = { lat: 28.6024, lng: -81.2001 };
const API_KEY = "AIzaSyCuYIVr7hc_of89Fx6m3vZ_9NmFjCGRLk0";

const ROCKET_ICON = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
const GS_ICON     = "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";

interface MapProps {
  lat:    number | null;
  lon:    number | null;
  gsLat?: number | null;
  gsLon?: number | null;
}

export default function MapComponent({ lat, lon, gsLat, gsLon }: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const rocketPos = lat != null && lon != null
    ? { lat, lng: lon }
    : null;

  const gsPos = gsLat != null && gsLon != null
    ? { lat: gsLat, lng: gsLon }
    : null;

  const center = rocketPos ?? gsPos ?? DEFAULT_CENTER;

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (rocketPos && gsPos) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(rocketPos);
        bounds.extend(gsPos);
        map.fitBounds(bounds, 80);
      }
    },
    [rocketPos?.lat, rocketPos?.lng, gsPos?.lat, gsPos?.lng]
  );

  return (
    <LoadScript googleMapsApiKey={API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px", borderRadius: "12px" }}
        zoom={15}
        center={center}
        onLoad={onLoad}
        options={{ mapTypeId: "hybrid", zoomControl: true }}
      >
        {rocketPos && (
          <Marker
            position={rocketPos}
            icon={ROCKET_ICON}
            title={`ROCKET — LAT: ${lat?.toFixed(6)}  LON: ${lon?.toFixed(6)}`}
          />
        )}
        {gsPos && (
          <Marker
            position={gsPos}
            icon={GS_ICON}
            title={`GROUND STATION — LAT: ${gsLat?.toFixed(6)}  LON: ${gsLon?.toFixed(6)}`}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}