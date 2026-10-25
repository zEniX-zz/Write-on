'use client';

import { useMouseTilt } from '@/hooks/writeon/scrollFx';

const SIGNALS = [
  'http ≠ https',
  '@ trickery',
  'punycode xn--',
  'lookalike brands',
  '400+ char URLs',
  'IP-address hosts',
  'common passwords',
  'sequential runs',
  'keyboard walks',
  'NIST SP 800-63B',
  'offline analysis',
  'zero data transmitted',
];

export default function Hero() {
  const tiltRef = useMouseTilt(8);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="hero writeon-container" id="home" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div>
          <p className="mono-kicker reveal">
            <span className="prompt">{'//'}</span> writeon_defense — hackathon build 2026
          </p>
          <h1 id="hero-title" className="hero-title reveal d1">
            WRITE<br />
            <span className="grad-text">ON</span>
          </h1>
          <p className="hero-sub reveal d2">Check links. Build strong passwords.</p>
          <p className="mono-line reveal d3" style={{ color: 'var(--muted)', marginBottom: '1.1rem' }}>
            <span className="prompt">&gt;</span> two tools · one page · no backend
          </p>
          <p className="hero-lede reveal d4">
            Phishing hides in plain sight — inside a link that looks almost right, and behind a password like{' '}
            <code>iloveyou123</code>. Writeon gives first-year students and everyday users two fast, honest checks
            that run entirely on your device.
          </p>
          <div className="hero-ctas reveal d5">
            <a
              href="#tool-link"
              className="btn-cyber"
              onClick={(e) => handleNavClick(e, 'tool-link')}
            >
              Analyze a link
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#tool-password"
              className="btn-ghost"
              onClick={(e) => handleNavClick(e, 'tool-password')}
            >
              Check a password
            </a>
          </div>
          <ul className="hero-badges reveal d6" aria-label="Key properties">
            <li>
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path
                  d="M12 3l8 3.5V12c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6.5L12 3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              100% local — no uploads
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Results in milliseconds
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path
                  d="M9 12.5l2 2 4.5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3.5"
                  y="4.5"
                  width="17"
                  height="15"
                  rx="2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              NIST SP 800-63B aligned
            </li>
          </ul>
        </div>

        <div>
          <div className="hero-visual reveal d2" aria-hidden="true">
            <div className="tilt-wrap" ref={tiltRef}>
              <div className="holo-frame" data-parallax="0.06">
                <div className="scan-beam" />
                {/* THE SHIELD — neon white scanner emblem */}
                <svg className="shield-svg" viewBox="0 0 220 236" role="img" aria-label="Glowing shield scanner emblem">
                  <defs>
                    <linearGradient id="shieldFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#1c1c1c" />
                      <stop offset=".55" stopColor="#141414" />
                      <stop offset="1" stopColor="#0a0a0a" />
                    </linearGradient>
                    <linearGradient id="circuitGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#8c8c8c" />
                    </linearGradient>
                    <radialGradient id="coreGlow" cx=".5" cy=".46" r=".55">
                      <stop offset="0" stopColor="#ffffff" stopOpacity=".42" />
                      <stop offset=".55" stopColor="#ffffff" stopOpacity=".06" />
                      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="110" cy="112" r="88" fill="url(#coreGlow)" />
                  <circle
                    className="orbit-ring"
                    cx="110"
                    cy="112"
                    r="103"
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity=".32"
                    strokeWidth="1.4"
                    strokeDasharray="4 10"
                  />
                  <circle cx="110" cy="112" r="103" fill="none" stroke="#ffffff" strokeOpacity=".14" strokeWidth="8" />
                  <path
                    d="M110 14 188 51v58c0 55-33.5 86.5-78 98C65.5 195.5 32 164 32 109V51L110 14Z"
                    fill="url(#shieldFill)"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M110 30 172 61.5V109c0 45.5-27 72-62 82-35-10-62-36.5-62-82V61.5L110 30Z"
                    fill="none"
                    stroke="rgba(255,255,255,.4)"
                    strokeOpacity=".85"
                    strokeWidth="1.8"
                  />
                  {/* circuit traces */}
                  <g stroke="url(#circuitGrad)" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".95">
                    <path d="M110 74v18M110 150v-16M64 96l20 10M156 96l-20 10M71 138l18-9M149 138l-18-9" />
                  </g>
                  <g fill="#ffffff">
                    <circle cx="110" cy="74" r="3.4" />
                    <circle cx="110" cy="150" r="3.4" />
                    <circle cx="64" cy="96" r="3.4" />
                    <circle cx="156" cy="96" r="3.4" />
                    <circle cx="71" cy="138" r="3.4" />
                    <circle cx="149" cy="138" r="3.4" />
                  </g>
                  {/* core keyhole */}
                  <circle cx="110" cy="106" r="15" fill="#050505" stroke="#ffffff" strokeWidth="2.4" />
                  <path d="M110 112v14" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
                </svg>
                <span className="holo-corner tl" />
                <span className="holo-corner tr" />
                <span className="holo-corner bl" />
                <span className="holo-corner br" />
                <p className="holo-caption">
                  <span className="live-dot" />
                  threat_surface · scanning
                </p>
              </div>
            </div>

            {/* floating spec chips (deeper parallax) */}
            <div className="float-chip chip-a" data-parallax="0.22">
              <span className="chip-num">0</span> bytes
              <br />
              leave your device
            </div>
            <div className="float-chip chip-b" data-parallax="0.32">
              <span className="mono-mini">&gt; scan_link()</span>
              <br />
              21 heuristic signals
            </div>
            <div className="float-chip chip-c" data-parallax="0.17">
              <span className="mono-mini">&gt; check_pass()</span>
              <br />
              NIST-length aware
            </div>
          </div>
        </div>
      </div>

      {/* signal marquee */}
      <div className="signal-strip" aria-hidden="true">
        <div className="signal-track">
          {[...SIGNALS, ...SIGNALS].map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '1.15rem' }}>
              {s}
              <i>◆</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
