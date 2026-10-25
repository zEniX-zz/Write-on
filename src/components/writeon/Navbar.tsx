'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useScrollSpy,
  useScrolled,
  useBodyScrollLock,
  useEscapeAndClickOutside,
} from '@/hooks/writeon/scrollFx';

const NAV_LINKS = [
  { id: 'problem', label: 'The Problem', idx: '01' },
  { id: 'tools', label: 'Tools', idx: '02' },
  { id: 'how', label: 'How it works', idx: '03' },
  { id: 'limitations', label: 'Limits', idx: '04' },
  { id: 'research', label: 'Research', idx: '05' },
];

const SECTION_IDS = ['home', ...NAV_LINKS.map((l) => l.id)];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(12);
  const active = useScrollSpy(SECTION_IDS, 90);

  // lock body scroll while the mobile menu is open
  useBodyScrollLock(open);

  const close = useCallback(() => setOpen(false), []);

  // close on Escape / outside click (mobile panel) — only when open
  const mobileNavRef = useEscapeAndClickOutside<HTMLDivElement>(open, close);

  // close on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // close on route-hash change (anchor click)
  useEffect(() => {
    const onHash = () => setOpen(false);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // account for sticky navbar height
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <>
      <header className={`topnav ${scrolled ? 'scrolled' : ''}`}>
        <div className="writeon-container nav-inner">
          <a
            className="brand-mark"
            href="#top"
            aria-label="Writeon — home"
            onClick={(e) => handleNavClick(e, 'top')}
          >
            <svg
              viewBox="0 0 48 48"
              width="34"
              height="34"
              aria-hidden="true"
              className="brand-shield"
            >
              <path
                d="M24 3 42 11v13c0 12.5-7.4 19.6-18 22C13.4 43.6 6 36.5 6 24V11L24 3Z"
                fill="rgba(255,255,255,.10)"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M24 11.5 34.5 16v8c0 8-4.9 12.8-10.5 14.4C18.4 36.8 13.5 32 13.5 24v-8L24 11.5Z"
                fill="none"
                stroke="rgba(255,255,255,.45)"
                strokeWidth="1.6"
              />
              <path
                d="M18.5 24.2l4.2 4.2 7.6-8.6"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="brand-text">
              WRITE<em>ON</em>
            </span>
          </a>

          {/* desktop nav */}
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  className={`nav-link ${active === l.id ? 'active' : ''}`}
                  href={`#${l.id}`}
                  onClick={(e) => handleNavClick(e, l.id)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <span className="nav-chip" title="Built at PW IOI Noida">
              PW&nbsp;IOI&nbsp;NOIDA
              <span className="chip-dot" />
            </span>
          </ul>

          {/* hamburger toggle (mobile only) */}
          <button
            type="button"
            className="nav-toggle-btn"
            aria-controls="siteNav"
            aria-expanded={open}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* mobile slide-down panel */}
      <nav
        ref={mobileNavRef}
        className={`mobile-nav ${open ? 'open' : ''}`}
        id="siteNav"
        aria-hidden={!open}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-inner">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              className={`nav-link ${active === l.id ? 'active' : ''}`}
              href={`#${l.id}`}
              onClick={(e) => handleNavClick(e, l.id)}
              tabIndex={open ? 0 : -1}
            >
              <span>{l.label}</span>
              <span className="idx">{l.idx}</span>
            </a>
          ))}
          <span className="nav-chip" title="Built at PW IOI Noida">
            PW&nbsp;IOI&nbsp;NOIDA
            <span className="chip-dot" />
          </span>
        </div>
      </nav>
    </>
  );
}
