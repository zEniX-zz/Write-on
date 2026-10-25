'use client';

import { useState, useEffect } from 'react';
import { useScrollProgress } from '@/hooks/writeon/scrollFx';

/* ============================================================
   PROBLEM
   ============================================================ */
export function ProblemSection() {
  return (
    <section className="section writeon-container" id="problem" aria-labelledby="problem-title">
      <p className="mono-kicker reveal">
        <span className="prompt">{'//'}</span> threat_context
      </p>
      <h2 id="problem-title" className="section-title reveal d1">
        The problem, in <span className="grad-text">two clicks</span>
      </h2>

      <div
        className="reveal d2"
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.4rem' }}
      >
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <ProblemPanel />
          <AnatomyPanel />
        </div>
      </div>
      <style>{`
        @media (min-width: 992px) {
          .grid-2col { grid-template-columns: 5fr 7fr !important; }
        }
      `}</style>
    </section>
  );
}

function ProblemPanel() {
  return (
    <div className="cyber-panel problem-panel reveal d2" style={{ height: '100%' }}>
      <p className="panel-head">
        <span className="panel-tag">01</span>WHY THIS EXISTS
      </p>
      <p className="problem-lede">
        Most people don&apos;t get hacked by movie-style exploits. They get hacked by an{' '}
        <em>ordinary link</em> and an <em>ordinary password</em>. Both look fine until they aren&apos;t.
      </p>
      <ul className="problem-list">
        <li>
          <span className="p-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <strong>Email is the #1 lure.</strong> Phishing arrives disguised as urgent account alerts, invoices, KYC and password resets.
          </span>
        </li>
        <li>
          <span className="p-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M10 14a5 5 0 0 0 7.1 0l2.4-2.4a5 5 0 0 0-7.1-7.1l-1.3 1.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M14 10a5 5 0 0 0-7.1 0l-2.4 2.4a5 5 0 0 0 7.1 7.1l1.3-1.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <span>
            <strong>Lookalike links lie.</strong> @ tricks, punycode and bonus subdomains hide the real destination in plain sight.
          </span>
        </li>
        <li>
          <span className="p-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="8" cy="15.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M11.5 12 20 3.5M16.5 7l3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <strong>Weak passwords fall fast.</strong> Short or reused passwords are guessable offline, long before any alarm rings.
          </span>
        </li>
      </ul>
      <p className="problem-foot mono-mini">
        Context: phishing remains a top initial-access vector — Verizon DBIR · guidance: NIST SP 800-63B ·{' '}
        <a href="#research">sources below ↓</a>
      </p>
    </div>
  );
}

