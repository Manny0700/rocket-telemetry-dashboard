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
import { logTelemetry } from "@/lib/flightLogger";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

// Haversine distance in km between two lat/lon points
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const [rawPacket, setRawPacket] = useState<{
    pkt: number; alt: number; ax: number; ay: number; az: number;
    lat: number; lon: number; fix: number; crossings: number;
    servo: number; rssi: number;
  } | null>(null);
  const tickRef = useRef(0);

  // Ground station location
  const [gsLat, setGsLat] = useState<number | null>(null);
  const [gsLon, setGsLon] = useState<number | null>(null);
  const [gsAccuracy, setGsAccuracy] = useState<number | null>(null);
  const [gsError, setGsError] = useState<string | null>(null);
  const [gsLoading, setGsLoading] = useState(false);

  const [payloads, setPayloads] = useState([
    { id: 1, status: "ARMED" },
    { id: 2, status: "ARMED" },
    { id: 3, status: "ARMED" },
  ]);

  // ── Ground Station Geolocation ─────────────────────────────
  function locateGroundStation() {
    if (!navigator.geolocation) {
      setGsError("Geolocation not supported by this browser.");
      return;
    }
    setGsLoading(true);
    setGsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGsLat(pos.coords.latitude);
        setGsLon(pos.coords.longitude);
        setGsAccuracy(Math.round(pos.coords.accuracy));
        setGsLoading(false);
      },
      (err) => {
        setGsError(`Location error: ${err.message}`);
        setGsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Auto-request on mount
  useEffect(() => { locateGroundStation(); }, []);

  // Distance rocket ↔ ground station
  const distance =
    gsLat && gsLon && lat && lon
      ? haversineKm(gsLat, gsLon, lat, lon).toFixed(3)
      : null;

  // ── WebSocket ──────────────────────────────────────────────
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket("ws://localhost:8765");
      ws.onopen = () => setConnected(true);
      ws.onmessage = (event) => {
        try {
          const d = JSON.parse(event.data);
          const t = tickRef.current++;
          const point = {
            time: t,
            alt:       d.alt       ?? 0,
            vel:       d.vel       ?? 0,
            ax:        d.ax        ?? 0,
            ay:        d.ay        ?? 0,
            az:        d.az        ?? 0,
            lat:       d.lat       ?? 0,
            lon:       d.lon       ?? 0,
            fix:       d.fix       ?? 0,
            crossings: d.crossings ?? 0,
            servo:     d.servo     ?? 0,
            rssi:      d.rssi      ?? 0,
          };
          logTelemetry(point);
          setCurrentAlt(point.alt);
          setCurrentVel(point.vel);
          setAltitudeData((prev) => [...prev.slice(-49), point.alt]);
          setVelocityData((prev) => [...prev.slice(-49), point.vel]);
          setLabels((prev) => [...prev.slice(-49), t]);
          if (d.lat && d.lon) { setLat(d.lat); setLon(d.lon); }
          if (d.rssi) setRssi(d.rssi);
          if (d.servo === 1) {
            setPayloads((p) => p.map((x) => x.id === 1 ? { ...x, status: "DEPLOYED" } : x));
          }
          setRawPacket({ pkt: t, ...point });
        } catch { /* skip bad packets */ }
      };
      ws.onclose = () => { setConnected(false); reconnectTimer = setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
    }

    connect();
    return () => { clearTimeout(reconnectTimer); ws?.close(); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setTimeout(() => setMapLoading(false), 1200); }, []);

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

  const telemetryFields = rawPacket ? [
    { label: "PKT #",      value: rawPacket.pkt },
    { label: "ALT (m)",    value: rawPacket.alt.toFixed(2) },
    { label: "AX (g)",     value: rawPacket.ax.toFixed(3) },
    { label: "AY (g)",     value: rawPacket.ay.toFixed(3) },
    { label: "AZ (g)",     value: rawPacket.az.toFixed(3) },
    { label: "LAT",        value: rawPacket.lat.toFixed(6) },
    { label: "LON",        value: rawPacket.lon.toFixed(6) },
    { label: "GPS FIX",    value: rawPacket.fix === 3 ? "3D ✓" : rawPacket.fix === 2 ? "2D" : "NO FIX" },
    { label: "CROSSINGS",  value: rawPacket.crossings },
    { label: "SERVO",      value: rawPacket.servo === 1 ? "ACTIVATED" : "WAITING" },
    { label: "RSSI (dBm)", value: rawPacket.rssi },
  ] : [];

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

      {/* ── Ground Station Card ── */}
      <motion.div
        className="card"
        style={{ marginTop: "32px" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ margin: 0 }}>🖥️ Ground Station</h2>
          <button
            onClick={locateGroundStation}
            style={{
              background: "rgba(0,217,255,0.1)",
              border: "1px solid rgba(0,217,255,0.3)",
              color: "#00d9ff",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
            }}
          >
            {gsLoading ? "LOCATING..." : "⟳ REFRESH"}
          </button>
        </div>

        {gsError && (
          <p style={{ color: "#ff4d4d", fontSize: "0.8rem", marginTop: 12 }}>{gsError}</p>
        )}

        {gsLat && gsLon ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginTop: "16px",
          }}>
            {[
              { label: "LATITUDE",   value: gsLat.toFixed(6) + "°" },
              { label: "LONGITUDE",  value: gsLon.toFixed(6) + "°" },
              { label: "ACCURACY",   value: gsAccuracy ? `±${gsAccuracy} m` : "—" },
              { label: "ROCKET DIST", value: distance ? `${distance} km` : lat && lon ? "calculating..." : "no rocket GPS" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "12px 16px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                  {label}
                </div>
                <div style={{ color: "#00d9ff", fontSize: "1.1rem", fontWeight: "bold", marginTop: "4px" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        ) : !gsLoading && (
          <p style={{ color: "rgba(255,255,255,0.3)", marginTop: 12, fontSize: "0.85rem" }}>
            Allow location access in your browser to show ground station coordinates.
          </p>
        )}
      </motion.div>

      {/* ── Charts ── */}
      <div className="telemetryGrid">
        <div className="card">
          <h3>Altitude (m)</h3>
          <Line data={{ labels, datasets: [{ data: altitudeData, borderColor: "#00d9ff",
            borderWidth: 2, pointRadius: 0, fill: true,
            backgroundColor: "rgba(0,217,255,0.06)" }] }} options={chartOptions} />
        </div>
        <div className="card">
          <h3>Velocity (m/s)</h3>
          <Line data={{ labels, datasets: [{ data: velocityData, borderColor: velColor,
            borderWidth: 2, pointRadius: 0, fill: true,
            backgroundColor: `${velColor}18` }] }} options={chartOptions} />
        </div>
      </div>

      {/* ── Map ── */}
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

      {/* ── Live Telemetry Feed ── */}
      <div className="card" style={{ marginTop: "40px", fontFamily: "monospace" }}>
        <h2>📡 Live Telemetry Feed</h2>
        {rawPacket ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginTop: "16px",
          }}>
            {telemetryFields.map(({ label, value }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "12px 16px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                  {label}
                </div>
                <div style={{
                  color:
                    label === "GPS FIX" && rawPacket.fix === 3 ? "#00ff9f" :
                    label === "GPS FIX" && rawPacket.fix === 0 ? "#ff4d4d" :
                    label === "SERVO" && rawPacket.servo === 1 ? "#ff4d4d" :
                    label === "RSSI (dBm)" && rawPacket.rssi < -90 ? "#ffaa00" : "#00d9ff",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginTop: "4px",
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.3)", marginTop: "12px" }}>
            Waiting for telemetry packets...
          </p>
        )}
      </div>

      {/* ── Payloads ── */}
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