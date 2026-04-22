"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  reportStore, notifyReportListeners,
  getSavedReports, saveReport, deleteReport,
  type SavedReport,
} from "../../lib/reportStore";

// ── Real Blue Raven flight data — April 18, 2026 ─────────────
const APRIL18_ALT_CHART = [{"t":0.08,"alt":-2.1},{"t":0.18,"alt":0.7},{"t":0.28,"alt":4.5},{"t":0.38,"alt":5.6},{"t":0.48,"alt":18.9},{"t":0.58,"alt":26.1},{"t":0.68,"alt":38.2},{"t":0.78,"alt":48.2},{"t":0.88,"alt":60.9},{"t":0.98,"alt":73.6},{"t":1.08,"alt":93.5},{"t":1.18,"alt":101.8},{"t":1.28,"alt":115.6},{"t":1.38,"alt":124.5},{"t":1.48,"alt":145.0},{"t":1.58,"alt":160.5},{"t":1.68,"alt":194.3},{"t":1.78,"alt":213.7},{"t":1.88,"alt":236.5},{"t":1.98,"alt":253.7},{"t":2.08,"alt":284.8},{"t":2.18,"alt":296.0},{"t":2.28,"alt":318.8},{"t":2.38,"alt":334.4},{"t":2.48,"alt":358.3},{"t":2.58,"alt":374.5},{"t":2.68,"alt":393.5},{"t":2.78,"alt":412.5},{"t":2.88,"alt":430.3},{"t":2.98,"alt":447.7},{"t":3.08,"alt":467.2},{"t":3.18,"alt":485.7},{"t":3.28,"alt":504.2},{"t":3.38,"alt":509.7},{"t":3.48,"alt":532.7},{"t":3.58,"alt":548.4},{"t":3.68,"alt":566.9},{"t":3.78,"alt":576.4},{"t":3.88,"alt":598.3},{"t":3.98,"alt":604.5},{"t":4.08,"alt":619.1},{"t":4.18,"alt":628.7},{"t":4.28,"alt":650.0},{"t":4.38,"alt":654.5},{"t":4.48,"alt":672.5},{"t":4.58,"alt":681.0},{"t":4.68,"alt":695.6},{"t":4.78,"alt":708.0},{"t":4.88,"alt":719.8},{"t":4.98,"alt":726.0},{"t":5.08,"alt":737.8},{"t":5.18,"alt":747.4},{"t":5.28,"alt":753.1},{"t":5.38,"alt":767.7},{"t":5.48,"alt":777.3},{"t":5.58,"alt":784.1},{"t":5.68,"alt":793.1},{"t":5.78,"alt":797.1},{"t":5.88,"alt":810.1},{"t":5.98,"alt":816.8},{"t":6.08,"alt":822.5},{"t":6.18,"alt":825.3},{"t":6.28,"alt":833.8},{"t":6.38,"alt":840.6},{"t":6.48,"alt":847.9},{"t":6.58,"alt":853.6},{"t":6.68,"alt":859.2},{"t":6.78,"alt":860.4},{"t":6.88,"alt":864.9},{"t":6.98,"alt":868.9},{"t":7.08,"alt":876.2},{"t":7.18,"alt":875.1},{"t":7.28,"alt":881.9},{"t":7.38,"alt":880.2},{"t":7.48,"alt":884.7},{"t":7.58,"alt":885.8},{"t":7.68,"alt":890.4},{"t":7.78,"alt":888.7},{"t":7.88,"alt":893.2},{"t":7.98,"alt":896.0},{"t":8.08,"alt":893.2},{"t":8.18,"alt":895.5},{"t":8.28,"alt":898.9},{"t":8.38,"alt":898.9},{"t":8.48,"alt":896.0},{"t":8.58,"alt":893.2},{"t":8.68,"alt":891.5},{"t":8.78,"alt":931.7},{"t":8.88,"alt":903.4},{"t":8.98,"alt":899.4},{"t":9.08,"alt":898.3},{"t":9.18,"alt":896.6},{"t":9.28,"alt":896.0},{"t":9.38,"alt":894.3},{"t":9.48,"alt":896.0},{"t":9.58,"alt":888.7},{"t":9.68,"alt":879.1},{"t":9.78,"alt":880.8},{"t":9.88,"alt":860.9},{"t":9.98,"alt":853.6},{"t":10.08,"alt":850.8},{"t":10.18,"alt":852.5},{"t":10.28,"alt":849.6},{"t":10.38,"alt":855.9},{"t":10.48,"alt":855.9},{"t":10.58,"alt":851.3},{"t":10.68,"alt":841.7},{"t":10.78,"alt":833.2},{"t":10.88,"alt":831.0},{"t":10.98,"alt":829.3},{"t":11.08,"alt":834.9},{"t":11.18,"alt":831.0},{"t":11.28,"alt":820.8},{"t":11.38,"alt":815.2},{"t":11.48,"alt":804.4},{"t":11.58,"alt":800.5},{"t":11.68,"alt":790.3},{"t":11.78,"alt":788.0},{"t":11.88,"alt":782.4},{"t":11.98,"alt":789.7},{"t":12.08,"alt":792.0},{"t":12.18,"alt":765.5},{"t":12.28,"alt":770.0},{"t":12.38,"alt":794.3},{"t":12.48,"alt":771.7},{"t":12.58,"alt":788.0},{"t":12.68,"alt":767.7},{"t":12.78,"alt":764.9},{"t":12.88,"alt":762.7},{"t":12.98,"alt":758.1},{"t":13.08,"alt":748.6},{"t":13.18,"alt":744.0},{"t":13.28,"alt":731.1},{"t":13.38,"alt":728.8},{"t":13.48,"alt":720.4},{"t":13.58,"alt":715.3},{"t":13.68,"alt":716.4},{"t":13.78,"alt":709.7},{"t":13.88,"alt":711.9},{"t":13.98,"alt":711.9},{"t":14.08,"alt":712.5},{"t":14.18,"alt":708.5},{"t":14.28,"alt":704.6},{"t":14.38,"alt":705.2},{"t":14.48,"alt":698.4},{"t":14.58,"alt":701.2},{"t":14.68,"alt":691.6},{"t":14.78,"alt":683.2},{"t":14.88,"alt":671.4},{"t":14.98,"alt":671.4},{"t":15.08,"alt":661.3},{"t":15.18,"alt":654.0},{"t":15.28,"alt":651.7},{"t":15.38,"alt":647.2},{"t":15.48,"alt":639.9},{"t":15.58,"alt":634.3},{"t":15.68,"alt":628.7},{"t":15.78,"alt":620.2},{"t":15.88,"alt":616.3},{"t":15.98,"alt":614.1},{"t":16.08,"alt":610.1},{"t":16.18,"alt":606.8},{"t":16.28,"alt":603.9},{"t":16.38,"alt":595.5},{"t":16.48,"alt":590.5},{"t":16.58,"alt":596.1},{"t":16.68,"alt":588.2},{"t":16.78,"alt":591.6},{"t":16.88,"alt":589.9},{"t":16.98,"alt":587.7},{"t":17.08,"alt":579.8},{"t":17.18,"alt":579.3},{"t":17.28,"alt":579.3},{"t":17.38,"alt":574.2},{"t":17.48,"alt":570.3},{"t":17.58,"alt":561.9},{"t":17.68,"alt":558.5},{"t":17.78,"alt":551.2},{"t":17.88,"alt":551.8},{"t":17.98,"alt":547.8},{"t":18.08,"alt":537.8},{"t":18.18,"alt":541.1},{"t":18.28,"alt":533.8},{"t":18.38,"alt":530.5},{"t":18.48,"alt":530.5},{"t":18.58,"alt":529.9},{"t":18.68,"alt":526.0},{"t":18.78,"alt":524.9},{"t":18.88,"alt":513.1},{"t":18.98,"alt":508.6},{"t":19.08,"alt":499.1},{"t":19.18,"alt":487.9},{"t":19.28,"alt":484.0},{"t":19.38,"alt":482.9},{"t":19.48,"alt":485.7},{"t":19.58,"alt":477.8},{"t":19.68,"alt":479.0},{"t":19.78,"alt":476.2},{"t":19.88,"alt":477.8},{"t":19.98,"alt":472.3},{"t":20.08,"alt":468.3},{"t":20.18,"alt":468.3},{"t":20.28,"alt":467.2},{"t":20.38,"alt":460.0},{"t":20.48,"alt":452.1},{"t":20.58,"alt":456.0},{"t":20.68,"alt":444.9},{"t":20.78,"alt":447.7},{"t":20.88,"alt":457.7},{"t":20.98,"alt":460.5},{"t":21.08,"alt":450.4},{"t":21.18,"alt":440.9},{"t":21.28,"alt":434.2},{"t":21.38,"alt":442.6},{"t":21.48,"alt":419.2},{"t":21.58,"alt":424.7},{"t":21.68,"alt":420.8},{"t":21.78,"alt":427.5},{"t":21.88,"alt":427.5},{"t":21.98,"alt":426.4},{"t":22.08,"alt":419.7},{"t":22.18,"alt":414.1},{"t":22.28,"alt":414.1},{"t":22.38,"alt":405.2},{"t":22.48,"alt":411.3},{"t":22.58,"alt":414.1},{"t":22.68,"alt":408.6},{"t":22.78,"alt":405.8},{"t":22.88,"alt":397.4},{"t":22.98,"alt":392.9},{"t":23.08,"alt":387.3},{"t":23.18,"alt":387.3},{"t":23.28,"alt":386.2},{"t":23.38,"alt":389.0},{"t":23.48,"alt":390.1},{"t":23.58,"alt":383.4},{"t":23.68,"alt":385.1},{"t":23.78,"alt":382.3},{"t":23.88,"alt":382.3},{"t":23.98,"alt":379.5},{"t":24.08,"alt":376.7},{"t":24.18,"alt":374.0},{"t":24.28,"alt":372.8},{"t":24.38,"alt":372.8},{"t":24.48,"alt":371.7},{"t":24.58,"alt":367.8},{"t":24.68,"alt":365.0},{"t":24.78,"alt":363.9},{"t":24.88,"alt":358.3},{"t":24.98,"alt":353.9},{"t":25.08,"alt":347.2},{"t":25.18,"alt":344.4},{"t":25.28,"alt":342.7},{"t":25.38,"alt":340.5},{"t":25.48,"alt":336.6},{"t":25.58,"alt":341.1},{"t":25.68,"alt":339.4},{"t":25.78,"alt":339.4},{"t":25.88,"alt":338.3},{"t":25.98,"alt":338.3},{"t":26.08,"alt":342.2},{"t":26.18,"alt":337.7},{"t":26.28,"alt":329.4},{"t":26.38,"alt":328.8},{"t":26.48,"alt":327.1},{"t":26.58,"alt":327.1},{"t":26.68,"alt":322.7},{"t":26.78,"alt":321.6},{"t":26.88,"alt":316.0},{"t":26.98,"alt":317.1},{"t":27.08,"alt":316.0},{"t":27.18,"alt":314.9},{"t":27.28,"alt":316.0},{"t":27.38,"alt":313.2},{"t":27.48,"alt":308.8},{"t":27.58,"alt":304.9},{"t":27.68,"alt":304.9},{"t":27.78,"alt":297.6},{"t":27.88,"alt":289.3},{"t":27.98,"alt":292.1},{"t":28.08,"alt":286.5},{"t":28.18,"alt":282.6},{"t":28.28,"alt":279.3},{"t":28.38,"alt":282.1},{"t":28.48,"alt":278.2},{"t":28.58,"alt":275.4},{"t":28.68,"alt":277.1},{"t":28.78,"alt":272.6},{"t":28.88,"alt":273.7},{"t":28.98,"alt":272.6},{"t":29.08,"alt":269.8},{"t":29.18,"alt":267.0},{"t":29.28,"alt":265.9},{"t":29.38,"alt":262.0},{"t":29.48,"alt":259.3},{"t":29.58,"alt":260.9},{"t":29.68,"alt":255.4},{"t":29.78,"alt":252.6},{"t":29.88,"alt":251.5},{"t":29.98,"alt":247.0},{"t":30.08,"alt":242.6},{"t":30.18,"alt":238.7},{"t":30.28,"alt":239.8},{"t":30.38,"alt":235.4},{"t":30.48,"alt":235.9},{"t":30.58,"alt":233.2},{"t":30.68,"alt":230.4},{"t":30.78,"alt":230.4},{"t":30.88,"alt":226.5},{"t":30.98,"alt":223.2},{"t":31.08,"alt":224.8},{"t":31.18,"alt":222.6},{"t":31.28,"alt":224.3},{"t":31.38,"alt":218.2},{"t":31.48,"alt":219.8},{"t":31.58,"alt":218.7},{"t":31.68,"alt":217.6},{"t":31.78,"alt":215.4},{"t":31.88,"alt":212.6},{"t":31.98,"alt":213.7},{"t":32.08,"alt":205.4},{"t":32.18,"alt":208.7},{"t":32.28,"alt":202.6},{"t":32.38,"alt":201.5},{"t":32.48,"alt":194.9},{"t":32.58,"alt":193.2},{"t":32.68,"alt":187.6},{"t":32.78,"alt":191.0},{"t":32.88,"alt":191.0},{"t":32.98,"alt":182.1},{"t":33.08,"alt":182.6},{"t":33.18,"alt":181.0},{"t":33.28,"alt":174.3},{"t":33.38,"alt":171.6},{"t":33.48,"alt":173.2},{"t":33.58,"alt":170.4},{"t":33.68,"alt":166.6},{"t":33.78,"alt":169.9},{"t":33.88,"alt":162.7},{"t":33.98,"alt":164.4},{"t":34.08,"alt":162.7},{"t":34.18,"alt":158.8},{"t":34.28,"alt":161.6},{"t":34.38,"alt":158.8},{"t":34.48,"alt":152.2},{"t":34.58,"alt":154.9},{"t":34.68,"alt":152.2},{"t":34.78,"alt":148.8},{"t":34.88,"alt":146.6},{"t":34.98,"alt":146.6},{"t":35.08,"alt":141.1},{"t":35.18,"alt":144.4},{"t":35.28,"alt":138.3},{"t":35.38,"alt":136.1},{"t":35.48,"alt":133.9},{"t":35.58,"alt":135.5},{"t":35.68,"alt":130.0},{"t":35.78,"alt":127.2},{"t":35.88,"alt":126.1},{"t":35.98,"alt":123.4},{"t":36.08,"alt":125.0},{"t":36.18,"alt":122.3},{"t":36.28,"alt":123.9},{"t":36.38,"alt":122.3},{"t":36.48,"alt":121.1},{"t":36.58,"alt":123.9},{"t":36.68,"alt":120.0},{"t":36.78,"alt":116.7},{"t":36.88,"alt":115.6},{"t":36.98,"alt":110.1},{"t":37.08,"alt":111.7},{"t":37.18,"alt":110.1},{"t":37.28,"alt":102.9},{"t":37.38,"alt":108.4},{"t":37.48,"alt":100.7},{"t":37.58,"alt":100.1},{"t":37.68,"alt":95.7},{"t":37.78,"alt":91.8},{"t":37.88,"alt":89.1},{"t":37.98,"alt":87.4},{"t":38.08,"alt":87.4},{"t":38.18,"alt":81.3},{"t":38.28,"alt":84.1},{"t":38.38,"alt":81.3},{"t":38.48,"alt":82.4},{"t":38.58,"alt":74.1},{"t":38.68,"alt":75.8},{"t":38.78,"alt":71.4},{"t":38.88,"alt":71.4},{"t":38.98,"alt":65.8},{"t":39.08,"alt":63.1},{"t":39.18,"alt":65.8},{"t":39.28,"alt":60.3},{"t":39.38,"alt":62.0},{"t":39.48,"alt":54.2},{"t":39.58,"alt":52.0},{"t":39.68,"alt":47.6},{"t":39.78,"alt":47.6},{"t":39.88,"alt":44.8},{"t":39.98,"alt":43.7},{"t":40.08,"alt":44.8},{"t":40.18,"alt":38.2},{"t":40.28,"alt":39.3},{"t":40.38,"alt":38.2},{"t":40.48,"alt":39.3},{"t":40.58,"alt":37.1},{"t":40.68,"alt":29.9},{"t":40.78,"alt":31.0},{"t":40.88,"alt":28.3},{"t":40.98,"alt":22.7},{"t":41.08,"alt":21.6},{"t":41.18,"alt":21.6},{"t":41.28,"alt":18.9},{"t":41.38,"alt":13.9},{"t":41.48,"alt":12.3},{"t":41.58,"alt":13.9},{"t":41.68,"alt":9.5},{"t":41.78,"alt":7.3},{"t":41.88,"alt":6.7},{"t":41.98,"alt":4.0},{"t":42.08,"alt":2.9}];

