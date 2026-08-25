import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './TicketModal.css';

const SEATS = ['A1','A2','A3','A4','B1','B2','B3','B4','C1','C2','C3','C4','D1','D2','D3','D4'];
const STOPS = [
  'Delhi (ISBT Kashmere Gate)',
  'Gurgaon',
  'Jaipur (Sindhi Camp)',
  'Ajmer',
  'Udaipur',
  'Ahmedabad',
  'Vadodara',
  'Surat',
  'Mumbai (Dadar)',
];

function getRandomSeat(used) {
  const avail = SEATS.filter(s => !used.includes(s));
  return avail[Math.floor(Math.random() * avail.length)];
}

function generatePNR() {
  return 'BUS' + Math.random().toString(36).toUpperCase().slice(2,8);
}

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

export default function TicketModal({ onClose }) {
  const [step, setStep] = useState('form'); // form | ticket
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    from: 'Delhi (ISBT Kashmere Gate)',
    to: 'Mumbai (Dadar)',
    date: todayPlus(1),
    busType: 'Ordinary',
  });
  const [ticket, setTicket] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const ticketRef = useRef(null);

  const busTypes = [
    { label: 'Ordinary', price: 850, tag: 'सामान्य' },
    { label: 'Semi-Deluxe', price: 1150, tag: 'अर्ध-डीलक्स' },
    { label: 'Deluxe AC', price: 1650, tag: 'डीलक्स AC' },
    { label: 'Volvo AC', price: 2200, tag: 'वोल्वो AC' },
  ];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleBook = e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const pnr = generatePNR();
    const seat = getRandomSeat([]);
    const bus = busTypes.find(b => b.label === form.busType);
    const dep = ['05:30','06:00','07:15','08:45','09:00','10:30','14:00','18:00','20:30','22:00'][Math.floor(Math.random()*10)];
    const hrs = form.busType === 'Volvo AC' ? '24h 30m' : form.busType === 'Deluxe AC' ? '26h 00m' : '28h 45m';
    setTicket({
      ...form,
      pnr,
      seat,
      price: bus.price,
      tag: bus.tag,
      departure: dep,
      duration: hrs,
      issued: new Date().toLocaleString('en-IN'),
      operator: 'राज्य परिवहन निगम',
      busNo: 'RJ-' + Math.floor(1000 + Math.random()*9000),
    });
    setStep('ticket');
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `BusTicket_${ticket.pnr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  const handleShare = async () => {
    const text = `🚌 राजू बस ड्राइवर — NH 48\n\nPassenger: ${ticket.name}\nPNR: ${ticket.pnr}\nSeat: ${ticket.seat}\nFrom: ${ticket.from}\nTo: ${ticket.to}\nDate: ${ticket.date}  ${ticket.departure}\nFare: ₹${ticket.price}\n\nHAVE A SAFE JOURNEY! 🙏`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bus Ticket — NH 48', text });
        setShareMsg('Shared!');
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      setShareMsg('Copied to clipboard!');
    }
    setTimeout(() => setShareMsg(''), 2500);
  };

  return (
    <div className="tmodal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tmodal-box">

        {/* Header */}
        <div className="tmodal-header">
          <span className="tmodal-icon">🎟️</span>
          <span className="tmodal-head-title">
            {step === 'form' ? 'Book Your Ticket' : 'Your Ticket'}
          </span>
          <button className="tmodal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── BOOKING FORM ── */}
        {step === 'form' && (
          <form className="tform" onSubmit={handleBook} noValidate>
            <div className="tform-grid">
              {/* Name */}
              <div className="tform-field full">
                <label>Passenger Name *</label>
                <input
                  name="name" value={form.name}
                  onChange={handleChange}
                  placeholder="Apna naam likhiye..."
                  required autoFocus
                />
              </div>

              {/* Age + Gender */}
              <div className="tform-field">
                <label>Age</label>
                <input name="age" value={form.age} onChange={handleChange}
                  type="number" min="1" max="120" placeholder="25" />
              </div>
              <div className="tform-field">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {/* From */}
              <div className="tform-field full">
                <label>From</label>
                <select name="from" value={form.from} onChange={handleChange}>
                  {STOPS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* To */}
              <div className="tform-field full">
                <label>To</label>
                <select name="to" value={form.to} onChange={handleChange}>
                  {STOPS.filter(s => s !== form.from).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Bus type */}
              <div className="tform-field full">
                <label>Bus Type</label>
                <div className="bus-type-grid">
                  {busTypes.map(b => (
                    <label key={b.label}
                      className={`bus-type-card ${form.busType === b.label ? 'selected' : ''}`}>
                      <input type="radio" name="busType" value={b.label}
                        checked={form.busType === b.label} onChange={handleChange} />
                      <span className="bt-label">{b.label}</span>
                      <span className="bt-hindi">{b.tag}</span>
                      <span className="bt-price">₹{b.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button className="tform-submit" type="submit">
              Book Ticket &nbsp; 🎟️
            </button>

            <p className="tform-note">* This is a fun/demo ticket. No real booking is made.</p>
          </form>
        )}

        {/* ── TICKET ── */}
        {step === 'ticket' && ticket && (
          <div className="ticket-wrapper">
            {/* The actual printable ticket */}
            <div className="bus-ticket" ref={ticketRef}>

              {/* Top strip */}
              <div className="tk-top-strip">
                <div className="tk-operator">{ticket.operator}</div>
                <div className="tk-nh">NH 48 · ALL NIGHT NON-STOP</div>
              </div>

              {/* Perforation line top */}
              <div className="tk-perf" />

              {/* Main body */}
              <div className="tk-body">
                {/* Left: route info */}
                <div className="tk-left">
                  <div className="tk-route-row">
                    <div className="tk-city">
                      <span className="tk-city-code">{ticket.from.split(' ')[0].toUpperCase().slice(0,3)}</span>
                      <span className="tk-city-name">{ticket.from}</span>
                    </div>
                    <div className="tk-arrow-wrap">
                      <div className="tk-dashed-line" />
                      <span className="tk-bus-icon">🚌</span>
                      <div className="tk-dashed-line" />
                    </div>
                    <div className="tk-city tk-city-right">
                      <span className="tk-city-code">{ticket.to.split(' ')[0].toUpperCase().slice(0,3)}</span>
                      <span className="tk-city-name">{ticket.to}</span>
                    </div>
                  </div>

                  <div className="tk-details-row">
                    <div className="tk-detail-box">
                      <span className="tk-d-label">DATE</span>
                      <span className="tk-d-value">{ticket.date}</span>
                    </div>
                    <div className="tk-detail-box">
                      <span className="tk-d-label">DEPARTS</span>
                      <span className="tk-d-value">{ticket.departure}</span>
                    </div>
                    <div className="tk-detail-box">
                      <span className="tk-d-label">DURATION</span>
                      <span className="tk-d-value">{ticket.duration}</span>
                    </div>
                    <div className="tk-detail-box">
                      <span className="tk-d-label">BUS NO.</span>
                      <span className="tk-d-value">{ticket.busNo}</span>
                    </div>
                  </div>

                  <div className="tk-passenger-row">
                    <div className="tk-passenger-info">
                      <span className="tk-pass-name">{ticket.name.toUpperCase()}</span>
                      <span className="tk-pass-sub">{ticket.gender}{ticket.age ? `, ${ticket.age} yrs` : ''} · {ticket.busType}</span>
                    </div>
                    <div className="tk-seat-badge">
                      <span className="tk-seat-label">SEAT</span>
                      <span className="tk-seat-num">{ticket.seat}</span>
                    </div>
                  </div>
                </div>

                {/* Vertical tear line */}
                <div className="tk-tear-line">
                  <div className="tk-tear-dots" />
                  <span className="tk-tear-scissors">✂</span>
                  <div className="tk-tear-dots" />
                </div>

                {/* Right: stub */}
                <div className="tk-stub">
                  <div className="tk-stub-header">राजू बस ड्राइवर</div>
                  <div className="tk-pnr-label">PNR</div>
                  <div className="tk-pnr">{ticket.pnr}</div>
                  <div className="tk-fare-label">FARE</div>
                  <div className="tk-fare">₹{ticket.price}</div>
                  <div className="tk-barcode" aria-hidden="true">
                    {Array.from({length:28}).map((_,i) => (
                      <div key={i} className="tk-bar"
                        style={{ height: `${20 + Math.sin(i*1.7)*12}px`,
                                 width: i%3===0 ? '3px' : '1.5px' }} />
                    ))}
                  </div>
                  <div className="tk-issued">Issued: {ticket.issued}</div>
                </div>
              </div>

              {/* Perforation line bottom */}
              <div className="tk-perf" />

              {/* Bottom note */}
              <div className="tk-bottom-strip">
                <span>🙏 HAVE A SAFE JOURNEY · यात्रा शुभ हो · HORN OK PLEASE 📯</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="ticket-actions">
              <button className="tact-btn tact-download" onClick={handleDownload} disabled={downloading}>
                {downloading
                  ? <><span className="tact-spinner" /> Saving…</>
                  : <><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> Download</>
                }
              </button>
              <button className="tact-btn tact-share" onClick={handleShare}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                {shareMsg || 'Share'}
              </button>
              <button className="tact-btn tact-new" onClick={() => setStep('form')}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                New Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