function AnatomyPanel() {
  return (
    <figure className="cyber-panel anatomy-panel reveal d3" style={{ height: '100%' }} aria-label="Anatomy of a phishing URL">
      <p className="panel-head">
        <span className="panel-tag">02</span>ANATOMY OF A PHISHING URL
      </p>
      <div
        className="phish-url"
        role="img"
        aria-label="A sample malicious URL with its deceptive parts highlighted: hxxps scheme, lookalike brand paypa1 with digit one, stacked subdomains, and the real domain at the end"
      >
        <span className="seg-scheme">http://</span>
        <span className="seg-brand">paypa1-secure</span>
        <span className="seg-dot">.</span>
        <span className="seg-sub">verify-account.update</span>
        <span className="seg-dot">.</span>
        <span className="seg-host">secure-center.example.net</span>
        <span className="seg-path">/login?session=verify</span>
      </div>
      <div className="anatomy-grid">
        <div className="anatomy-item">
          <span className="an-key">scheme</span>
          <span className="an-val">
            <code>http://</code> — no encryption. Padlocks are optional extras for attackers; HTTP is their default.
          </span>
        </div>
        <div className="anatomy-item">
          <span className="an-key">lookalike brand</span>
          <span className="an-val">
            <code>paypa1</code> — letter &quot;l&quot; swapped for digit &quot;1&quot;. Your eye skims past it; the filter doesn&apos;t have to.
          </span>
        </div>
        <div className="anatomy-item">
          <span className="an-key">stacked subdomains</span>
          <span className="an-val">
            <code>verify-account.update</code> — noise words that imitate official infrastructure. The real owner sits at the end.
          </span>
        </div>
        <div className="anatomy-item">
          <span className="an-key">actual destination</span>
          <span className="an-val">
            <code>secure-center.example.net</code> — everything before it is decoration. Only this part decides where you land.
          </span>
        </div>
      </div>
      <figcaption className="anatomy-caption mono-mini">
        {'// every colored trick above is checkable with plain string math — no magic, no “AI”'}
      </figcaption>
    </figure>
  );
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
export function HowItWorksSection() {
  const steps = [
    {
      step: 'STEP 1',
      title: 'Input stays on-device',
      body: 'The page parses your URL string or measures your password in JavaScript, in this tab. There is no server-side component — nothing to intercept, nothing to leak.',
      mono: 'fetch("/analyze") → never happens',
      delay: 'd1',
    },
    {
      step: 'STEP 2',
      title: 'Signals get scored',
      body: 'Links: scheme, IP hosts, label depth, length, @ placement, punycode, risky TLDs, brand-lookalikes and more are weighted into a 0–100 risk score → SAFE / SUSPICIOUS / RISKY. Passwords: length (NIST-weighted), entropy estimate, common-list match, sequences and repeats → five strength bands.',
      mono: 'heuristic_score = Σ signals − patterns',
      delay: 'd2',
    },
    {
      step: 'STEP 3',
      title: 'You get the reasoning',
      body: 'Every point on the score is explained in plain language — which signal fired, why it matters, and what to do next. No black boxes, no “trust the badge”.',
      mono: 'score → explanation → action',
      delay: 'd3',
    },
  ];
  return (
    <section className="section writeon-container" id="how" aria-labelledby="how-title">
      <p className="mono-kicker reveal">
        <span className="prompt">{'//'}</span> how_it_works
      </p>
      <h2 id="how-title" className="section-title reveal d1">
        Transparent, boring, <span className="grad-text">honest math</span>
      </h2>
      <div className="how-grid">
        {steps.map((s) => (
          <div key={s.step} className={`cyber-panel mini-panel reveal ${s.delay}`} style={{ height: '100%' }}>
            <p className="mini-step">{s.step}</p>
            <h3 className="mini-title">{s.title}</h3>
            <p className="mini-body" dangerouslySetInnerHTML={{ __html: s.body }} />
            <p className="mono-mini mini-mono">{s.mono}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   LIMITATIONS
   ============================================================ */
export function LimitationsSection() {
  const limits = [
    { no: '01', title: 'False positives happen', body: 'Long, parameter-heavy links from Google, GitHub or password managers can score “suspicious”. Context matters — when in doubt, navigate manually.', delay: 'd1' },
    { no: '02', title: 'False negatives happen', body: 'A freshly-registered phishing domain with clean strings can sail through lexical checks. This is a first line of defense, not the last.', delay: 'd2' },
    { no: '03', title: 'No live threat data', body: 'We do not query WHOIS, DNS, reputation feeds or blocklists, and we do not follow redirect chains. A real redirect count requires resolving hops — we don\'t hide the fact that we don\'t.', delay: 'd3' },
    { no: '04', title: 'HTTPS ≠ safe', body: 'Attackers happily buy certificates. HTTPS only proves encryption in transit — this tool tells you when a link uses HTTP, and never treats HTTPS as proof of legitimacy.', delay: 'd1' },
    { no: '05', title: 'Common-password list is finite', body: 'Our local list covers the most frequently cracked passwords (~160 entries). A password not on it isn\'t automatically strong — and our check is not a “have I been pwned” service.', delay: 'd2' },
    { no: '06', title: 'Meters are estimates', body: 'Strength meters guide, they don\'t guarantee. Research on password meters shows they shape behavior — treat this one as a well-informed hint, then use MFA everywhere you can.', delay: 'd3' },
  ];
  return (
    <section className="section writeon-container" id="limitations" aria-labelledby="limits-title">
      <p className="mono-kicker reveal">
        <span className="prompt">{'//'}</span> known_limits
      </p>
      <h2 id="limits-title" className="section-title reveal d1">
        What this <span className="grad-text">can&apos;t</span> see
      </h2>
      <div className="limits-grid">
        {limits.map((l) => (
          <div key={l.no} className={`limit-item reveal ${l.delay}`}>
            <span className="limit-no">{l.no}</span>
            <div>
              <h3>{l.title}</h3>
              <p>{l.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="dep-note reveal d2">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span>
          <strong>Dependency transparency:</strong> layout uses a bespoke CSS design system and webfonts. All
          analysis — both tools — works locally with zero network calls. “Fully offline” applies to the logic, not
          to the webfont CDN.
        </span>
      </p>
    </section>
  );
}

/* ============================================================
   RESEARCH & REFERENCES
   ============================================================ */
const REFS = [
  {
    num: '01',
    title: 'NIST SP 800-63B — Digital Identity Guidelines',
    href: 'https://pages.nist.gov/800-63-4/sp800-63b.html#abstract',
    desc: 'Why we reward ≥ 15-character passwords for single-factor sign-in, permit 8+ with MFA, prefer length over composition rules, and support password managers (paste allowed).',
    tag: 'STANDARD · PASSWORD POLICY',
    delay: 'd1',
  },
  {
    num: '02',
    title: 'USENIX Security 2012 — Password Strength Meters',
    href: 'https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/ur',
    desc: 'Egelman, Sotirakopoulos, Muslukhov, Beznosov & Herley — meters measurably steer users toward stronger, harder-to-crack passwords. Backs our five-band meter design and honest-tip wording.',
    tag: 'PEER-REVIEWED · METERS CHANGE BEHAVIOR',
    delay: 'd2',
  },
  {
    num: '03',
    title: 'A Review of Human- and Computer-Facing URL Phishing Features',
    href: 'https://www.research.ed.ac.uk/en/publications/a-review-of-human-and-computer-facing-url-phishing-features/',
    desc: 'University of Edinburgh — systematic review of the lexical URL features used to spot phishing (length, dots, hyphens, tokens, @). Directly informed our Link Checker signal weights.',
    tag: 'SYSTEMATIC REVIEW · FEATURE INVENTORY',
    delay: 'd3',
  },
  {
    num: '04',
    title: 'PhishAri: Automatic Realtime Phishing Detection on Twitter',
    href: 'https://arxiv.org/pdf/1301.6899',
    desc: 'Castillo, Mendoza & Poblete — phishing-URL characteristics and realtime detection in the wild. Informs our choice of lexical, inspectable-without-network indicators.',
    tag: 'RESEARCH PAPER · REALTIME DETECTION',
    delay: 'd1',
  },
  {
    num: '05',
    title: 'PhiSN: Phishing URL Detection Using Segmentation and NLP Features',
    href: 'https://www.jstage.jst.go.jp/article/ipsjjip/32/0/32_973/_pdf/-char/en',
    desc: 'Ishihara & Ogihara — segmentation + NLP features for phishing-URL classification, with strong published results. Their accuracy is theirs; Writeon uses transparent rules, not their model.',
    tag: 'RESEARCH PAPER · SEGMENTATION + NLP',
    delay: 'd2',
  },
];

export function ResearchSection() {
  return (
    <section className="section writeon-container" id="research" aria-labelledby="research-title">
      <p className="mono-kicker reveal">
        <span className="prompt">{'//'}</span> research_background
      </p>
      <h2 id="research-title" className="section-title reveal d1">
        Research &amp; <span className="grad-text">Technical References</span>
      </h2>
      <p className="section-sub reveal d2">
        Every heuristic in Writeon traces back to published research or official standards. Links open in a new tab.
        Note: published results describe <em>their</em> models — not our rule-based tool, which is a transparent
        teaching-grade approximation.
      </p>

      <div className="ref-grid">
        {REFS.map((r) => (
          <a
            key={r.num}
            className={`ref-card reveal ${r.delay}`}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ref-num">{r.num}</span>
            <span className="ref-body">
              <span className="ref-title">
                {r.title} <ExtIcon />
              </span>
              <span className="ref-desc">{r.desc}</span>
              <span className="ref-tag">{r.tag}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="tech-docs reveal d2" aria-label="Technology documentation">
        <p className="tech-docs-head mono-mini">{'// technology_documentation — implementation, not research'}</p>
        <a
          className="tech-doc-row"
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="tech-doc-num">06</span>
          <span className="tech-doc-body">
            <span className="ref-title">
              Next.js 16 Documentation — App Router, React Server & Client Components <ExtIcon />
            </span>
            <span className="ref-desc">
              The framework powering this rebuild — React 19, TypeScript, and a bespoke dark-glass CSS design system.
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}

function ExtIcon() {
  return (
    <svg className="ext" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-8.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 7H6.5A1.5 1.5 0 0 0 5 8.5v9A1.5 1.5 0 0 0 6.5 19h9a1.5 1.5 0 0 0 1.5-1.5V13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================================================
   FOOTER (sticky to bottom)
   ============================================================ */
export function Footer() {
  const year = 2026;
  return (
    <footer className="site-footer">
      <div className="writeon-container">
        <div className="footer-grid">
          <div className="footer-col">
            <p className="footer-brand">
              <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true">
                <path d="M24 3 42 11v13c0 12.5-7.4 19.6-18 22C13.4 43.6 6 36.5 6 24V11L24 3Z" fill="rgba(255,255,255,.10)" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" />
                <path d="M18.5 24.2l4.2 4.2 7.6-8.6" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              WRITE<em>ON</em>
            </p>
            <p className="footer-blurb">
              Two honest, client-side tools for the most common first-contact cyber mistakes. Built for the
              classroom, the lab and the demo stage.
            </p>
            <p className="mono-mini footer-mono">{'// warning signs, not a guarantee'}</p>
          </div>
          <div className="footer-col">
            <p className="footer-head">Runs everywhere</p>
            <ol className="run-steps">
              <li>Open Writeon in any modern browser — nothing to install.</li>
              <li>Both tools work without a server; everything is computed on your device.</li>
              <li>Webfonts load once from CDNs, like any modern site.</li>
            </ol>
            <p className="mono-mini footer-mono">{'// no account · no server · no tracking'}</p>
          </div>
          <div className="footer-col">
            <p className="footer-head">The team</p>
            <p className="team-names small">Parv · Prince · Zaid · Ajit</p>
            <p className="footer-blurb">
              First-year students · Hackathon project
              <br />
              PW IOI Noida · {year}
            </p>
            <a
              className="footer-top-link"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Back to top
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-bar">
          <p>© {year} Writeon — Parv, Prince, Zaid, Ajit. Rebuilt with Next.js · React · TypeScript.</p>
          <p className="footer-bar-right">
            <span className="ok-dot" />
            0 passwords logged · 0 links uploaded · 0 tracking
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   SCROLL PROGRESS BAR + BACK TO TOP
   ============================================================ */
export function ScrollChrome() {
  const progress = useScrollProgress();
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop((window.scrollY || 0) > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <button
        type="button"
        className={`back-to-top ${showTop ? 'show' : ''}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