const APRIL18_REPORT = {
  maxAltAGL:     931.7,
  maxVelUp:      221.0,
  maxTilt:       175.6,
  minBatt:       7.595,
  flightTime:    "46.76",
  liftoffTime:   "0.00",
  apogeeTime:    "8.68",
  apoFireTime:   "10.22",
  mainFireTime:  "12.92",
  thirdFireTime: "20.62",
  fourthFireTime:null,
  launchTemp:    "104.8",
  peakAccel:     145.56,
  altChart:      APRIL18_ALT_CHART,
};

// ── Parsers ───────────────────────────────────────────────────
function parseBlueRavenLR(text: string) {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx     = (name: string) => headers.indexOf(name);
  const iTime=idx("Flight_Time_(s)"), iAltAGL=idx("Baro_Altitude_AGL_(feet)"),
    iVelUp=idx("Velocity_Up"), iTemp=idx("Temperature_(F)"), iBatt=idx("Batt_Volts"),
    iTilt=idx("Tilt_Angle_(deg)"), iLiftoff=idx("Liftoff"), iApogee=idx("Apogee"),
    iApoFire=idx("Apo_fired"), iMainFire=idx("Main_fired"),
    i3rdFire=idx("3rd_fired"), i4thFire=idx("4th_fired");
  let maxAltAGL=-Infinity, maxVelUp=-Infinity, maxTilt=-Infinity, minBatt=Infinity, flightEnd=0;
  let liftoffTime:number|null=null, apogeeTime:number|null=null, apoFireTime:number|null=null,
    mainFireTime:number|null=null, thirdFireTime:number|null=null,
    fourthFireTime:number|null=null, launchTemp:number|null=null;
  const altChart:{t:number;alt:number}[]=[];
  let s=0;
  for (const line of lines.slice(1)) {
    const r=line.split(",");
    const t=parseFloat(r[iTime]), alt=parseFloat(r[iAltAGL]), vel=parseFloat(r[iVelUp]),
      tilt=parseFloat(r[iTilt]), batt=parseFloat(r[iBatt]), temp=parseFloat(r[iTemp]);
    if (!isNaN(alt) && alt>maxAltAGL) maxAltAGL=alt;
    if (!isNaN(vel) && vel>maxVelUp)  maxVelUp=vel;
    if (!isNaN(tilt)&& tilt>maxTilt)  maxTilt=tilt;
    if (!isNaN(batt)&& batt<minBatt)  minBatt=batt;
    if (!isNaN(t)) flightEnd=t;
    if (liftoffTime===null   && r[iLiftoff]==="1")  liftoffTime=t;
    if (apogeeTime===null    && r[iApogee]==="1")   apogeeTime=t;
    if (apoFireTime===null   && r[iApoFire]==="1")  apoFireTime=t;
    if (mainFireTime===null  && r[iMainFire]==="1") mainFireTime=t;
    if (thirdFireTime===null && i3rdFire>=0 && r[i3rdFire]==="1") thirdFireTime=t;
    if (fourthFireTime===null&& i4thFire>=0 && r[i4thFire]==="1") fourthFireTime=t;
    if (launchTemp===null && liftoffTime!==null && !isNaN(temp)) launchTemp=temp;
    if (s++%5===0 && !isNaN(t) && !isNaN(alt) && t>=0) altChart.push({t:parseFloat(t.toFixed(2)),alt:parseFloat(alt.toFixed(1))});
  }
  return {
    maxAltAGL:maxAltAGL===-Infinity?0:parseFloat(maxAltAGL.toFixed(1)),
    maxVelUp:maxVelUp===-Infinity?0:parseFloat(maxVelUp.toFixed(1)),
    maxTilt:maxTilt===-Infinity?0:parseFloat(maxTilt.toFixed(1)),
    minBatt:minBatt===Infinity?0:parseFloat(minBatt.toFixed(3)),
    flightTime:flightEnd.toFixed(2),
    liftoffTime:liftoffTime?.toFixed(2)??null, apogeeTime:apogeeTime?.toFixed(2)??null,
    apoFireTime:apoFireTime?.toFixed(2)??null, mainFireTime:mainFireTime?.toFixed(2)??null,
    thirdFireTime:thirdFireTime?.toFixed(2)??null, fourthFireTime:fourthFireTime?.toFixed(2)??null,
    launchTemp:launchTemp?.toFixed(1)??null, altChart:altChart.filter(p=>p.t>=0),
  };
}

