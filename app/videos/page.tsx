"use client";

import { motion } from "framer-motion";

const videos = [
  {
    id: 1,
    title: "Launch Test",
    embedUrl: "https://drive.google.com/file/d/14FfvHMgrBPrGcw1YAjPjhxhqdsd7_taX/preview",
    description: "Full-scale static fire and launch sequence test.",
  },
];

const timeline = [
  { phase: "T-0:00", label: "Engine Ignition",  detail: "Main engine startup sequence initiated." },
  { phase: "T+0:02", label: "Liftoff",           detail: "Vehicle clears the launch pad." },
  { phase: "T+0:45", label: "Max-Q",             detail: "Maximum aerodynamic pressure reached." },
  { phase: "T+2:10", label: "MECO",              detail: "Main engine cutoff. Coast phase begins." },
  { phase: "T+4:30", label: "Apogee",            detail: "Peak altitude reached. Payload deployment." },
  { phase: "T+6:00", label: "Recovery",          detail: "Drogue and main chute deployment." },
];

export default function DemonstrationsPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>

      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Mission Demonstrations
      </motion.h1>

      <motion.h2
        style={{ marginTop: "40px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Mission Timeline
      </motion.h2>

      <div className="timeline">
        {timeline.map((item, i) => (
          <motion.div
            key={i}
            className="timeline-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i }}
          >
            <div className="timeline-dot" />
            <div className="timeline-content">
              <span className="timeline-phase">{item.phase}</span>
              <span className="timeline-label">{item.label}</span>
              <p className="timeline-detail">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.h2
        style={{ marginTop: "50px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Launch Videos
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px" }}>
        {videos.map((v, i) => (
          <motion.div
            key={v.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i + 0.3 }}
          >
            <div style={{
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#000",
            }}>
              <iframe
                src={v.embedUrl}
                width="100%"
                height="480"
                allow="autoplay"
                style={{ border: 0, display: "block" }}
              />
            </div>
            <div style={{ padding: "16px 4px 4px" }}>
              <h3 style={{ margin: 0 }}>{v.title}</h3>
              <p style={{ color: "var(--muted)", marginTop: 6 }}>{v.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}