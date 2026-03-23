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
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

export default function TelemetryPage() {
  const [altitudeData, setAltitudeData] = useState<number[]>([]);
  const [velocityData, setVelocityData] = useState<number[]>([]);
  const [labels, setLabels] = useState<number[]>([]);
  const [currentAlt, setCurrentAlt] = useState(0);
  const [currentVel, setCurrentVel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);

  const [payloads, setPayloads] = useState([
    { id: 1, status: "ARMED" },
    { id: 2, status: "ARMED" },
    { id: 3, status: "ARMED" },
  ]);

  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      const alt = Math.floor(Math.random() * 1000);
      const vel = Math.floor(Math.random() * 300);
      setCurrentAlt(alt);
      setCurrentVel(vel);
      setAltitudeData((prev) => [...prev.slice(-10), alt]);
      setVelocityData((prev) => [...prev.slice(-10), vel]);
      setLabels((prev) => [...prev.slice(-10), t++]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => setMapLoading(false), 1200);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPayloads((p) =>
        p.map((x) => (x.id === 1 ? { ...x, status: "DEPLOYED" } : x))
      );
    }, 5000);
    const t2 = setTimeout(() => {
      setPayloads((p) =>
        p.map((x) => (x.id === 2 ? { ...x, status: "DEPLOYED" } : x))
      );
    }, 12000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const velColor =
    currentVel > 200 ? "#ff4d4d" : currentVel > 100 ? "#ffaa00" : "#00ff9f";

  const chartOptions = {
    animation: { duration: 300 } as const,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { display: false },
      y: {
        ticks: { color: "rgba(255,255,255,0.45)", font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="container" style={{ position: "relative" }}>

      <div className="radar-bg" />

      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🚀 PLEIADES Mission Control
      </motion.h1>
      <p>Live Rocket Telemetry & Tracking</p>

      <motion.div
        className="met-bar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="status-dot active" />
        <span className="met-label">MET</span>
        <span className="met-time">{formatTime(elapsed)}</span>
        <span className="met-label" style={{ marginLeft: "24px" }}>ALT</span>
        <span className="met-val">{currentAlt} m</span>
        <span className="met-label" style={{ marginLeft: "24px" }}>VEL</span>
        <span className="met-val" style={{ color: velColor }}>{currentVel} m/s</span>
      </motion.div>

      <div className="telemetryGrid">
        <div className="card">
          <h3>Altitude (m)</h3>
          <Line
            data={{
              labels,
              datasets: [
                {
                  data: altitudeData,
                  borderColor: "#00d9ff",
                  borderWidth: 2,
                  pointRadius: 0,
                  fill: true,
                  backgroundColor: "rgba(0,217,255,0.06)",
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        <div className="card">
          <h3>Velocity (m/s)</h3>
          <Line
            data={{
              labels,
              datasets: [
                {
                  data: velocityData,
                  borderColor: velColor,
                  borderWidth: 2,
                  pointRadius: 0,
                  fill: true,
                  backgroundColor: `${velColor}18`,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "40px" }}>
        <h2>Live Tracking</h2>
        {mapLoading ? (
          <div className="map-loading">
            <div className="radar-spinner" />
            <p>Acquiring Signal...</p>
          </div>
        ) : (
          <MapComponent />
        )}
      </div>

      <div className="telemetryGrid" style={{ marginTop: "40px" }}>
        {payloads.map((p) => (
          <div className="card" key={p.id}>
            <div className="payload-header">
              <h2>Payload {p.id}</h2>
              <span
                className={`status-badge ${
                  p.status === "DEPLOYED" ? "badge-deployed" : "badge-armed"
                }`}
              >
                <span
                  className={`status-dot ${
                    p.status === "DEPLOYED" ? "dot-green" : "dot-yellow"
                  }`}
                />
                {p.status}
              </span>
            </div>
            <p className="payload-sub">
              {p.status === "DEPLOYED"
                ? "Separation confirmed. Nominal trajectory."
                : "Awaiting deployment command."}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}