'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/writeon/scrollFx';

const STATUS_LINES = [
  'ESTABLISHING SECURE SCAN…',
  'PARSING THREAT SURFACE…',
  'LOADING HEURISTIC ENGINE…',
  'ARMING LINK SCANNER…',
  'ARMING PASSWORD METER…',
  'WRITEON ONLINE',
];

export default function IntroOverlay() {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeCleanupRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const INTRO_MS = reduced ? 600 : 4200;

    // status line rotation
    statusTimerRef.current = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUS_LINES.length - 1));
    }, INTRO_MS / STATUS_LINES.length);

    // ascii rain
    const canvas = canvasRef.current;
    if (canvas && !reduced) {
      const ctx = canvas.getContext('2d');
      const GLYPHS =
        '01<>{}[]#$%&*+=/\\|~^01ABCDEF0123456789ΨΦΞΔΣΩΛΓWRITEON';
      let cols = 0;
      let drops: number[] = [];
      let fontSize = 15;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        fontSize = Math.max(13, Math.floor(canvas.width / 90));
        cols = Math.ceil(canvas.width / fontSize);
        drops = new Array(cols).fill(0).map(() => Math.random() * -60);
      };
      resize();
      window.addEventListener('resize', resize);

      let last = 0;
      const tick = (now: number) => {
        rafRef.current = requestAnimationFrame(tick);
        if (now - last < 42) return; // ~24fps is plenty for rain
        last = now;
        ctx!.fillStyle = 'rgba(3, 3, 3, 0.16)';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        ctx!.font = `${fontSize}px "JetBrains Mono", monospace`;
        for (let i = 0; i < cols; i++) {
          const glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          const y = drops[i] * fontSize;
          const head = y > 0 && Math.random() < 0.08;
          ctx!.fillStyle = head
            ? '#ffffff'
            : Math.random() < 0.12
              ? 'rgba(255,255,255,.9)'
              : 'rgba(255,255,255,.42)';
          ctx!.fillText(glyph, i * fontSize, y);
          drops[i] =
            y > canvas.height + Math.random() * 400
              ? Math.random() * -30
              : drops[i] + 1;
        }
      };
      rafRef.current = requestAnimationFrame(tick);

      const cleanup = () => {
        window.removeEventListener('resize', resize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
      // store for the outer cleanup
      resizeCleanupRef.current = cleanup;
    }

    // dismiss
    const dismiss = () => {
      setDone(true);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    autoTimerRef.current = setTimeout(dismiss, INTRO_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeCleanupRef.current?.();
    };
  }, [reduced]);

  if (done) return null;

  return (
    <div
      className="intro-screen"
      role="status"
      aria-label="Writeon is starting up"
      onClick={() => setDone(true)}
    >
      <canvas ref={canvasRef} className="ascii-rain" aria-hidden="true" />
      <div className="intro-grid-bg" aria-hidden="true" />
      <div className="intro-card">
        <svg
          className="intro-shield"
          viewBox="0 0 96 96"
          width="96"
          height="96"
          aria-hidden="true"
        >
          <path
            d="M48 5 86 24v22c0 23-13.6 34.4-38 42C23.6 80.4 10 69 10 46V24L48 5Z"
            fill="rgba(255,255,255,.07)"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M48 15 76 29.5V46c0 17.5-10.4 26.6-28 32.6C30.4 72.6 20 63.5 20 46V29.5L48 15Z"
            fill="none"
            stroke="rgba(255,255,255,.4)"
            strokeWidth="1.6"
          />
          <path
            d="M34 49.5l9.5 9.5L63 37"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="intro-kicker">HACKATHON&nbsp;BUILD</p>
        <h1 className="intro-word">WRITEON</h1>
        <p className="intro-tag">
          <span className="prompt" style={{ color: '#fff' }}>
            &gt;
          </span>
          two tools · one page · no backend
        </p>
        <div className="intro-bar" aria-hidden="true">
          <div
            className="intro-bar-fill"
            style={
              reduced
                ? { width: '100%' }
                : { animation: 'introBarFill 4.2s linear forwards' }
            }
          />
        </div>
        <p className="intro-status">{STATUS_LINES[statusIdx]}</p>
      </div>
      <p className="intro-skip">TAP ANYWHERE OR PRESS ESC TO SKIP</p>
    </div>
  );
}
