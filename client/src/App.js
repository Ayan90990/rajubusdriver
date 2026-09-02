import React, { useState, useEffect, useRef, useCallback } from 'react';
import YouTube from 'react-youtube';
import { useSongs } from './hooks/useSongs';
import RainCanvas from './components/RainCanvas';
import TicketModal from './components/TicketModal';
import './App.css';

function shuffleArray(arr) {
  const a = [...arr.keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function useClock() {
  const [time, setTime] = useState('');
  const [seconds, setSeconds] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}`);
      setSeconds(s);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, seconds };
}

const HORN_TUNES = [
  { // bus_horn_0003 — longer phrase
    notes: [
      [392.0, 0.22], [329.6, 0.22], [392.0, 0.22], [329.6, 0.22],
      [440.0, 0.28], [392.0, 0.22], [349.2, 0.22], [329.6, 0.38],
      [392.0, 0.18], [440.0, 0.18], [523.3, 0.55], [392.0, 0.7],
    ],
    gap: 0.045,
  },
  { // bus_horn_0005
    notes: [
      [349.2, 0.16], [392.0, 0.16], [440.0, 0.36], [392.0, 0.16],
      [349.2, 0.22], [293.7, 0.45], [349.2, 0.18], [392.0, 0.5],
    ],
    gap: 0.04,
  },
  { // Rajasthani Bus Horn
    notes: [
      [523.3, 0.16], [440.0, 0.16], [392.0, 0.16], [349.2, 0.28],
      [392.0, 0.16], [440.0, 0.16], [523.3, 0.42], [392.0, 0.18], [329.6, 0.55],
    ],
    gap: 0.035,
  },
];

const HORN_FILES = [
  '/sounds/horn.mp3',
  '/sounds/bus_horn_0003.mp3',
  '/sounds/bus_horn_0005.mp3',
  '/sounds/Rajasthani Bus Horn Download.mp3',
];

export default function App() {
  const { songs, loading } = useSongs();

  // Playback state
  const [queue, setQueue] = useState([]);
  const [queuePos, setQueuePos] = useState(0);
  const [isShuffled, setIsShuffled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [hornActive, setHornActive] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDriver, setShowDriver] = useState(false);
  const [aboard, setAboard] = useState(1);
  const [songError, setSongError] = useState(null);
  const [salonRainOn, setSalonRainOn] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  // Always start on the Bus theme; Salon is a temporary user-selected vibe.
  const [theme, setTheme] = useState('bus');
  const isSalon = theme === 'salon';

  useEffect(() => {
    const dismissed = window.localStorage.getItem('installPromptDismissed');
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    if (isMobile && !dismissed) {
      setShowInstallPrompt(true);
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      if (isMobile && !dismissed) {
        setDeferredInstallPrompt(event);
        setShowInstallPrompt(true);
      }
    };
    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Live Real-Time Passengers (ABOARD) Tracking
  useEffect(() => {
    let es;
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    try {
      es = new EventSource(`${apiBase}/api/aboard/stream`);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && typeof data.aboard === 'number') {
            setAboard(data.aboard);
          }
        } catch (_) {}
      };
      es.onerror = () => {
        // Fallback polling if disconnected
        fetch(`${apiBase}/api/aboard`)
          .then(res => res.json())
          .then(data => {
            if (data && typeof data.aboard === 'number') {
              setAboard(data.aboard);
            }
          })
          .catch(() => {});
      };
    } catch (_) {}

    return () => {
      if (es) es.close();
    };
  }, []);

  const [shayriIndex, setShayriIndex] = useState(() => Math.floor(Math.random() * 999));

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const hasStartedRef = useRef(false);
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hornIndexRef = useRef(0);
  const { time, seconds } = useClock();

  // Keep hasStartedRef in sync
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // Init queue when songs load
  useEffect(() => {
    if (songs.length) {
      setQueue(shuffleArray(songs));
    }
  }, [songs]);

  const currentIndex = queue.length ? queue[queuePos % queue.length] : 0;
  const currentSong = songs[currentIndex] || songs[0];

  const playTrack = useCallback((song) => {
    const audio = audioRef.current;
    if (!audio || !song || !song.file) return;

    audio.src = song.file;
    audio.currentTime = 0;
    audio.play().then(() => {
      setIsPlaying(true);
      setHasStarted(true);
      hasStartedRef.current = true;
    }).catch(err => {
      console.warn('Playback waiting for user interaction:', err);
    });
  }, []);

  // Sync volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const updateSeekPosition = useCallback((e) => {
    if (!trackRef.current || !duration || !audioRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  }, [duration]);

  const handleSeekMouseDown = (e) => {
    isDraggingRef.current = true;
    updateSeekPosition(e);

    const handleMouseMove = (moveEvent) => {
      if (isDraggingRef.current) {
        updateSeekPosition(moveEvent);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
  };

  const goNext = useCallback(() => {
    setSongError(null);
    let nextIdx = 0;
    setQueuePos(pos => {
      let next = pos + 1;
      if (isShuffled && next >= queue.length) {
        const lastIdx = queue[pos];
        let nq = shuffleArray(songs);
        while (nq[0] === lastIdx && songs.length > 1) nq = shuffleArray(songs);
        setQueue(nq);
        next = 0;
        nextIdx = nq[0];
      } else {
        next = next % Math.max(songs.length, 1);
        nextIdx = queue[next % queue.length];
      }
      return next;
    });

    setCurrentTime(0);
    const nextSong = songs[nextIdx] || songs[0];
    if (nextSong) {
      playTrack(nextSong);
    }
  }, [isShuffled, queue, songs, playTrack]);

  const goPrev = useCallback(() => {
    setSongError(null);
    let prevIdx = 0;
    setQueuePos(pos => {
      const prev = (pos - 1 + Math.max(songs.length, 1)) % Math.max(songs.length, 1);
      prevIdx = queue[prev % queue.length];
      return prev;
    });

    setCurrentTime(0);
    const prevSong = songs[prevIdx] || songs[0];
    if (prevSong) {
      playTrack(prevSong);
    }
  }, [songs, queue, playTrack]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasStarted) {
      if (currentSong) {
        playTrack(currentSong);
      }
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [hasStarted, isPlaying, currentSong, playTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case ' ':       e.preventDefault(); handlePlayPause(); break;
        case 'arrowright': goNext(); break;
        case 'arrowleft':  goPrev(); break;
        case 'n':       goNext(); break;
        case 'p':       goPrev(); break;
        case 'h':       blowHorn(); break;
        case 'm':       toggleMute(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const playHornTune = useCallback((tune) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      let t = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.28;
      master.connect(ctx.destination);

      tune.notes.forEach(([freq, dur]) => {
        const start = t;
        const end = t + dur;
        const makeOsc = (type, f, g) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(g, start + 0.012);
          gain.gain.setValueAtTime(g, end - 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, end);
          osc.connect(gain);
          gain.connect(master);
          osc.start(start);
          osc.stop(end + 0.02);
        };
        makeOsc('sawtooth', freq, 0.55);
        makeOsc('square', freq, 0.22);
        makeOsc('sine', freq * 1.498, 0.32);
        makeOsc('sine', freq * 2, 0.16);
        t = end + tune.gap;
      });
    } catch (_) {}
  }, []);

  const blowHorn = useCallback(() => {
    if (hornActive) return;
    setHornActive(true);
    setTimeout(() => setHornActive(false), 1200);

    // Pick a random horn file from all 4
    const randomIndex = Math.floor(Math.random() * HORN_FILES.length);
    const file = HORN_FILES[randomIndex];

    const audio = new Audio(file);
    audio.volume = 1.0;
    audio.play().catch(() => {
      // fallback: synthetic horn sound
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AC();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        [220, 277, 330, 415].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.01);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
        });
      } catch (_) {}
    });
  }, [hornActive]);

  // Direct song select from playlist
  const selectSong = useCallback((songIndex) => {
    setSongError(null);
    const rest = songs
      .map((_, idx) => idx)
      .filter(idx => idx !== songIndex);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    const newQueue = [songIndex, ...rest];
    setQueue(newQueue);
    setQueuePos(0);
    setCurrentTime(0);
    setDuration(0);
    setShowQueue(false);

    const targetSong = songs[songIndex];
    if (targetSong) {
      playTrack(targetSong);
    }
  }, [songs, playTrack]);

  const toggleMute = useCallback(() => {
    setIsMuted(m => !m);
  }, []);

  const handleVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
  };

  const installApp = async () => {
    if (!deferredInstallPrompt) {
      window.alert('Chrome ke menu (⋮) me “Add to Home screen” select karein.');
      return;
    }
    await deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissInstallPrompt = () => {
    window.localStorage.setItem('installPromptDismissed', 'true');
    setShowInstallPrompt(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const albumArt = currentSong?.videoId ? `https://img.youtube.com/vi/${currentSong.videoId}/hqdefault.jpg` : null;

  if (loading) return (
    <div style={{ background:'#1a0e00', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:'3rem', animation:'busRide 1.2s ease-in-out infinite alternate' }}>🚌</div>
      <p style={{ color:'rgba(255,255,255,0.5)', letterSpacing:3, fontSize:'0.8rem' }}>LOADING PLAYLIST…</p>
      <style>{`@keyframes busRide{0%{transform:translateX(-20px) rotate(-3deg)}100%{transform:translateX(20px) rotate(3deg)}}`}</style>
    </div>
  );

  return (
    <div className={`app theme-${theme} ${lightsOn ? 'lights-on' : 'lights-off'} ${isSalon && salonRainOn ? 'salon-rain-active' : ''}`}>
      {/* Background video animation (Official CDN + Local Fallback) */}
      <video
        key="bg-bus-video"
        autoPlay
        loop
        muted
        playsInline
        poster="https://cdn.busdriver.wtf/v1/road.jpg"
        className="scene-bg-img"
        aria-hidden="true"
        ref={el => {
          if (el) {
            el.play().catch(() => {});
          }
        }}
      >
        <source src="https://cdn.busdriver.wtf/v1/road-wide.mp4" type="video/mp4" media="(min-width: 900px)" />
        <source src="https://cdn.busdriver.wtf/v1/road.mp4" type="video/mp4" />
        <source src="/videos/bus.mp4" type="video/mp4" />
        <source src="/videos/bus.mp3.mp4" type="video/mp4" />
        <img
          src="/images/bus-bg.jpg"
          alt=""
          className="scene-bg-img"
          aria-hidden="true"
          draggable="false"
        />
      </video>
      {isSalon && (
        <div
          className="salon-scene"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(31,8,11,0.30) 0%, rgba(30,4,12,0.02) 42%, rgba(20,3,8,0.54) 100%), url('${process.env.PUBLIC_URL}/images/salon-bg.jpg')`,
          }}
        />
      )}
      {/* Dark gradient overlay */}
      <div className="scene-overlay" aria-hidden="true" />

      {/* Headlight cone — only when lights on */}
      <div className="headlight-cone" aria-hidden="true" />

      {/* Road glow — only when lights on */}
      <div className="road-glow" aria-hidden="true" />

      {/* Bus window glow — only when lights on */}
      <div className="bus-window-glow" aria-hidden="true" />

      {/* Rain */}
      <RainCanvas />
      {isSalon && salonRainOn && <div className="salon-lightning" aria-hidden="true" />}

      {/* HTML5 Audio Player for high-quality local MP3 songs */}
      <audio
        ref={audioRef}
        src={currentSong ? currentSong.file : undefined}
        preload="auto"
        onTimeUpdate={() => {
          if (!isDraggingRef.current && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime || 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onCanPlay={() => {
          if ((isPlaying || hasStartedRef.current) && audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }}
        onEnded={goNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* ── Top bar ── */}
      <header className="top-bar" role="banner">
        <div className="top-left">
          <div className="bus-badge" aria-hidden="true">{isSalon ? '✂️' : '🚌'}</div>
          <div className="top-title-small">
            <span>{isSalon ? '90s Romantic Salon' : 'राजू बस ड्राइवर'}</span>
            <span>{isSalon ? 'LOVE SONGS &nbsp;·&nbsp; RETRO NIGHTS' : 'NH 48 &nbsp;·&nbsp; DELHI – MUMBAI'}</span>
          </div>
        </div>

        <div className="top-right">
          <div className="clock" aria-label={`Current time: ${time}`}>
            {time}<sup>{seconds}</sup>
          </div>
          <div className="aboard-row">
            <span className="aboard-dot" aria-hidden="true" />
            {aboard} ABOARD
          </div>
          <div
            className="who-driving"
            role={isSalon ? undefined : 'button'}
            tabIndex={isSalon ? -1 : 0}
            aria-label={isSalon ? '90s Romantic Salon' : "Who's driving?"}
            onClick={() => !isSalon && setShowDriver(true)}
            onKeyDown={e => !isSalon && e.key === 'Enter' && setShowDriver(true)}
          >
            <div className="driver-avatar" aria-hidden="true">{isSalon ? '💈' : '👨'}</div>
            {isSalon ? 'Salon vibes' : "Who's driving?"}
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(currentTheme => currentTheme === 'bus' ? 'salon' : 'bus')}
            aria-label={isSalon ? 'Switch to Bus Driver theme' : 'Switch to 90s Romantic Salon theme'}
            title={isSalon ? 'Switch to Bus Driver theme' : 'Switch to 90s Romantic Salon theme'}
          >
            {isSalon ? '🚌 Bus Vibe' : '💈 90s Salon'}
          </button>
          {isSalon && (
            <button
              className={`salon-rain-toggle ${salonRainOn ? 'is-active' : ''}`}
              onClick={() => setSalonRainOn(isOn => !isOn)}
              aria-pressed={salonRainOn}
              aria-label={salonRainOn ? 'Turn off rain and lightning' : 'Turn on rain and lightning'}
              title={salonRainOn ? 'Turn off rain and lightning' : 'Turn on rain and lightning'}
            >
              {salonRainOn ? '⚡ बारिश ON' : '☀️ बारिश OFF'}
            </button>
          )}
        </div>
      </header>

      {/* ── Hero center ── */}
      <div className="hero-center">
        <p className="track-count-label">{isSalon ? '90s ROMANTIC HITS · LOVE MIX' : `${songs.length} TRACKS · NON-STOP`}</p>
        <h1
          className="hero-title"
          lang={isSalon ? 'en' : 'hi'}
          aria-label={isSalon ? '90s Romantic Salon' : 'राजू बस ड्राइवर - Raju Bus Driver'}
          onClick={handlePlayPause}
          style={{ cursor: 'pointer' }}
          title="Click to play / pause"
        >
          {isSalon ? '90s Romantic Salon' : 'राजू बस ड्राइवर'}
        </h1>

        {!isPlaying && !isSalon && (
          <button
            className="hero-play-prompt"
            onClick={handlePlayPause}
            style={{
              marginTop: '16px',
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #e8901f 0%, #c8741a 100%)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(232, 144, 31, 0.6), 0 4px 15px rgba(0,0,0,0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'all',
              letterSpacing: '1px'
            }}
          >
            <span>▶️</span>
            <span>सफ़र शुरू करें (PLAY)</span>
          </button>
        )}

        {songError && (
          <div style={{
            background: 'rgba(220,50,50,0.85)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            marginTop: '10px',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            pointerEvents: 'all'
          }}>
            ⚠️ {songError}
          </div>
        )}
      </div>

      {/* ── Bus scene — horn + lights + ticket buttons ── */}
      {!isSalon && <div className="bus-scene">
        {/* Horn badge */}
        <button
          className={`horn-badge ${hornActive ? 'honking' : ''}`}
          onClick={blowHorn}
          aria-label="Honk horn - Horn OK Please"
        >
          <span className="horn-icon">📯</span>
          <span className="horn-text">
            <span className="horn-hindi">हॉर्न ओके प्लीज़</span>
            <span className="horn-eng">HORN OK PLEASEEEE</span>
          </span>
        </button>

        {/* Right side buttons */}
        <div className="bus-right-btns">
          <button
            className="light-btn ticket-btn"
            onClick={() => setShowTicket(true)}
            aria-label="Buy ticket"
          >
            <span className="light-bulb-icon">🎟️</span>
            <span className="light-btn-text">
              <span className="light-btn-hindi">टिकट लो</span>
              <span className="light-btn-eng">GET TICKET</span>
            </span>
          </button>

          {/* Light toggle button */}
          <button
            className={`light-btn ${lightsOn ? 'light-on' : 'light-off'}`}
            onClick={() => setLightsOn(l => !l)}
            aria-label={lightsOn ? 'Turn off bus lights' : 'Turn on bus lights'}
          >
            <span className="light-bulb-icon">{lightsOn ? '💡' : '🌑'}</span>
            <span className="light-btn-text">
              <span className="light-btn-hindi">{lightsOn ? 'लाइट बंद' : 'लाइट चालू'}</span>
              <span className="light-btn-eng">LIGHTS {lightsOn ? 'OFF' : 'ON'}</span>
            </span>
          </button>
        </div>
      </div>}

      {/* Ticket Modal */}
      {showTicket && <TicketModal onClose={() => setShowTicket(false)} />}

      {/* Driver Details Modal */}
      {showDriver && (
        <div
          className="driver-modal-overlay"
          onClick={() => setShowDriver(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Driver details"
        >
          <div className="driver-modal-card" onClick={e => e.stopPropagation()}>
            <button className="driver-modal-close" onClick={() => setShowDriver(false)} aria-label="Close">✕</button>

            {/* Header */}
            <div className="driver-modal-header">
              <div className="driver-big-avatar">👨</div>
              <div className="driver-modal-name">
                <h2>राजू बस ड्राइवर</h2>
                <span>RAJU BUS DRIVER</span>
              </div>
            </div>

            {/* ID Card style */}
            <div className="driver-id-card">
              <div className="driver-id-row">
                <span className="driver-id-label">🪪 License No.</span>
                <span className="driver-id-val">RJ-14/DL-2847639</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">📍 From</span>
                <span className="driver-id-val">Jodhpur, Rajasthan</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">🛣️ Route</span>
                <span className="driver-id-val">Delhi → Mumbai · NH 48</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">🚌 Vehicle</span>
                <span className="driver-id-val">Tata Motors LPO 1623</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">⏱️ Experience</span>
                <span className="driver-id-val">22 Years</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">⭐ Rating</span>
                <span className="driver-id-val">★★★★★ &nbsp;4.9 / 5.0</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">🎵 Fav Song</span>
                <span className="driver-id-val">Dil Chahta Hai</span>
              </div>
              <div className="driver-id-row">
                <span className="driver-id-label">📯 Horn Style</span>
                <span className="driver-id-val">Rajasthani Desi 🚌</span>
              </div>
            </div>

            {/* Quote */}
            <div className="driver-quote">
              ❝ सड़क मेरी माँ है, गाड़ी मेरी जान है — राजू बस ड्राइवर ❞
            </div>
          </div>
        </div>
      )}

      {/* ── Playlist / Queue Panel ── */}
      {showQueue && (
        <div className="queue-panel" role="dialog" aria-label="Song playlist">
          <div className="queue-header">
            <span className="queue-title">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{marginRight:8,verticalAlign:'middle'}}>
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18A3 3 0 0 0 15 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-4z"/>
              </svg>
              Queue &nbsp;<span className="queue-count">{songs.length} songs</span>
            </span>
            <button className="queue-close" onClick={() => setShowQueue(false)} aria-label="Close playlist">✕</button>
          </div>
          <ul className="queue-list" role="list">
            {songs.map((song, i) => {
              const isActive = i === currentIndex;
              return (
                <li
                  key={song._id || song.videoId}
                  className={`queue-item ${isActive ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${song.title}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => selectSong(i)}
                  onKeyDown={e => { if (e.key === 'Enter') selectSong(i); }}
                >
                  {/* Thumb */}
                  <div className="qi-thumb">
                    {isActive
                      ? <div className="qi-playing-bars" aria-hidden="true"><span/><span/><span/></div>
                      : <span className="qi-num">{String(i+1).padStart(2,'0')}</span>
                    }
                  </div>
                  {/* Album art / Retro Disc icon */}
                  {song.videoId ? (
                    <img
                      className="qi-art"
                      src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="qi-art-placeholder" style={{ width: 38, height: 38, borderRadius: 6, background: 'linear-gradient(135deg, #3d1f00 0%, #1a0e00 100%)', border: '1px solid var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      📻
                    </div>
                  )}
                  {/* Info */}
                  <div className="qi-info">
                    <span className="qi-title">{song.title}</span>
                    <span className="qi-artist">{song.artist?.split('—')[1]?.trim() || song.artist}</span>
                  </div>
                  {/* Year */}
                  {song.year && <span className="qi-year">{song.year}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Shayri Board (truck/bus style) — hidden when playlist/modal is open ── */}
      {!showQueue && !showTicket && !showDriver && !showDownloadModal && (() => {
        const shayris = [
          { hi: 'जब जब दिल घबराया, हमने गाड़ी चलाया', en: 'Whenever the heart ached, we just drove on' },
          { hi: 'बुरी नज़र वाले तेरा मुँह काला', en: 'Evil eye upon you, shame on your face' },
          { hi: 'जल्दी में मत जा, ज़िन्दगी छोटी है', en: 'Don\'t rush, life is short' },
          { hi: 'माँ का आशीर्वाद, राह का इरादा', en: 'Mother\'s blessings, road\'s resolve' },
          { hi: 'ओवरटेक मत कर, क़िस्मत के भरोसे मत चल', en: 'Don\'t overtake, don\'t rely on fate alone' },
          { hi: 'सफ़र ज़िन्दगी का, मंज़िल दिलकश', en: 'Life is the journey, destination is beautiful' },
          { hi: 'दूर से आए हैं, दूर जाना है', en: 'Come from afar, still far to go' },
          { hi: 'पहले आओ, पहले जाओ — यह नियम नहीं चलता', en: 'First come, first go — that\'s not how roads work' },
          { hi: 'मेरी गाड़ी मेरी जान, तू भी रख अपनी आन', en: 'My truck is my life, you guard yours too' },
          { hi: 'रफ़्तार ज़िन्दगी की है, ब्रेक लगाना भी सीखो', en: 'Life has speed, learn to brake too' },
          { hi: 'हर रोज़ नया सफ़र, हर रोज़ नई कहानी', en: 'Every day a new journey, every day a new story' },
          { hi: 'धीरे चलो, लम्बी है राह', en: 'Go slow, the road is long' },
          { hi: 'ख़ुदा पर भरोसा रख, स्टीयरिंग पर हाथ', en: 'Trust in God, hands on the steering' },
          { hi: 'सड़क का कोई दोस्त नहीं, सब राहगीर हैं', en: 'The road has no friends, everyone is a traveler' },
          { hi: 'जो चला वो पहुँचा, जो रुका वो भटका', en: 'Who moved forward arrived, who stopped got lost' },
          { hi: 'हॉर्न बजाओ, ख़ुश रहो', en: 'Honk the horn, stay happy' },
          { hi: 'यह गाड़ी नहीं मेरा घर है', en: 'This is not a truck, it is my home' },
          { hi: 'रात के अंधेरे में भी राह मिलती है', en: 'Even in the dark of night, the path appears' },
          { hi: 'मंज़िल उसी की होती है जो हिम्मत नहीं हारता', en: 'The destination belongs to those who never give up' },
          { hi: 'चलते रहो, ज़िन्दगी रुकती नहीं', en: 'Keep moving, life never stops' },
        ];
        const salonShayris = [
          { hi: 'पुराने गीतों में नई सी मोहब्बत', en: 'Old songs, a love that feels new' },
          { hi: 'आईने में मुस्कान, दिल में 90s की धुन', en: 'A smile in the mirror, a 90s tune in the heart' },
          { hi: 'कंघी की खनक और यादों की शाम', en: 'The sound of a comb and an evening of memories' },
          { hi: 'रेडियो बजा, शाम थोड़ी और हसीन हुई', en: 'The radio played, and the evening grew prettier' },
          { hi: 'बालों की खुशबू, दिल का पुराना जादू', en: 'The scent of hair, the heart’s old magic' },
          { hi: 'बारिश की रात और दिल की बात', en: 'A rainy night and a conversation of hearts' },
        ];
        const activeShayris = isSalon ? salonShayris : shayris;
        const s = activeShayris[shayriIndex % activeShayris.length];
        return (
          <div className="shayri-board">
            <div className="shayri-content">
              <span className="shayri-deco">{isSalon ? '♪' : '❝'}</span>
              <div className="shayri-text">
                <p className="shayri-hi" lang="hi">{s.hi}</p>
                <p className="shayri-en">{s.en}</p>
              </div>
              <span className="shayri-deco">{isSalon ? '♡' : '❞'}</span>
            </div>
            <button
              className="shayri-refresh"
              onClick={() => setShayriIndex(i => (i + 1 + Math.floor(Math.random() * 5)) % activeShayris.length + (i + 1))}
              aria-label="New shayri"
              title="Naya shayri"
            >
              🔄
            </button>
          </div>
        );
      })()}

      <footer className="player-bar" role="region" aria-label="Music player">

        {/* ── PILL CARD ── */}
        <div className="player-pill">

          {/* Top row: art + info + controls */}
          <div className="pill-top">

            {/* Album art — circular, spins when playing */}
            <div className={`pill-art ${isPlaying ? 'playing' : ''}`}>
              {albumArt
                ? <img src={albumArt} alt={currentSong?.title || 'Album art'} />
                : <div className="art-placeholder">🎵</div>
              }
            </div>

            {/* Song info */}
            <div className="pill-info">
              <div className="pill-title">{currentSong?.title || '—'}</div>
              <div className="pill-artist">
                {currentSong?.artist?.split('—')[1]?.trim() || currentSong?.artist || ''}
              </div>
            </div>

            {/* Controls */}
            <div className="pill-controls">

              {/* Prev */}
              <button className="pc" onClick={goPrev} aria-label="Previous track">
                <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>

              {/* Play / Pause */}
              <button className="pc pc-play" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying
                  ? <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* Next */}
              <button className="pc" onClick={goNext} aria-label="Next track">
                <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
              </button>

              {/* Volume */}
              <button className="pc" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted
                  ? <svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18l2 2L21 18.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>
                  : volume < 40
                    ? <svg viewBox="0 0 24 24"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                    : <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                }
              </button>

              {/* Volume slider */}
              <input
                type="range" min={0} max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="vol-slider"
                aria-label="Volume"
              />

              {/* Download button */}
              <button
                className="pc"
                aria-label="Download Song"
                title="Download current song MP3"
                onClick={() => setShowDownloadModal(true)}
              >
                <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              </button>

              {/* Shuffle */}
              <button
                className="pc"
                onClick={() => setIsShuffled(s => !s)}
                aria-label={isShuffled ? 'Shuffle on' : 'Shuffle off'}
                style={{ opacity: isShuffled ? 1 : 0.4 }}
              >
                <svg viewBox="0 0 24 24"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
              </button>

              {/* Queue */}
              <button className="pc" aria-label="Queue" onClick={() => setShowQueue(s => !s)}>
                <svg viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18A3 3 0 0 0 15 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-4z"/></svg>
              </button>

            </div>
          </div>

          {/* Progress bar row with moving 🚌 bus icon */}
          <div className="pill-progress">
            <span className="p-time">{formatTime(currentTime)}</span>
            <div
              className="p-track"
              ref={trackRef}
              onMouseDown={handleSeekMouseDown}
              onTouchStart={handleSeekMouseDown}
              aria-label={`Progress ${Math.round(progress)}%`}
              role="slider"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="p-fill" style={{ width: `${progress}%` }} />
              <div
                className={`bus-seek-icon ${isSalon ? 'salon-seek-icon' : ''}`}
                style={{ left: `${progress}%` }}
                title={isSalon ? `Seek song to ${formatTime(currentTime)}` : `Seek bus to ${formatTime(currentTime)}`}
              >
                {isSalon ? '✂️' : '🚌'}
              </div>
            </div>
            <span className="p-time right">{formatTime(duration)}</span>
          </div>

        </div>

        {/* Keyboard hints */}
        <div className="kbd-hints" aria-hidden="true">
          <span className="kbd-hint"><kbd>Space</kbd> PLAY / PAUSE</span>
          <span className="kbd-hint"><kbd>N</kbd> NEXT &nbsp;<kbd>P</kbd> PREV</span>
          <span className="kbd-hint"><kbd>M</kbd> MUTE</span>
          <span className="kbd-hint"><kbd>H</kbd> HORN</span>
        </div>
        {!isSalon && (
          <a className="playlist-page-link" href="/bus-driver-playlist/">Bus Driver Playlist · Hindi Night Drive Songs</a>
        )}

      </footer>

      {/* Download Modal */}
      {showDownloadModal && currentSong && (
        <div className="download-modal-overlay" onClick={() => setShowDownloadModal(false)}>
          <div className="download-modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDownloadModal(false)} aria-label="Close modal">✕</button>
            <div className="download-modal-header">
              <span className="download-icon-large">📥</span>
              <h3>Download Song / गाना डाउनलोड</h3>
            </div>

            <div className="download-song-info">
              <img
                src={`https://img.youtube.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt=""
                className="download-thumb"
              />
              <div className="download-text-details">
                <p className="ds-title">{currentSong.title}</p>
                <p className="ds-artist">{currentSong.artist}</p>
                <span className="ds-badge">AUDIO MP3</span>
              </div>
            </div>

            <div className="download-action-btns">
              <a
                href={`https://cobalt.tools/?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${currentSong.videoId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dl-action-btn primary"
              >
                <span>🎵</span> Direct MP3 Download (Cobalt)
              </a>

              <a
                href={`https://y2mate.is/search?q=${encodeURIComponent(`https://www.youtube.com/watch?v=${currentSong.videoId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dl-action-btn secondary"
              >
                <span>⚡</span> Mirror MP3 Converter (Y2Mate)
              </a>

              <a
                href={`https://www.youtube.com/watch?v=${currentSong.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dl-action-btn youtube"
              >
                <span>▶</span> Open on YouTube
              </a>
            </div>
          </div>
        </div>
      )}

      {showInstallPrompt && (
        <aside className="install-prompt" aria-label="Add Raju Bus Driver to your home screen">
          <img className="install-prompt-icon" src="/favicon.png" alt="Raju Bus Driver" />
          <div className="install-prompt-copy">
            <strong>Bus ko home screen par rakhein</strong>
            <span>Ek tap, bina app store ke</span>
          </div>
          <button className="install-prompt-add" onClick={installApp}>Add</button>
          <button className="install-prompt-close" onClick={dismissInstallPrompt} aria-label="Close install prompt">×</button>
        </aside>
      )}

    </div>
  );
}
