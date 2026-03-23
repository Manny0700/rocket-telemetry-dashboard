"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* 🔲 SCANLINE OVERLAY */}
      <div className="scanlines" />

      <div className="hero-container">

        {/* 🌐 ORBITAL SYSTEM */}
        <div className="orbital-system">

          {/* CORE PLANET */}
          <div className="planet-core" />

          {/* RING 1 */}
          <div className="orbit orbit-1">
            <div className="orbit-dot" />
          </div>

          {/* RING 2 */}
          <div className="orbit orbit-2">
            <div className="orbit-dot dot-2" />
          </div>

          {/* RING 3 */}
          <div className="orbit orbit-3">
            <div className="orbit-dot dot-3" />
          </div>

        </div>

        {/* 🌟 TITLE BLOCK */}
        <motion.div
          className="title-block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <motion.p
            className="mission-label"
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0.6em" }}
            transition={{ delay: 0.8, duration: 1.2 }}
          >
            MISSION CONTROL
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            PLEIADES
          </motion.h1>

          <motion.p
            className="sub-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            Real-Time Rocket Telemetry & Tracking
          </motion.p>
        </motion.div>

        {/* 📡 MISSION STATUS BAR */}
        <motion.div
          className="status-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
        >
          <div className="status-item">
            <span className="status-dot active" />
            <span className="status-key">STATUS</span>
            <span className="status-val">NOMINAL</span>
          </div>
          <div className="status-divider" />
          <div className="status-item">
            <span className="status-key">ORBIT</span>
            <span className="status-val">420 KM</span>
          </div>
          <div className="status-divider" />
          <div className="status-item">
            <span className="status-key">VELOCITY</span>
            <span className="status-val">7.66 KM/S</span>
          </div>
          <div className="status-divider" />
          <div className="status-item">
            <span className="status-key">MISSION</span>
            <span className="status-val">ACTIVE</span>
          </div>
        </motion.div>

        {/* 🔘 CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          style={{ marginTop: "40px" }}
        >
          <Link href="/telemetry">
            <span className="cta">Enter Mission Control</span>
          </Link>
        </motion.div>

      </div>
    </>
  );
}