"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useRef, useCallback } from "react";

const DEFAULT_CENTER = { lat: 28.6024, lng: -81.2001 };

interface MapProps {
  lat: number | null;
  lon: number | null;
}

export default function MapComponent({ lat, lon }: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const position =
    lat !== null && lon !== null ? { lat, lng: lon } : DEFAULT_CENTER;

  useCallback(() => {
    if (mapRef.current && lat !== null && lon !== null) {
      mapRef.current.panTo({ lat, lng: lon });
    }
  }, [lat, lon])();

  return (
    <LoadScript googleMapsApiKey="AIzaSyCuYIVr7hc_of89Fx6m3vZ_9NmFjCGRLk0">
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "400px",
          borderRadius: "12px",
        }}
        zoom={15}
        center={position}
        onLoad={onLoad}
        options={{ mapTypeId: "hybrid", zoomControl: true }}
      >
        <Marker
          position={position}
          title={
            lat !== null
              ? `LAT: ${lat.toFixed(6)}  LON: ${lon?.toFixed(6)}`
              : "Awaiting GPS fix..."
          }
        />
      </GoogleMap>
    </LoadScript>
  );
}