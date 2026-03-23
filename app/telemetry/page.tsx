"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MapComponent from "@/components/MapComponent";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

export default function TelemetryPage() {
  const [altitudeData, setAltitudeData] = useState<number[]>([]);
  const [velocityData, setVelocityData] = useState<number[]>([]);
  const [labels, setLabels] = useState<number[]>([]);

  const [payloads, setPayloads] = useState([
    { id: 1, status: "ARMED" },
    { id: 2, status: "ARMED" },
    { id: 3, status: "ARMED" },
  ]);

  const [loading, setLoading] = useState(true);

  // 📡 Telemetry simulation
  useEffect(() => {
    let t = 0;

    const interval = setInterval(() => {
      const alt = Math.floor(Math.random() * 1000);
      const vel = Math.floor(Math.random() * 300);

      setAltitudeData((prev) => [...prev.slice(-10), alt]);
      setVelocityData((prev) => [...prev.slice(-10), vel]);
      setLabels((prev) => [...prev.slice(-10), t++]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⏳ Map loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // 🎯 Payload simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPayloads([
        { id: 1, status: "DEPLOYED" },
        { id: 2, status: "ARMED" },
        { id: 3, status: "ARMED" },
      ]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container">
      {/* 🚀 HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🚀 PLEIADES Mission Control
      </motion.h1>

      <p>Live Rocket Telemetry & Tracking</p>

      {/* 📊 CHARTS */}
      <div className="telemetryGrid">
        <div className="card">
          <h3>Altitude</h3>
          <Line
            data={{
              labels,
              datasets: [
                {
                  data: altitudeData,
                  borderColor: "#00d9ff",
                  borderWidth: 2,
                  pointRadius: 0,
                },
              ],
            }}
          />
        </div>

        <div className="card">
          <h3>Velocity</h3>
          <Line
            data={{
              labels,
              datasets: [
                {
                  data: velocityData,
                  borderColor: "#ff4d4d",
                  borderWidth: 2,
                  pointRadius: 0,
                },
              ],
            }}
          />
        </div>
      </div>

      {/* 🗺️ MAP */}
      <div className="card" style={{ marginTop: "40px" }}>
        <h2>Live Tracking</h2>
        {loading ? <p>Loading...</p> : <MapComponent />}
      </div>

      {/* 🎯 PAYLOADS */}
      <div className="telemetryGrid" style={{ marginTop: "40px" }}>
        {payloads.map((p) => (
          <div className="card" key={p.id}>
            <h2>Payload {p.id}</h2>
            <p
              style={{
                color:
                  p.status === "DEPLOYED"
                    ? "#00ff9f"
                    : "#ffaa00",
              }}
            >
              {p.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}