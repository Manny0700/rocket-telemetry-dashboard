"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import RocketScene from "@/components/RocketScene";

export default function HomePage() {
  return (
    <>
      {/* 🌠 FULL SCREEN SHOOTING STARS */}
      <div className="shooting-stars-global">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="container cinematic">

        {/* 💥 LAUNCH FLASH */}
        <motion.div
          className="flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* 🚀 3D ROCKET LAUNCH */}
        <motion.div
          className="rocket-wrapper"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: [-20, -200], opacity: [1, 1, 0] }}
          transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
        >
          <RocketScene />
          <div className="trail" />
        </motion.div>

        {/* 🌟 TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          PLEIADES Mission Control
        </motion.h1>

        {/* ✨ SUBTEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          Real-Time Rocket Telemetry & Tracking
        </motion.p>

        {/* 🔘 BUTTON */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          style={{ marginTop: "40px" }}
        >
          <Link href="/telemetry">
            <span className="cta">
              Enter Mission Control
            </span>
          </Link>
        </motion.div>

      </div>
    </>
  );
}