function parseBlueRavenHR(text: string) {
  const lines=text.trim().split("\n"), headers=lines[0].split(",").map(h=>h.trim());
  const iAX=headers.indexOf("Accel_X"), iAY=headers.indexOf("Accel_Y"), iAZ=headers.indexOf("Accel_Z");
  let peak=0;
  for (const line of lines.slice(1)) {
    const r=line.split(",");
    const ax=parseFloat(r[iAX]),ay=parseFloat(r[iAY]),az=parseFloat(r[iAZ]);
    if (!isNaN(ax)&&!isNaN(ay)&&!isNaN(az)) { const m=Math.sqrt(ax**2+ay**2+az**2); if(m>peak)peak=m; }
  }
  return { peakAccel:parseFloat(peak.toFixed(2)) };
}

// ── SVG Alt Chart ─────────────────────────────────────────────
function AltChart({ data }: { data: { t: number; alt: number }[] }) {
  if (!data.length) return null;
  const W=800,H=160,PAD=20;
  const maxT=Math.max(...data.map(d=>d.t)), maxAlt=Math.max(...data.map(d=>d.alt));
  const sx=(t:number)=>PAD+(t/maxT)*(W-PAD*2);
  const sy=(a:number)=>H-PAD-(Math.max(0,a)/maxAlt)*(H-PAD*2);
  const pts=data.map(d=>`${sx(d.t)},${sy(d.alt)}`).join(" ");
  const area=`M${sx(data[0].t)},${sy(0)} `+data.map(d=>`L${sx(d.t)},${sy(d.alt)}`).join(" ")+` L${sx(data[data.length-1].t)},${sy(0)} Z`;
  const peak=data.reduce((a,b)=>a.alt>b.alt?a:b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",overflow:"visible"}}>
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#altGrad)"/>
      <polyline points={pts} fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx={sx(peak.t)} cy={sy(peak.alt)} r="5" fill="#00d9ff" stroke="#0b0f1a" strokeWidth="2">
        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// ── Animated counter ──────────────────────────────────────────
function Counter({ value, decimals=1 }: { value: number; decimals?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s=0; const steps=50;
    const id=setInterval(()=>{ s++; if(s>=steps){setN(value);clearInterval(id);}else setN(parseFloat(((value/steps)*s).toFixed(decimals))); },20);
    return ()=>clearInterval(id);
  }, [value]);
  return <>{n.toFixed(decimals)}</>;
}

// ── Upload zone ───────────────────────────────────────────────
function UploadZone({ label, hint, loaded, onFile }: { label:string;hint:string;loaded:boolean;onFile:(f:File)=>void }) {
  const ref=useRef<HTMLInputElement>(null);
  const [dragging, setDragging]=useState(false);
  return (
    <div onClick={()=>ref.current?.click()}
      onDragOver={e=>{e.preventDefault();setDragging(true);}}
      onDragLeave={()=>setDragging(false)}
      onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f)onFile(f);}}
      style={{ border:`2px dashed ${loaded?"rgba(0,255,159,0.5)":dragging?"rgba(0,217,255,0.7)":"rgba(255,255,255,0.12)"}`,
        borderRadius:"12px", padding:"24px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.2s",
        background:loaded?"rgba(0,255,159,0.04)":dragging?"rgba(0,217,255,0.06)":"rgba(255,255,255,0.02)" }}>
      <input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);}}/>
      <div style={{fontSize:"1.8rem",marginBottom:8}}>{loaded?"✅":"📂"}</div>
      <div style={{fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.05em",color:loaded?"#00ff9f":"rgba(255,255,255,0.8)"}}>{loaded?`${label} loaded`:label}</div>
      <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)",marginTop:4}}>{loaded?"Click to replace":hint}</div>
    </div>
  );
}

