"use client"

import { useEffect, useState } from "react"

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js"

import { Line } from "react-chartjs-2"

import dynamic from "next/dynamic"

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement)

export default function Home() {

  const [altitude, setAltitude] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [status, setStatus] = useState("Idle")

  const [altitudeHistory, setAltitudeHistory] = useState<number[]>([])
  const [velocityHistory, setVelocityHistory] = useState<number[]>([])
  const [timeHistory, setTimeHistory] = useState<number[]>([])

  const [position, setPosition] = useState<[number, number]>([28.6024, -81.2001])
  const [path, setPath] = useState<[number, number][]>([])

  const phases = [
    "Idle",
    "Launch",
    "Boost",
    "Coast",
    "Apogee",
    "Drogue Deploy",
    "Main Deploy",
    "Landing"
  ]

  useEffect(() => {

    let t = 0

    const interval = setInterval(() => {

      t++

      let newAltitude = altitude
      let newVelocity = velocity
      let newStatus = status

      if (t < 3) {
        newStatus = "Launch"
        newAltitude = altitude + 150
        newVelocity = 120
      }

      else if (t < 6) {
        newStatus = "Boost"
        newAltitude = altitude + 350
        newVelocity = 250
      }

      else if (t < 9) {
        newStatus = "Coast"
        newAltitude = altitude + 120
        newVelocity = 90
      }

      else if (t < 11) {
        newStatus = "Apogee"
        newVelocity = 0
      }

      else if (t < 15) {
        newStatus = "Drogue Deploy"
        newAltitude = altitude - 200
        newVelocity = -80
      }

      else if (t < 18) {
        newStatus = "Main Deploy"
        newAltitude = altitude - 120
        newVelocity = -40
      }

      else {
        newStatus = "Landing"
        newVelocity = 0
        clearInterval(interval)
      }

      setAltitude(newAltitude)
      setVelocity(newVelocity)
      setStatus(newStatus)

      setAltitudeHistory(prev => [...prev, newAltitude])
      setVelocityHistory(prev => [...prev, newVelocity])
      setTimeHistory(prev => [...prev, t])

      const newLat = position[0] + 0.0001
      const newLon = position[1] + 0.0001

      const newPos: [number, number] = [newLat, newLon]

      setPosition(newPos)
      setPath(prev => [...prev, newPos])

    }, 1000)

    return () => clearInterval(interval)

  }, [altitude, velocity, status, position])

  const chartData = {
    labels: timeHistory,
    datasets: [
      {
        label: "Altitude (m)",
        data: altitudeHistory,
        borderColor: "#00ff9c",
        tension: 0.3
      },
      {
        label: "Velocity (m/s)",
        data: velocityHistory,
        borderColor: "#00d9ff",
        tension: 0.3
      }
    ]
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#050b1a",
      color: "white",
      padding: "40px",
      fontFamily: "Arial"
    }}>

      <h1 style={{fontSize:"42px"}}>🚀 Rocket Telemetry Dashboard</h1>
      <p style={{color:"#aaa"}}>Team PLEIADES – UCF Senior Design Rocket Project</p>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,1fr)",
        gap:"20px",
        marginTop:"40px"
      }}>

        <Card title="Altitude" value={`${altitude} m`} />
        <Card title="Velocity" value={`${velocity} m/s`} />
        <Card title="Status" value={status} />

      </div>

      <div style={{marginTop:"50px"}}>
        <Line data={chartData}/>
      </div>

      <div style={{marginTop:"60px"}}>

        <h2>Rocket Tracking</h2>

        <MapContainer
          center={position}
          zoom={13}
          style={{
            height:"400px",
            width:"100%",
            borderRadius:"10px"
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position} />

          <Polyline positions={path} color="red" />

        </MapContainer>

      </div>

      <div style={{marginTop:"60px"}}>

        <h2>Mission Phases</h2>

        <div style={{
          display:"flex",
          gap:"10px",
          flexWrap:"wrap",
          marginTop:"20px"
        }}>

        {phases.map((phase) => (

        <div
        key={phase}
        style={{
        padding:"10px 16px",
        borderRadius:"20px",
        border:"1px solid #334155",
        background: phase === status ? "#00ff9c" : "#0f172a",
        color: phase === status ? "black" : "white",
        fontWeight:"bold"
        }}
        >

        {phase}

        </div>

        ))}

        </div>

      </div>

    </main>
  )
}

function Card({title,value}:{title:string,value:string}){

  return(
    <div style={{
      background:"#0f172a",
      padding:"20px",
      borderRadius:"10px",
      border:"1px solid #1e293b"
    }}>
      <h3>{title}</h3>
      <p style={{fontSize:"30px"}}>{value}</p>
    </div>
  )
}