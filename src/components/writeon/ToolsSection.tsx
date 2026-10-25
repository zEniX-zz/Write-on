'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { analyzeURL, truncateMiddleExport, type LinkResult, type FindingLevel, type LinkAnalysis } from '@/lib/writeon/linkAnalyzer';
import { evaluatePassword, generatePassphrase, type PasswordEvaluation } from '@/lib/writeon/passwordChecker';
import { usePrefersReducedMotion, useCountUp } from '@/hooks/writeon/scrollFx';

const SAMPLES = [
  { label: 'Trusted', value: 'https://www.wikipedia.org/wiki/Phishing' },
  { label: 'Suspicious', value: 'https://secure-login.verify-account.tk/update/billing' },
  { label: 'High-risk', value: 'http://login.verify-account-update.secure-center.example.net/confirm' },
];

const FINDING_ORDER: Record<FindingLevel, number> = { bad: 0, warn: 1, info: 2, ok: 3 };

/* ============================================================
   TOOL 1 — LINK CHECKER
   ============================================================ */
function FindingIcon({ level }: { level: FindingLevel }) {
  if (level === 'bad') {
    return (
      <svg className="f-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path d="M12 3 2.5 20h19L12 3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 10v4.4M12 17.4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (level === 'ok') {
    return (
      <svg className="f-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path d="M9 12.5l2 2 4.5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  // warn + info share the circle-with-i shape
  return (
    <svg className="f-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LinkChecker() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const run = useCallback((raw: string) => {
    const v = raw.trim();
    if (!v) {
      setError('Please paste a link first — e.g. https://example.com.');
      setResult(null);
      return;
    }
    setError(null);
    const r = analyzeURL(v);
    if (r && 'error' in r) {
      setError(r.message);
      setResult(null);
      return;
    }
    setResult(r);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(value);
    inputRef.current?.focus();
  };

  const onSample = (sample: string) => {
    setValue(sample);
    setError(null);
    const r = analyzeURL(sample);
    if (r && !('error' in r)) setResult(r);
  };

  const onReset = () => {
    setValue('');
    setError(null);
    setResult(null);
    inputRef.current?.focus();
  };

  // Narrow to a real analysis (not error, not null) once, cleanly.
  const analysis: LinkAnalysis | null =
    result && !('error' in result) ? (result as LinkAnalysis) : null;

  const score = analysis ? analysis.score : 0;
  const animatedScore = useCountUp(score, 700, reduced);

  const sortedFindings = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.findings].sort((a, b) => FINDING_ORDER[a.level] - FINDING_ORDER[b.level]);
  }, [analysis]);

  const findingCount = sortedFindings.filter((f) => f.level === 'bad' || f.level === 'warn').length;

  const verdictClass = analysis
    ? analysis.verdict === 'SAFE'
      ? 'v-safe'
      : analysis.verdict === 'SUSPICIOUS'
        ? 'v-suspicious'
        : 'v-risky'
    : '';

  return (
    <article className="cyber-panel tool-card" id="tool-link" aria-labelledby="tool-link-title">
      <div className="tool-head">
        <span className="tool-icon">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M10 14a5 5 0 0 0 7.1 0l2.4-2.4a5 5 0 0 0-7.1-7.1l-1.3 1.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14 10a5 5 0 0 0-7.1 0l-2.4 2.4a5 5 0 0 0 7.1 7.1l1.3-1.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="tool-tag mono-line">
            <span className="prompt">&gt;</span> scan_link()
          </p>
          <h3 id="tool-link-title" className="tool-title">Link Checker</h3>
        </div>
        <span className="tool-index">01</span>
      </div>
      <p className="tool-desc">
        Paste any URL. We break it into scheme, host, subdomains and path, then score 20+ lexical warning signs —
        the same string-level cues phishing researchers measure. <strong>Warning signs, not a guarantee.</strong>
      </p>

      <form onSubmit={onSubmit} noValidate>
        <label className="field-label" htmlFor="linkInput">Link to inspect</label>
        <div className="input-shell">
          <svg className="input-icon" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <path d="M10 14a5 5 0 0 0 7.1 0l2.4-2.4a5 5 0 0 0-7.1-7.1l-1.3 1.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14 10a5 5 0 0 0-7.1 0l-2.4 2.4a5 5 0 0 0 7.1 7.1l1.3-1.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="cyber-input"
            id="linkInput"
            name="link"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://example.com/login-verify…"
            aria-describedby="linkHint linkError"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            ref={inputRef}
          />
        </div>
        <p className="field-hint" id="linkHint">
          No scheme? We&apos;ll assume <code>https://</code> — and say so in the report.
        </p>
        {error && (
          <p className="field-error" id="linkError" role="alert">
            {error}
          </p>
        )}

        <div className="try-row" aria-label="Try a sample link">
          <span className="try-label">Try:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              className="sample-chip"
              onClick={() => onSample(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="btn-row">
          <button type="submit" className="btn-cyber flex-grow-1" id="analyzeBtn">
            Analyze Link
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="btn-ghost-icon" id="resetLinkBtn" aria-label="Clear link and results" onClick={onReset}>
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
              <path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l1.2 12a2 2 0 0 0 2 1.9h4.6a2 2 0 0 0 2-1.9L17.5 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Reset
          </button>
        </div>
      </form>

      {analysis && (
        <div className="tool-result" aria-live="polite">
          <div className="verdict-row">
            <span className={`verdict-badge ${verdictClass}`}>
              {analysis.verdict}
            </span>
            <div className="gauge-wrap" aria-hidden="true">
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: `${score}%` }} />
              </div>
              <div className="gauge-meta">
                <span className="gauge-num">{animatedScore}</span>
                <span className="gauge-max">/100 risk</span>
              </div>
            </div>
          </div>

          <div className="dest-chips">
            <span className="dest-chip">Scheme <b>{analysis.scheme.toUpperCase()}{analysis.assumedScheme ? ' (assumed)' : ''}</b></span>
            <span className="dest-chip">Host <b>{truncateMiddleExport(analysis.host, 44)}</b></span>
            <span className="dest-chip">Labels <b>{analysis.labels}</b></span>
            <span className="dest-chip">Port <b>{analysis.port}</b></span>
          </div>

          <p className="findings-head mono-mini">
            {'// threat_analysis — '}{findingCount}{' signals flagged'}
          </p>
          <ul className="findings-list">
            {sortedFindings.map((f, i) => (
              <li key={i} className={`finding f-${f.level}`}>
                <FindingIcon level={f.level} />
                <span>
                  <b>{f.title}.</b> {f.detail}
                </span>
                <span className="f-pts">{f.points > 0 ? `+${f.points}` : '0'}</span>
              </li>
            ))}
          </ul>

          <p className="findings-head mono-mini">{'// recommended_actions'}</p>
          <ul className="tips-list">
            {analysis.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <p className="warn-strip">
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path d="M12 3 2.5 20h19L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 10v4.2M12 17.2h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>
              <strong>Warning signs, not a guarantee.</strong> Rule-based, client-side heuristics — not live threat
              intelligence. A clean score ≠ safe; a bad score ≠ certain.
            </span>
          </p>
        </div>
      )}
    </article>
  );
}

/* ============================================================
   TOOL 2 — PASSWORD CHECKER
   ============================================================ */
const CHECKLIST = [
  { key: 'len8', label: '≥ 8 characters', note: '(ok with MFA)' },
  { key: 'len15', label: '≥ 15 characters', note: '(NIST single-factor)' },
  { key: 'common', label: 'Not on common-password lists', note: '' },
  { key: 'pattern', label: 'No obvious sequences or repeats', note: '' },
  { key: 'variety', label: 'Good length & entropy headroom', note: '' },
] as const;

function PasswordChecker() {
  const [pw, setPw] = useState('');
  const [visible, setVisible] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const evaluation: PasswordEvaluation = useMemo(() => evaluatePassword(pw), [pw]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const toggleVisible = () => {
    setVisible((v) => !v);
    inputRef.current?.focus();
  };
  const clearPw = () => {
    setPw('');
    setVisible(false);
    inputRef.current?.focus();
  };
  const suggest = () => {
    setPw(generatePassphrase());
    setVisible(true);
    inputRef.current?.focus();
  };
  const copy = async () => {
    if (!pw) {
      setCopyLabel('Nothing to copy');
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyLabel('Copy'), 1400);
      return;
    }
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pw);
        ok = true;
      }
    } catch {
      /* fall through */
    }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = pw;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    setCopyLabel(ok ? 'Copied ✓' : 'Copy blocked');
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyLabel('Copy'), 1600);
  };

  const band = evaluation.band;

  return (
    <article className="cyber-panel tool-card" id="tool-password" aria-labelledby="tool-password-title">
      <div className="tool-head">
        <span className="tool-icon">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <rect x="4.5" y="10" width="15" height="10" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10V7.8a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="15" r="1.4" fill="currentColor" />
          </svg>
        </span>
        <div>
          <p className="tool-tag mono-line">
            <span className="prompt">&gt;</span> check_pass()
          </p>
          <h3 id="tool-password-title" className="tool-title">Password Checker</h3>
        </div>
        <span className="tool-index">02</span>
      </div>
      <p className="tool-desc">
        Live, keystroke-by-keystroke strength analysis. NIST SP 800-63B says length beats complexity — so we reward
        long, memorable passphrases, not symbol soup. <strong>Estimate, not a guarantee.</strong>
      </p>

      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <label className="field-label" htmlFor="passInput">Password or passphrase</label>
        <div className="input-shell pass-shell">
          <svg className="input-icon" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <rect x="4.5" y="10" width="15" height="10" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10V7.8a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <input
            type={visible ? 'text' : 'password'}
            className="cyber-input"
            id="passInput"
            name="pass"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Type or paste a password…"
            aria-describedby="passHint passPrivacy"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            ref={inputRef}
          />
          <button
            type="button"
            className="icon-toggle"
            onClick={toggleVisible}
            aria-pressed={visible}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5.5 0 9.5 6 9.5 6a17.6 17.6 0 0 1-2.6 3.8M6.6 8.6A17 17 0 0 0 2.5 12S6.5 18 12 18a9.3 9.3 0 0 0 3-.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M2.5 12S6.5 5.8 12 5.8 21.5 12 21.5 12 17.5 18.2 12 18.2 2.5 12 2.5 12Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            )}
          </button>
          <button type="button" className="icon-toggle" onClick={clearPw} aria-label="Clear password">
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="field-hint" id="passHint">
          {evaluation.len} characters · estimated entropy <b>{evaluation.entropy}</b> bits
        </p>

        <div className="pass-meter-row" role="group" aria-label="Password strength meter">
          <div className={`pass-meter ${band ? `s${band}` : ''}`} aria-hidden="true">
            <span className="seg" />
            <span className="seg" />
            <span className="seg" />
            <span className="seg" />
            <span className="seg" />
          </div>
          <p className={`pass-label ${band ? `l${band}` : ''}`} role="status" aria-live="polite">
            {evaluation.label}
          </p>
        </div>
        <p className="crack-line mono-mini">
          rough offline-crack estimate: <b>{evaluation.crack}</b>
        </p>

        <ul className="checklist" aria-label="Strength indicators">
          {CHECKLIST.map((c) => (
            <li key={c.key} className={evaluation.checks[c.key] ? 'on' : ''}>
              <span className="ck-box" />
              {c.label} {c.note && <em>{c.note}</em>}
            </li>
          ))}
        </ul>

        <p className="findings-head mono-mini">{'// improvement_tips'}</p>
        <ul className="tips-list">
          {evaluation.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <div className="pass-actions">
          <button type="button" className="btn-ghost btn-sm" onClick={suggest}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path d="M12 3l1.7 4.6L18.5 9l-4.8 1.4L12 15l-1.7-4.6L5.5 9l4.8-1.4L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M19 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            Suggest a passphrase
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={copy}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <rect x="8.5" y="8.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M5.5 15.5v-9a2 2 0 0 1 2-2h9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            {copyLabel}
          </button>
        </div>
        <p className="mono-mini gen-note">
          passphrases are generated locally with <code>crypto.getRandomValues()</code> — nothing is sent anywhere
        </p>

        <p className="privacy-strip" id="passPrivacy">
          <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <path d="M12 3l8 3.5V12c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6.5L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9.5 12.2l1.9 1.9 3.4-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            <strong>Private by construction.</strong> Your password never leaves this page — no transmission, no
            logging, no localStorage, no cookies, no analytics, no external password APIs. Analysis is local
            JavaScript math, and this page&apos;s own code is inspectable.
          </span>
        </p>
        <p className="nist-note">
          <strong>NIST SP 800-63B:</strong> use ≥ 15 characters when a password is your only sign-in factor; 8+ may
          be acceptable <em>with</em> MFA. Long, memorable passphrases beat short symbol soup — and length rules beat
          composition rules.
        </p>
      </form>
    </article>
  );
}

export function ToolsSection() {
  return (
    <section className="section writeon-container" id="tools" aria-labelledby="tools-title">
      <p className="mono-kicker reveal">
        <span className="prompt">{'//'}</span> interactive_tools
      </p>
      <h2 id="tools-title" className="section-title reveal d1">
        Two tools. <span className="grad-text">Zero excuses.</span>
      </h2>
      <p className="section-sub reveal d2">
        Both tools run locally in this page. Your link is parsed, never sent. Your password is measured, never stored.
      </p>

      <div className="tools-grid">
        <LinkChecker />
        <PasswordChecker />
      </div>
    </section>
  );
}
