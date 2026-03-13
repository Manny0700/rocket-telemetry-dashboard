"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

import { logTelemetry } from "../../lib/flightLogger";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

export default function TelemetryPage() {

  const [altitudeData, setAltitudeData] = useState<number[]>([]);
  const [velocityData, setVelocityData] = useState<number[]>([]);
  const [labels, setLabels] = useState<number[]>([]);

  const [payloads, setPayloads] = useState([
    { id: 1, status: "ARMED" },
    { id: 2, status: "ARMED" },
    { id: 3, status: "ARMED" }
  ]);

  useEffect(() => {

    let time = 0;

    const interval = setInterval(() => {

      // Simulated telemetry
      const newAlt = Math.random() * 1000;
      const newVel = Math.random() * 200;

      // Update graphs
      setAltitudeData(prev => [...prev.slice(-20), newAlt]);
      setVelocityData(prev => [...prev.slice(-20), newVel]);
      setLabels(prev => [...prev.slice(-20), time]);

      // Log telemetry for post-flight report
      logTelemetry({
        altitude: newAlt,
        velocity: newVel,
        time
      });

      time++;

    }, 1000);

    // Simulate payload deployment
    const deployTimer = setTimeout(() => {

      setPayloads(prev =>
        prev.map(p =>
          p.id === 1 ? { ...p, status: "DEPLOYED" } : p
        )
      );

    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(deployTimer);
    };

  }, []);

  const altitudeChart = {
    labels,
    datasets: [
      {
        label: "Altitude (m)",
        data: altitudeData,
        borderColor: "#00E5FF",
        backgroundColor: "rgba(0,229,255,0.2)"
      }
    ]
  };

  const velocityChart = {
    labels,
    datasets: [
      {
        label: "Velocity (m/s)",
        data: velocityData,
        borderColor: "#00FF88",
        backgroundColor: "rgba(0,255,136,0.2)"
      }
    ]
  };

  return (

    <div style={{ padding: "40px" }}>

      <h1 style={{ fontSize: "40px", marginBottom: "30px" }}>
        Rocket Telemetry
      </h1>

      <div style={{ marginBottom: "50px" }}>
        <h2>Altitude</h2>
        <Line data={altitudeChart} />
      </div>

      <div style={{ marginBottom: "50px" }}>
        <h2>Velocity</h2>
        <Line data={velocityChart} />
      </div>

      <h2>Payload Deployment Status</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        {payloads.map(payload => (

          <div
            key={payload.id}
            style={{
              padding: "20px",
              background: "#0b1a2a",
              borderRadius: "10px",
              border: "1px solid #00E5FF",
              textAlign: "center"
            }}
          >

            <h3>Payload {payload.id}</h3>

            <p
              style={{
                fontSize: "20px",
                color:
                  payload.status === "DEPLOYED"
                    ? "#00FF88"
                    : "#FFD166"
              }}
            >
              {payload.status}
            </p>

          </div>

        ))}

      </div>

    </div>

  );
}