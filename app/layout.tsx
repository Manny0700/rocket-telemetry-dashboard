import "./globals.css";
import Link from "next/link";
import StarBackground from "@/components/StarBackground";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* 🌌 GLOBAL STARS */}
        <StarBackground />

        {/* 🧭 NAVBAR */}
        <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
          <Link href="/">Home</Link>
          <Link href="/telemetry">Telemetry</Link>
          <Link href="/videos">Demonstrations</Link>
          <Link href="/reports">Reports</Link>
        </nav>

        {/* MAIN CONTENT */}
        <div className="main-content">{children}</div>
      </body>
    </html>
  );
}