// ── Full report view ──────────────────────────────────────────
function ReportView({ report, lrName, dateLabel }: { report:any; lrName:string; dateLabel:string }) {
  const events = [
    { label:"Liftoff",       icon:"🚀", time:report.liftoffTime,    fired:!!report.liftoffTime },
    { label:"Apogee",        icon:"⬆️", time:report.apogeeTime,     fired:!!report.apogeeTime },
    { label:"Apogee Charge", icon:"💥", time:report.apoFireTime,    fired:!!report.apoFireTime },
    { label:"Main Charge",   icon:"🪂", time:report.mainFireTime,   fired:!!report.mainFireTime },
    { label:"3rd Event",     icon:"⚡", time:report.thirdFireTime,  fired:!!report.thirdFireTime },
    { label:"4th Event",     icon:"⚡", time:report.fourthFireTime, fired:!!report.fourthFireTime },
  ].filter(e=>e.fired||["Liftoff","Apogee","Apogee Charge","Main Charge"].includes(e.label));

  return (
    <div id="report-print">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        flexWrap:"wrap", gap:16, marginBottom:24, paddingBottom:18, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <span style={{ fontSize:"0.65rem", letterSpacing:"0.15em", padding:"3px 10px", borderRadius:"20px",
              background:"rgba(0,217,255,0.1)", border:"1px solid rgba(0,217,255,0.25)", color:"#00d9ff" }}>
              BLUE RAVEN SN1811
            </span>
            <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>{dateLabel} · {lrName}</span>
          </div>
          <h2 style={{margin:0,fontSize:"1.35rem"}}>PLEIADES Mission Report</h2>
        </div>
        <span className="status-badge badge-deployed" style={{fontSize:"0.75rem",padding:"6px 14px"}}>
          <span className="status-dot dot-green"/> FLIGHT COMPLETE
        </span>
      </div>

      {/* Primary stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:16}}>
        {[
          {label:"MAX ALTITUDE AGL",value:report.maxAltAGL,unit:"ft",color:"#00d9ff"},
          {label:"MAX VELOCITY UP", value:report.maxVelUp, unit:"ft/s",color:"#00ff9f"},
          {label:"FLIGHT TIME",     value:parseFloat(report.flightTime),unit:"sec",color:"#ffaa00"},
        ].map(({label,value,unit,color})=>(
          <div key={label} style={{ background:"rgba(11,15,26,0.9)", border:`1px solid ${color}22`,
            borderRadius:"14px", padding:"22px", textAlign:"center", boxShadow:`0 0 20px ${color}08` }}>
            <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:"rgba(255,255,255,0.35)",marginBottom:10}}>{label}</div>
            <div style={{fontSize:"2.2rem",fontWeight:800,color,lineHeight:1,textShadow:`0 0 20px ${color}80`}}>
              <Counter value={value} decimals={1}/>
            </div>
            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.3)",marginTop:4}}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          ...(report.peakAccel!=null?[{label:"PEAK ACCEL",value:report.peakAccel,unit:"g"}]:[]),
          {label:"MAX TILT",   value:report.maxTilt, unit:"°"},
          {label:"MIN BATTERY",value:report.minBatt, unit:"V"},
          ...(report.launchTemp?[{label:"LAUNCH TEMP",value:parseFloat(report.launchTemp),unit:"°F"}]:[]),
        ].map(({label,value,unit})=>(
          <div key={label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:"12px", padding:"16px", textAlign:"center" }}>
            <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",color:"rgba(255,255,255,0.3)",marginBottom:8}}>{label}</div>
            <div style={{fontSize:"1.4rem",fontWeight:700,color:"#00d9ff"}}>
              <Counter value={value} decimals={label==="MIN BATTERY"?2:1}/>
              <span style={{fontSize:"0.8rem",marginLeft:3,color:"rgba(255,255,255,0.4)"}}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Altitude chart */}
      {report.altChart?.length>0&&(
        <div style={{ background:"rgba(11,15,26,0.9)", border:"1px solid rgba(0,217,255,0.1)",
          borderRadius:"14px", padding:"24px 24px 16px", marginBottom:24 }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:"rgba(255,255,255,0.35)"}}>ALTITUDE PROFILE</div>
              <div style={{fontSize:"0.82rem",color:"rgba(255,255,255,0.6)",marginTop:2}}>Baro altitude AGL over flight time</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.3)"}}>APOGEE</div>
              <div style={{fontSize:"1.1rem",fontWeight:700,color:"#00d9ff"}}>{report.maxAltAGL.toFixed(0)} ft</div>
            </div>
          </div>
          <AltChart data={report.altChart}/>
        </div>
      )}

      {/* Events timeline */}
      <div style={{ background:"rgba(11,15,26,0.9)", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:"14px", padding:"24px", marginBottom:16 }}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:"rgba(255,255,255,0.35)",marginBottom:20}}>FLIGHT EVENTS</div>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:19,top:12,bottom:12,width:2,background:"rgba(0,217,255,0.15)"}}/>
          {events.map((ev,i)=>(
            <motion.div key={ev.label} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
              style={{display:"flex",alignItems:"center",gap:16,padding:"11px 0"}}>
              <div style={{ width:40,height:40,borderRadius:"50%",flexShrink:0,zIndex:1,
                background:ev.fired?"rgba(0,217,255,0.12)":"rgba(255,255,255,0.04)",
                border:`2px solid ${ev.fired?"rgba(0,217,255,0.5)":"rgba(255,255,255,0.1)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",
                boxShadow:ev.fired?"0 0 12px rgba(0,217,255,0.25)":"none" }}>{ev.icon}</div>
              <div style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:"0.9rem"}}>{ev.label}</div>
                  <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)",marginTop:2}}>
                    {ev.time?`T + ${ev.time} seconds`:"Event not recorded"}
                  </div>
                </div>
                <span className={`status-badge ${ev.fired?"badge-deployed":"badge-armed"}`} style={{fontSize:"0.7rem"}}>
                  <span className={`status-dot ${ev.fired?"dot-green":"dot-yellow"}`}/>
                  {ev.fired?"FIRED":"NOT FIRED"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [, forceUpdate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [saveName, setSaveName]         = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [activeView, setActiveView]     = useState<string | null>(null);
  const [justSaved, setJustSaved]       = useState(false);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    reportStore.listeners.add(listener);
    setSavedReports(getSavedReports());
    return () => { reportStore.listeners.delete(listener); };
  }, []);

  function readFile(f: File): Promise<string> {
    return new Promise((res, rej) => { const r=new FileReader(); r.onload=()=>res(r.result as string); r.onerror=()=>rej(r.error); r.readAsText(f); });
  }

  async function handleLR(f: File) { reportStore.lrText=await readFile(f); reportStore.lrName=f.name; reportStore.currentReport=null; notifyReportListeners(); }
  async function handleHR(f: File) { reportStore.hrText=await readFile(f); reportStore.hrName=f.name; notifyReportListeners(); }

  function generate() {
    if (!reportStore.lrText) { setError("Please upload the Blue Raven LR CSV file first."); return; }
    setError(null); setLoading(true); setShowSaveInput(false); setActiveView(null);
    setTimeout(() => {
      try {
        const lr=parseBlueRavenLR(reportStore.lrText!);
        const hr=reportStore.hrText?parseBlueRavenHR(reportStore.hrText):null;
        reportStore.currentReport={...lr,peakAccel:hr?.peakAccel??null};
        notifyReportListeners();
      } catch(e:any) { setError("Failed to parse: "+e.message); }
      setLoading(false);
    }, 600);
  }

  function handleSave() {
    if (!reportStore.currentReport) return;
    const name=saveName.trim()||`Flight ${new Date().toLocaleDateString()}`;
    const entry: SavedReport = { id:Date.now().toString(), name, savedAt:new Date().toLocaleString(), lrName:reportStore.lrName??"Unknown", data:reportStore.currentReport };
    saveReport(entry); setSavedReports(getSavedReports()); setSaveName(""); setShowSaveInput(false); setJustSaved(true); setTimeout(()=>setJustSaved(false),2500);
  }

  function handleDelete(id: string) { deleteReport(id); setSavedReports(getSavedReports()); if(activeView===id)setActiveView(null); }

  const { lrText, lrName, hrText, hrName, currentReport } = reportStore;

  return (
    <div style={{ padding:"40px 40px 80px", maxWidth:"960px", margin:"0 auto" }}>

      {/* ── Hero ── */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
          <div style={{ width:44,height:44,borderRadius:"12px",
            background:"linear-gradient(135deg,rgba(0,217,255,0.2),rgba(0,217,255,0.05))",
            border:"1px solid rgba(0,217,255,0.3)", display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem" }}>
            📊
          </div>
          <h1 style={{margin:0}}>Post-Flight Analysis</h1>
        </div>
        <p style={{color:"rgba(255,255,255,0.4)",marginTop:4,fontSize:"0.9rem"}}>
          Flight reports from Blue Raven SN1811 exports. Generate, save, and review past flights.
        </p>
      </motion.div>

      {/* ══════════════════════════════════════════════
          FLIGHT REPORTS — permanent + saved
      ══════════════════════════════════════════════ */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}} style={{marginTop:36}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <h2 style={{margin:0}}>Flight Reports</h2>
          <span style={{ fontSize:"0.72rem",padding:"3px 10px",borderRadius:"20px",
            background:"rgba(0,217,255,0.1)",border:"1px solid rgba(0,217,255,0.2)",color:"#00d9ff" }}>
            {1+savedReports.length}
          </span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8}}>

          {/* ── Permanent April 18 report ── */}
          <div style={{ background:activeView==="april18"?"rgba(0,217,255,0.05)":"rgba(255,255,255,0.02)",
            border:`1px solid ${activeView==="april18"?"rgba(0,217,255,0.25)":"rgba(255,255,255,0.07)"}`,
            borderRadius:"12px", overflow:"hidden", transition:"all 0.2s" }}>
            <div style={{display:"flex",alignItems:"center",padding:"14px 18px",gap:14}}>
              <div style={{ width:38,height:38,borderRadius:"10px",flexShrink:0,
                background:"rgba(0,217,255,0.1)",border:"1px solid rgba(0,217,255,0.2)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>📊</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:"0.9rem",marginBottom:2}}>Flight Test — April 18, 2026</div>
                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.35)"}}>
                  Blue Raven SN1811 · BlRv_SN1811_LR_04-18-2026_12_19_33.csv
                </div>
              </div>
              <div style={{display:"flex",gap:16,marginRight:8}}>
                {[{label:"ALT",value:`${APRIL18_REPORT.maxAltAGL} ft`},{label:"VEL",value:`${APRIL18_REPORT.maxVelUp} ft/s`},{label:"TIME",value:`${APRIL18_REPORT.flightTime}s`}]
                  .map(({label,value})=>(
                  <div key={label} style={{textAlign:"center"}}>
                    <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em"}}>{label}</div>
                    <div style={{fontSize:"0.82rem",fontWeight:700,color:"#00d9ff"}}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <span className="status-badge badge-deployed" style={{fontSize:"0.68rem"}}>
                  <span className="status-dot dot-green"/> COMPLETE
                </span>
                <button onClick={()=>setActiveView(activeView==="april18"?null:"april18")}
                  style={{ padding:"7px 16px",borderRadius:"7px",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",
                    background:activeView==="april18"?"rgba(0,217,255,0.15)":"rgba(0,217,255,0.08)",
                    color:"#00d9ff",border:"1px solid rgba(0,217,255,0.25)",transition:"all 0.15s" }}>
                  {activeView==="april18"?"Collapse":"View"}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {activeView==="april18"&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                  exit={{height:0,opacity:0}} transition={{duration:0.3}}
                  style={{overflow:"hidden",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{padding:"28px"}}>
                    <ReportView report={APRIL18_REPORT} lrName="BlRv_SN1811_LR_04-18-2026_12_19_33.csv" dateLabel="April 18, 2026"/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── User-saved reports ── */}
          {savedReports.map((r, i) => (
            <motion.div key={r.id} initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
              style={{ background:activeView===r.id?"rgba(0,217,255,0.05)":"rgba(255,255,255,0.02)",
                border:`1px solid ${activeView===r.id?"rgba(0,217,255,0.25)":"rgba(255,255,255,0.07)"}`,
                borderRadius:"12px", overflow:"hidden", transition:"all 0.2s" }}>
              <div style={{display:"flex",alignItems:"center",padding:"14px 18px",gap:14}}>
                <div style={{ width:38,height:38,borderRadius:"10px",flexShrink:0,
                  background:"rgba(0,217,255,0.1)",border:"1px solid rgba(0,217,255,0.2)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>📊</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:"0.9rem",marginBottom:2}}>{r.name}</div>
                  <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.35)"}}>{r.savedAt} · {r.lrName}</div>
                </div>
                <div style={{display:"flex",gap:16,marginRight:8}}>
                  {[{label:"ALT",value:`${r.data.maxAltAGL?.toFixed(0)} ft`},{label:"VEL",value:`${r.data.maxVelUp?.toFixed(0)} ft/s`},{label:"TIME",value:`${r.data.flightTime}s`}]
                    .map(({label,value})=>(
                    <div key={label} style={{textAlign:"center"}}>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em"}}>{label}</div>
                      <div style={{fontSize:"0.82rem",fontWeight:700,color:"#00d9ff"}}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <span className="status-badge badge-deployed" style={{fontSize:"0.68rem"}}>
                    <span className="status-dot dot-green"/> COMPLETE
                  </span>
                  <button onClick={()=>setActiveView(activeView===r.id?null:r.id)}
                    style={{ padding:"7px 16px",borderRadius:"7px",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",
                      background:activeView===r.id?"rgba(0,217,255,0.15)":"rgba(0,217,255,0.08)",
                      color:"#00d9ff",border:"1px solid rgba(0,217,255,0.25)" }}>
                    {activeView===r.id?"Collapse":"View"}
                  </button>
                  <button onClick={()=>handleDelete(r.id)}
                    style={{ padding:"7px 12px",borderRadius:"7px",fontSize:"0.78rem",cursor:"pointer",
                      background:"rgba(255,77,77,0.08)",color:"#ff4d4d",border:"1px solid rgba(255,77,77,0.2)" }}>
                    🗑
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {activeView===r.id&&(
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                    exit={{height:0,opacity:0}} transition={{duration:0.3}}
                    style={{overflow:"hidden",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{padding:"28px"}}>
                      <ReportView report={r.data} lrName={r.lrName} dateLabel={r.savedAt}/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          GENERATE NEW REPORT
      ══════════════════════════════════════════════ */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
        style={{ marginTop:48, background:"rgba(11,15,26,0.8)", border:"1px solid rgba(0,217,255,0.12)",
          borderRadius:"16px", padding:"28px", boxShadow:"0 0 40px rgba(0,217,255,0.04)" }}>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#00d9ff",boxShadow:"0 0 8px #00d9ff",display:"inline-block"}}/>
          <span style={{fontSize:"0.7rem",letterSpacing:"0.15em",color:"rgba(255,255,255,0.5)"}}>GENERATE NEW REPORT</span>
        </div>
        <h3 style={{margin:"0 0 20px",fontSize:"1rem"}}>Upload Blue Raven Export Files</h3>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div>
            <div style={{fontSize:"0.7rem",letterSpacing:"0.1em",color:"rgba(255,255,255,0.4)",marginBottom:8}}>LR FILE — REQUIRED</div>
            <UploadZone label="Low Rate CSV" hint="Drag & drop or click to browse" loaded={!!lrText} onFile={handleLR}/>
            {lrName&&<div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.28)",marginTop:5,textAlign:"center"}}>{lrName}</div>}
          </div>
          <div>
            <div style={{fontSize:"0.7rem",letterSpacing:"0.1em",color:"rgba(255,255,255,0.4)",marginBottom:8}}>HR FILE — OPTIONAL (peak accel)</div>
            <UploadZone label="High Rate CSV" hint="Drag & drop or click to browse" loaded={!!hrText} onFile={handleHR}/>
            {hrName&&<div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.28)",marginTop:5,textAlign:"center"}}>{hrName}</div>}
          </div>
        </div>

        {error&&<div style={{marginBottom:16,padding:"10px 16px",borderRadius:"8px",background:"rgba(255,77,77,0.08)",border:"1px solid rgba(255,77,77,0.25)",color:"#ff4d4d",fontSize:"0.82rem"}}>⚠️ {error}</div>}

        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <motion.button onClick={generate} disabled={!lrText||loading}
            whileHover={{scale:lrText?1.02:1}} whileTap={{scale:lrText?0.98:1}}
            style={{ padding:"12px 32px", background:lrText?"#00d9ff":"rgba(255,255,255,0.08)",
              color:lrText?"#000":"rgba(255,255,255,0.3)", fontWeight:800,fontSize:"0.85rem",letterSpacing:"0.08em",
              border:"none",borderRadius:"10px",cursor:lrText?"pointer":"not-allowed",
              boxShadow:lrText?"0 0 24px rgba(0,217,255,0.4)":"none",transition:"all 0.2s" }}>
            {loading?"⚙️  PROCESSING...":"⚡  GENERATE REPORT"}
          </motion.button>

          {currentReport&&(
            <>
              <motion.button onClick={()=>setShowSaveInput(p=>!p)}
                initial={{opacity:0,x:8}} animate={{opacity:1,x:0}}
                whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                style={{ padding:"12px 20px",background:"rgba(0,255,159,0.08)",color:"#00ff9f",fontWeight:700,
                  fontSize:"0.82rem",border:"1px solid rgba(0,255,159,0.3)",borderRadius:"10px",cursor:"pointer" }}>
                💾 Save Report
              </motion.button>
              <motion.button onClick={()=>window.print()}
                initial={{opacity:0,x:8}} animate={{opacity:1,x:0}}
                whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                style={{ padding:"12px 20px",background:"transparent",color:"rgba(255,255,255,0.5)",fontWeight:600,
                  fontSize:"0.82rem",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"10px",cursor:"pointer" }}>
                🖨️ Print
              </motion.button>
            </>
          )}
        </div>

        <AnimatePresence>
          {showSaveInput&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} style={{overflow:"hidden",marginTop:16}}>
              <div style={{display:"flex",gap:10,alignItems:"center",padding:"16px",borderRadius:"10px",background:"rgba(0,255,159,0.04)",border:"1px solid rgba(0,255,159,0.15)"}}>
                <input type="text" placeholder={`Flight ${new Date().toLocaleDateString()}`} value={saveName}
                  onChange={e=>setSaveName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleSave();}}
                  style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",padding:"10px 14px",color:"#fff",fontSize:"0.85rem",outline:"none"}}/>
                <button onClick={handleSave} style={{padding:"10px 20px",background:"#00ff9f",color:"#000",fontWeight:800,fontSize:"0.82rem",border:"none",borderRadius:"8px",cursor:"pointer",whiteSpace:"nowrap"}}>Save</button>
                <button onClick={()=>setShowSaveInput(false)} style={{padding:"10px 14px",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:"0.82rem",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",cursor:"pointer"}}>Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {justSaved&&<motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{marginTop:12,fontSize:"0.8rem",color:"#00ff9f"}}>✓ Report saved successfully</motion.div>}
      </motion.div>

      {/* Generated report preview */}
      <AnimatePresence>
        {currentReport&&(
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.4}}
            style={{ marginTop:32, background:"rgba(11,15,26,0.9)", border:"1px solid rgba(0,217,255,0.15)",
              borderRadius:"16px", padding:"28px", boxShadow:"0 0 40px rgba(0,217,255,0.06)" }}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <span style={{fontSize:"0.65rem",letterSpacing:"0.15em",padding:"3px 10px",borderRadius:"20px",background:"rgba(255,170,0,0.1)",border:"1px solid rgba(255,170,0,0.25)",color:"#ffaa00"}}>UNSAVED</span>
              <span style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)"}}>Save this report to keep it permanently</span>
            </div>
            <ReportView report={currentReport} lrName={lrName??""} dateLabel={new Date().toLocaleString()}/>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}