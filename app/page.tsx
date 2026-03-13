"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";

export default function HomePage() {

  const [position, setPosition] = useState({
    lat: 28.6024,
    lng: -81.2001
  });

  const [path, setPath] = useState<any[]>([]);

  const launchPad = {
    lat: 28.6024,
    lng: -81.2001
  };

  useEffect(() => {

    const interval = setInterval(() => {

      // Simulated rocket movement
      const newLat = position.lat + (Math.random() - 0.5) * 0.001;
      const newLng = position.lng + (Math.random() - 0.5) * 0.001;

      const newPosition = {
        lat: newLat,
        lng: newLng
      };

      setPosition(newPosition);

      setPath(prev => [...prev, newPosition]);

    }, 1000);

    return () => clearInterval(interval);

  }, [position]);

  return (

    <div style={{ padding: "40px" }}>

      <h1>PLEIADES Rocket Mission Control</h1>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >

        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "600px"
          }}
          zoom={14}
          center={launchPad}
        >

          {/* Launch Pad */}

          <Marker
            position={launchPad}
            label="Launch"
          />

          {/* Rocket */}

          <Marker
            position={position}
            label="Rocket"
          />

          {/* Trajectory Path */}

          <Polyline
            path={path}
            options={{
              strokeColor: "#00E5FF",
              strokeOpacity: 1,
              strokeWeight: 3
            }}
          />

        </GoogleMap>

      </LoadScript>

    </div>

  );
}