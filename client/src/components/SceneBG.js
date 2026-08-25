import React from 'react';

export default function SceneBG() {
  return (
    <svg
      className="scene-bg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Sky gradient — dark amber stormy */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0d0700" />
          <stop offset="35%"  stopColor="#2a1400" />
          <stop offset="65%"  stopColor="#3d1f00" />
          <stop offset="100%" stopColor="#1a0e00" />
        </linearGradient>

        {/* Ground gradient */}
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0e00" />
          <stop offset="100%" stopColor="#0d0700" />
        </linearGradient>

        {/* Road gradient */}
        <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1c1208" />
          <stop offset="100%" stopColor="#0a0700" />
        </linearGradient>

        {/* Mountain left */}
        <linearGradient id="mtnLeft" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%"   stopColor="#1a0e00" />
          <stop offset="100%" stopColor="#0d0700" />
        </linearGradient>

        {/* Amber glow behind bus */}
        <radialGradient id="busGlow" cx="50%" cy="70%" r="35%">
          <stop offset="0%"   stopColor="#c8741a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#c8741a" stopOpacity="0" />
        </radialGradient>

        {/* Headlight glow */}
        <radialGradient id="headlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffe066" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffe066" stopOpacity="0" />
        </radialGradient>

        {/* Cloud texture */}
        <filter id="cloudBlur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="1440" height="900" fill="url(#skyGrad)" />

      {/* Moody cloud shapes */}
      <g filter="url(#cloudBlur)" opacity="0.35">
        <ellipse cx="200"  cy="120" rx="280" ry="80"  fill="#3d2200" />
        <ellipse cx="700"  cy="80"  rx="350" ry="70"  fill="#2a1600" />
        <ellipse cx="1200" cy="110" rx="300" ry="90"  fill="#3d2200" />
        <ellipse cx="500"  cy="160" rx="200" ry="50"  fill="#4a2800" />
        <ellipse cx="950"  cy="140" rx="260" ry="60"  fill="#3d2200" />
      </g>

      {/* Darker cloud layer */}
      <g filter="url(#cloudBlur)" opacity="0.5">
        <ellipse cx="100"  cy="200" rx="220" ry="60"  fill="#1a0d00" />
        <ellipse cx="600"  cy="180" rx="400" ry="80"  fill="#1a0d00" />
        <ellipse cx="1300" cy="200" rx="200" ry="55"  fill="#1a0d00" />
      </g>

      {/* Distant mountain range (far, low poly style) */}
      <g opacity="0.75">
        {/* Far mountains */}
        <polygon points="0,480 120,320 240,400 360,280 480,370 600,260 720,350 840,240 960,360 1080,270 1200,360 1320,290 1440,380 1440,500 0,500"
          fill="#2a1600" />
        {/* Mid mountains */}
        <polygon points="0,520 80,400 180,460 300,360 420,440 540,350 660,430 780,330 900,420 1020,340 1140,410 1260,350 1380,420 1440,460 1440,540 0,540"
          fill="#1f1000" />
        {/* Near hills */}
        <polygon points="0,560 100,480 250,520 400,470 550,510 700,460 850,500 1000,455 1150,495 1300,460 1440,490 1440,580 0,580"
          fill="#180d00" />
      </g>

      {/* Desert ground / scrub layer */}
      <rect x="0" y="560" width="1440" height="340" fill="url(#groundGrad)" />

      {/* Ground texture — scattered rocks */}
      <g opacity="0.4">
        {[60,160,320,500,680,820,1000,1180,1350].map((x, i) => (
          <ellipse key={i} cx={x} cy={590 + (i % 3) * 12} rx={12 + (i%4)*5} ry={5 + (i%3)*2} fill="#3d2200" />
        ))}
        {[100,280,440,620,760,940,1120,1300].map((x, i) => (
          <ellipse key={i} cx={x} cy={640 + (i % 4) * 8} rx={8 + (i%3)*4} ry={3 + (i%2)*2} fill="#2a1800" />
        ))}
      </g>

      {/* Desert shrubs / sparse trees far left and right */}
      {/* Left trees */}
      <g opacity="0.6">
        <rect x="40"  y="520" width="6"  height="45" fill="#1a0d00" />
        <ellipse cx="43"  cy="515" rx="18" ry="22" fill="#1f1000" />
        <rect x="110" y="530" width="5"  height="35" fill="#1a0d00" />
        <ellipse cx="112" cy="525" rx="14" ry="18" fill="#1f1000" />
        <rect x="190" y="525" width="6"  height="40" fill="#1a0d00" />
        <ellipse cx="193" cy="520" rx="16" ry="20" fill="#1f1000" />
      </g>
      {/* Right trees */}
      <g opacity="0.6">
        <rect x="1360" y="510" width="6"  height="55" fill="#1a0d00" />
        <ellipse cx="1363" cy="505" rx="20" ry="24" fill="#1f1000" />
        <rect x="1290" y="525" width="5"  height="40" fill="#1a0d00" />
        <ellipse cx="1292" cy="520" rx="15" ry="19" fill="#1f1000" />
        <rect x="1220" y="530" width="5"  height="35" fill="#1a0d00" />
        <ellipse cx="1222" cy="525" rx="13" ry="17" fill="#1f1000" />
      </g>

      {/* Road surface */}
      <polygon points="320,580 1120,580 1440,900 0,900" fill="url(#roadGrad)" />

      {/* Road center dashes (perspective) */}
      {[0,1,2,3,4,5,6,7].map(i => {
        const y1 = 595 + i * 36;
        const y2 = y1 + 20;
        const cx = 720;
        const spread = 0.18;
        const x1l = cx - (y1 - 580) * spread;
        const x1r = cx + (y1 - 580) * spread;
        const x2l = cx - (y2 - 580) * spread;
        const x2r = cx + (y2 - 580) * spread;
        return (
          <polygon key={i}
            points={`${x1l},${y1} ${x1r},${y1} ${x2r},${y2} ${x2l},${y2}`}
            fill="#c8741a" opacity="0.25"
          />
        );
      })}

      {/* Road edge lines */}
      <polygon points="320,582 336,582 0,900 0,886" fill="#c8741a" opacity="0.18" />
      <polygon points="1104,582 1120,582 1440,886 1440,900" fill="#c8741a" opacity="0.18" />

      {/* Headlight cone (from bus position) */}
      <polygon points="820,610 1200,580 1440,650 1440,900 820,900"
        fill="url(#headlight)" opacity="0.08" />

      {/* Ambient amber glow behind bus area */}
      <rect x="0" y="400" width="1440" height="500" fill="url(#busGlow)" />

      {/* Horizon glow — faint amber strip */}
      <rect x="0" y="555" width="1440" height="12"
        fill="#c8741a" opacity="0.08" filter="url(#softBlur)" />

      {/* Lightning flash (subtle, left side) */}
      <polyline
        points="180,80 165,160 178,162 155,260"
        stroke="#fff8e0" strokeWidth="1.5" opacity="0.08" fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
