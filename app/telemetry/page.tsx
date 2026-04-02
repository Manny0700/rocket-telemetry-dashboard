"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
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
  const [connected, setConnected] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [rssi, setRssi] = useState<number | null>(null);
  const tickRef = useRef(0);

  const [payloads, setPayloads] = useState([
    { id: 1, status: "ARMED" },
    { id: 2, status: "ARMED" },
    { id: 3, status: "ARMED" },
  ]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket("ws://localhost:8765");

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const d = JSON.parse(event.data);
          const t = tickRef.current++;
          setCurrentAlt(d.alt ?? 0);
          setCurrentVel(d.vel ?? 0);
          setAltitudeData((prev) => [...prev.slice(-49), d.alt ?? 0]);
          setVelocityData((prev) => [...prev.slice(-49), d.vel ?? 0]);
          setLabels((prev) => [...prev.slice(-49), t]);
          if (d.lat && d.lon) { setLat(d.lat); setLon(d.lon); }
          if (d.rssi) setRssi(d.rssi);
          if (d.servo === 1) {
            setPayloads((p) => p.map((x) => x.id === 1 ? { ...x, status: "DEPLOYED" } : x));
          }
        } catch { /* skip bad packets */ }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => { clearTimeout(reconnectTimer); ws?.close(); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => setMapLoading(false), 1200);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const velColor = currentVel > 200 ? "#ff4d4d" : currentVel > 100 ? "#ffaa00" : "#00ff9f";

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

      <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
        🚀 PLEIADES Mission Control
      </motion.h1>
      <p>Live Rocket Telemetry & Tracking</p>

      <div style={{ textAlign: "center", fontSize: "0.75rem", marginBottom: "8px",
        color: connected ? "#00ff9f" : "#ff4d4d", letterSpacing: "0.1em" }}>
        {connected
          ? `● ESP32 CONNECTED${rssi ? `  |  RSSI: ${rssi} dBm` : ""}`
          : "● WAITING FOR ESP32 BRIDGE..."}
      </div>

      <motion.div className="met-bar" initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
          <Line data={{ labels, datasets: [{ data: altitudeData, borderColor: "#00d9ff",
            borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: "rgba(0,217,255,0.06)" }] }}
            options={chartOptions} />
        </div>
        <div className="card">
          <h3>Velocity (m/s)</h3>
          <Line data={{ labels, datasets: [{ data: velocityData, borderColor: velColor,
            borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: `${velColor}18` }] }}
            options={chartOptions} />
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
          <MapComponent lat={lat} lon={lon} />
        )}
      </div>

      <div className="telemetryGrid" style={{ marginTop: "40px" }}>
        {payloads.map((p) => (
          <div className="card" key={p.id}>
            <div className="payload-header">
              <h2>Payload {p.id}</h2>
              <span className={`status-badge ${p.status === "DEPLOYED" ? "badge-deployed" : "badge-armed"}`}>
                <span className={`status-dot ${p.status === "DEPLOYED" ? "dot-green" : "dot-yellow"}`} />
                {p.status}
              </span>
            </div>
            <p className="payload-sub">
              {p.status === "DEPLOYED" ? "Separation confirmed. Nominal trajectory." : "Awaiting deployment command."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}