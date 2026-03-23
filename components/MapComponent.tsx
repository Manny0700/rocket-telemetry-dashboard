"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const center = {
  lat: 28.6024,
  lng: -81.2001,
};

export default function MapComponent() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyCuYIVr7hc_of89Fx6m3vZ_9NmFjCGRLk0">
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "400px",
          borderRadius: "12px",
        }}
        zoom={15}
        center={center}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}