"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const videos = [
  {
    id: 1,
    title: "Rocket Launch Test",
    src: "/videos/launch1.mp4",
    description: "Full-scale static fire and launch sequence test.",
  },
  {
    id: 2,
    title: "Payload Deployment Demonstration",
    src: "/videos/payload.mp4",
    description: "Separation event and payload deployment at apogee.",
  },
];

const reports = [
  { id: 1, title: "Flight Test Report 1", href: "/reports/flight1.pdf", date: "2025-01-15" },
  { id: 2, title: "Flight Test Report 2", href: "/reports/flight2.pdf", date: "2025-03-02" },
];

const timeline = [
  { phase: "T-0:00", label: "Engine Ignition", detail: "Main engine startup sequence initiated." },
  { phase: "T+0:02", label: "Liftoff", detail: "Vehicle clears the launch pad." },
  { phase: "T+0:45", label: "Max-Q", detail: "Maximum aerodynamic pressure reached." },
  { phase: "T+2:10", label: "MECO", detail: "Main engine cutoff. Coast phase begins." },
  { phase: "T+4:30", label: "Apogee", detail: "Peak altitude reached. Payload deployment." },
  { phase: "T+6:00", label: "Recovery", detail: "Drogue and main chute deployment." },
];

export default function DemonstrationsPage() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

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

      <div className="video-grid">
        {videos.map((v, i) => (
          <motion.div
            key={v.id}
            className="video-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i + 0.3 }}
          >
            <div
              className="video-thumb"
              onClick={() => setActiveVideo(activeVideo === v.id ? null : v.id)}
            >
              {activeVideo === v.id ? (
                <video width="100%" controls autoPlay style={{ display: "block" }}>
                  <source src={v.src} type="video/mp4" />
                </video>
              ) : (
                <div className="video-thumb-inner">
                  <div className="play-btn">▶</div>
                </div>
              )}
            </div>
            <div className="video-info">
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.h2
        style={{ marginTop: "50px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Flight Reports
      </motion.h2>

      <div className="report-cards">
        {reports.map((r, i) => (
          <motion.a
            key={r.id}
            href={r.href}
            target="_blank"
            className="report-card-link"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i + 0.4 }}
          >
            <div className="report-icon">📄</div>
            <div className="report-link-info">
              <h3>{r.title}</h3>
              <p>{r.date}</p>
            </div>
            <span className="status-badge badge-deployed">
              <span className="status-dot dot-green" />
              COMPLETE
            </span>
            <span className="report-download-arrow">↓</span>
          </motion.a>
        ))}
      </div>

    </div>
  );
}