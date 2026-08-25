import React from 'react';

export default function BusSVG() {
  return (
    <svg
      viewBox="0 0 900 380"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e8901f" />
          <stop offset="40%"  stopColor="#c8741a" />
          <stop offset="100%" stopColor="#7a3e00" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00bcd4" />
          <stop offset="100%" stopColor="#006064" />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7ecfdd" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3a8fa0" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="wheelGrad" cx="40%" cy="35%" r="60%" id="wheelG" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#555" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffe066" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe066" stopOpacity="0" />
        </radialGradient>
        <filter id="busShadow">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter="url(#busShadow)">

        {/* ── ROOF ── */}
        <rect x="80" y="28" width="720" height="52" rx="12" fill="url(#roofGrad)" />

        {/* Roof decorative stripe */}
        <rect x="80" y="72" width="720" height="8" fill="#ff9800" />

        {/* Roof ornament — center crest */}
        <polygon points="420,10 445,28 395,28" fill="#ffd700" />
        <circle cx="420" cy="10" r="6" fill="#e91e8c" />

        {/* Roof side ornaments */}
        {[140,220,300,380,460,540,620,700].map((x,i) => (
          <rect key={i} x={x} y="26" width="6" height="6" rx="1"
            fill={i%2===0 ? '#ffd700' : '#e91e8c'} />
        ))}

        {/* ── MAIN BODY ── */}
        <rect x="70" y="80" width="740" height="220" rx="8" fill="url(#bodyGrad)" />

        {/* ── DECORATIVE PANELS ── */}

        {/* Bottom decorative band — geometric pattern */}
        <rect x="70" y="270" width="740" height="30" fill="#7a3e00" />
        {/* Zigzag pattern on bottom band */}
        {Array.from({length:37}).map((_,i) => (
          <polygon key={i}
            points={`${70+i*20},270 ${80+i*20},300 ${70+i*20},300`}
            fill={i%3===0 ? '#ffd700' : i%3===1 ? '#e91e8c' : '#00bcd4'}
            opacity="0.7"
          />
        ))}

        {/* Upper body stripe — teal */}
        <rect x="70" y="80" width="740" height="22" fill="#00838f" />

        {/* Mid decorative stripe */}
        <rect x="70" y="196" width="740" height="10" fill="#7a3e00" opacity="0.7" />
        {/* Stripe dots */}
        {Array.from({length:74}).map((_,i) => (
          <circle key={i} cx={80+i*10} cy={201} r="3"
            fill={i%4===0?'#ffd700':i%4===1?'#e91e8c':i%4===2?'#fff':'#00bcd4'}
            opacity="0.8"
          />
        ))}

        {/* Left flower mandala decoration */}
        {[130,260,390].map((cx,fi) => (
          <g key={fi}>
            <circle cx={cx} cy={148} r={28} fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.5" />
            <circle cx={cx} cy={148} r={18} fill="none" stroke="#e91e8c" strokeWidth="1.5" opacity="0.6" />
            {[0,60,120,180,240,300].map((a,i) => (
              <ellipse key={i}
                cx={cx + Math.cos(a*Math.PI/180)*18}
                cy={148 + Math.sin(a*Math.PI/180)*18}
                rx="7" ry="4"
                fill={i%2===0?'#ffd700':'#e91e8c'}
                transform={`rotate(${a},${cx + Math.cos(a*Math.PI/180)*18},${148 + Math.sin(a*Math.PI/180)*18})`}
                opacity="0.7"
              />
            ))}
            <circle cx={cx} cy={148} r="5" fill="#ff9800" />
          </g>
        ))}

        {/* Right side decoration mirror */}
        {[510,640,770].map((cx,fi) => (
          <g key={fi}>
            <circle cx={cx} cy={148} r={20} fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.4" />
            {[0,90,180,270].map((a,i) => (
              <ellipse key={i}
                cx={cx + Math.cos(a*Math.PI/180)*14}
                cy={148 + Math.sin(a*Math.PI/180)*14}
                rx="6" ry="3"
                fill={i%2===0?'#00bcd4':'#e91e8c'}
                transform={`rotate(${a},${cx + Math.cos(a*Math.PI/180)*14},${148 + Math.sin(a*Math.PI/180)*14})`}
                opacity="0.65"
              />
            ))}
            <circle cx={cx} cy={148} r="4" fill="#ffd700" />
          </g>
        ))}

        {/* ── WINDOWS ── */}
        {/* Front windshield */}
        <rect x="710" y="95" width="88" height="90" rx="5" fill="url(#windowGrad)" />
        <line x1="753" y1="95" x2="753" y2="185" stroke="#5ab8c8" strokeWidth="1.5" opacity="0.5" />
        {/* Windshield wipers */}
        <line x1="718" y1="182" x2="750" y2="140" stroke="#555" strokeWidth="2" strokeLinecap="round" />
        <line x1="756" y1="182" x2="793" y2="140" stroke="#555" strokeWidth="2" strokeLinecap="round" />

        {/* Side windows — row */}
        {[96,186,276,366,456,546,636].map((x,i) => (
          <g key={i}>
            <rect x={x} y="100" width="80" height="55" rx="4" fill="url(#windowGrad)" />
            {/* Window frame */}
            <rect x={x} y="100" width="80" height="55" rx="4"
              fill="none" stroke="#004d5c" strokeWidth="2" />
            {/* Window divider */}
            <line x1={x+40} y1="100" x2={x+40} y2="155"
              stroke="#5ab8c8" strokeWidth="1" opacity="0.4" />
            {/* Passenger silhouette */}
            {i % 2 === 0 && (
              <g opacity="0.5">
                <circle cx={x+28} cy={120} r="8" fill="#1a0e00" />
                <rect x={x+20} cy={128} width="16" height="14" rx="3" fill="#1a0e00" y={128} />
              </g>
            )}
          </g>
        ))}

        {/* Driver window (front upper) */}
        <rect x="730" y="96" width="40" height="34" rx="3" fill="url(#windowGrad)" opacity="0.9" />
        {/* Driver silhouette */}
        <circle cx="750" cy="108" r="7" fill="#1a0e00" opacity="0.6" />
        <rect x="743" y="114" width="14" height="10" rx="2" fill="#1a0e00" opacity="0.5" />

        {/* ── FRONT FACE ── */}
        <rect x="770" y="80" width="40" height="220" rx="0" fill="#a05010" />
        {/* Grill stripes */}
        {[220,234,248,262,276].map((y,i) => (
          <rect key={i} x="772" y={y} width="36" height="4" rx="1"
            fill={i%2===0?'#ffd700':'#c8741a'} opacity="0.7" />
        ))}

        {/* Front bumper */}
        <rect x="762" y="284" width="56" height="14" rx="3" fill="#666" />
        <rect x="766" y="287" width="48" height="8" rx="2" fill="#888" />

        {/* Headlights */}
        <rect x="780" y="220" width="26" height="18" rx="4" fill="#ffe066" opacity="0.95" />
        <rect x="780" y="220" width="26" height="18" rx="4" fill="none" stroke="#ffaa00" strokeWidth="1.5" />
        {/* Headlight glow */}
        <ellipse cx="893" cy="229" rx="60" ry="40" fill="url(#headlightGlow)" opacity="0.5" />

        {/* Indicator light */}
        <rect x="780" y="244" width="14" height="8" rx="2" fill="#ff6600" opacity="0.9" />

        {/* Front number plate area */}
        <rect x="775" y="260" width="34" height="14" rx="2" fill="#fffbe0" />
        <text x="792" y="271" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#333" fontFamily="monospace">
          DL 48 BUS
        </text>

        {/* ── REAR (left end) ── */}
        <rect x="70" y="80" width="26" height="220" rx="0" fill="#a05010" />
        {/* Tail lights */}
        <rect x="74" y="220" width="18" height="14" rx="3" fill="#ff2200" opacity="0.9" />
        <rect x="74" y="238" width="14" height="8" rx="2" fill="#ff6600" opacity="0.8" />

        {/* ── DOOR ── (left side toward rear) */}
        <rect x="86" y="190" width="54" height="90" rx="3" fill="#9a5010" />
        <rect x="92" y="196" width="20" height="78" rx="2" fill="#8a4808" />
        <rect x="116" y="196" width="20" height="78" rx="2" fill="#8a4808" />
        <circle cx="136" cy="238" r="3" fill="#ffd700" />
        {/* Door steps */}
        <rect x="86"  y="278" width="54" height="6" rx="1" fill="#666" />
        <rect x="86"  y="286" width="54" height="4" rx="1" fill="#555" />

        {/* ── WHEELS ── */}
        {/* Rear wheels */}
        <circle cx="190" cy="312" r="52" fill="#1a1a1a" />
        <circle cx="190" cy="312" r="40" fill="#2a2a2a" />
        <circle cx="190" cy="312" r="28" fill="#111" />
        {/* Rim spokes */}
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <line key={i}
            x1={190 + Math.cos(a*Math.PI/180)*12}
            y1={312 + Math.sin(a*Math.PI/180)*12}
            x2={190 + Math.cos(a*Math.PI/180)*38}
            y2={312 + Math.sin(a*Math.PI/180)*38}
            stroke="#c8741a" strokeWidth="2.5" strokeLinecap="round"
          />
        ))}
        <circle cx="190" cy="312" r="8"  fill="#c8741a" />
        <circle cx="190" cy="312" r="4"  fill="#ffd700" />
        {/* Tyre tread marks */}
        <circle cx="190" cy="312" r="50" fill="none" stroke="#333" strokeWidth="4" />
        {Array.from({length:18}).map((_,i) => (
          <line key={i}
            x1={190 + Math.cos(i*20*Math.PI/180)*44}
            y1={312 + Math.sin(i*20*Math.PI/180)*44}
            x2={190 + Math.cos(i*20*Math.PI/180)*50}
            y2={312 + Math.sin(i*20*Math.PI/180)*50}
            stroke="#444" strokeWidth="3"
          />
        ))}

        {/* Front wheel */}
        <circle cx="690" cy="312" r="52" fill="#1a1a1a" />
        <circle cx="690" cy="312" r="40" fill="#2a2a2a" />
        <circle cx="690" cy="312" r="28" fill="#111" />
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <line key={i}
            x1={690 + Math.cos(a*Math.PI/180)*12}
            y1={312 + Math.sin(a*Math.PI/180)*12}
            x2={690 + Math.cos(a*Math.PI/180)*38}
            y2={312 + Math.sin(a*Math.PI/180)*38}
            stroke="#c8741a" strokeWidth="2.5" strokeLinecap="round"
          />
        ))}
        <circle cx="690" cy="312" r="8"  fill="#c8741a" />
        <circle cx="690" cy="312" r="4"  fill="#ffd700" />
        <circle cx="690" cy="312" r="50" fill="none" stroke="#333" strokeWidth="4" />
        {Array.from({length:18}).map((_,i) => (
          <line key={i}
            x1={690 + Math.cos(i*20*Math.PI/180)*44}
            y1={312 + Math.sin(i*20*Math.PI/180)*44}
            x2={690 + Math.cos(i*20*Math.PI/180)*50}
            y2={312 + Math.sin(i*20*Math.PI/180)*50}
            stroke="#444" strokeWidth="3"
          />
        ))}

        {/* Axle bar */}
        <rect x="140" y="308" width="100" height="8" rx="4" fill="#333" />
        <rect x="640" y="308" width="100" height="8" rx="4" fill="#333" />

        {/* Undercarriage */}
        <rect x="140" y="295" width="600" height="14" rx="3" fill="#4a2800" />
        <rect x="240" y="298" width="400" height="8"  rx="2" fill="#3a1e00" />

        {/* ── ROOF RACK / luggage ── */}
        <rect x="110" y="18" width="660" height="12" rx="3" fill="#005f6b" />
        {/* Luggage bags */}
        <rect x="140" y="10" width="50" height="14" rx="3" fill="#7a3e00" />
        <rect x="200" y="8"  width="60" height="16" rx="3" fill="#4a1a6a" />
        <rect x="270" y="10" width="44" height="14" rx="3" fill="#7a3e00" />
        <rect x="400" y="7"  width="55" height="17" rx="3" fill="#1a4a1a" />
        <rect x="464" y="10" width="48" height="14" rx="3" fill="#6a1a00" />
        <rect x="560" y="9"  width="52" height="15" rx="3" fill="#4a1a6a" />
        <rect x="620" y="11" width="42" height="13" rx="3" fill="#7a3e00" />

        {/* ── MIRROR (right side) ── */}
        <rect x="802" y="130" width="20" height="28" rx="3" fill="#555" />
        <rect x="810" y="126" width="16" height="20" rx="2" fill="#7ecfdd" opacity="0.8" />

        {/* ── DECORATIVE SIDE TEXT AREA ── */}
        {/* Center banner strip */}
        <rect x="160" y="210" width="570" height="34" rx="4" fill="rgba(0,0,0,0.35)" />
      </g>
    </svg>
  );
}
