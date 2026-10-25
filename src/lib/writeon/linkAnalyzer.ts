/* ============================================================
   WRITEON — Link Checker engine
   Lexical URL heuristics → 0–100 risk score.
   Ported verbatim (logic-preserving) from the original JS build,
   now fully typed. Runs entirely client-side — no network calls.
   ============================================================ */

export type FindingLevel = 'bad' | 'warn' | 'info' | 'ok';

export interface Finding {
  level: FindingLevel;
  points: number;
  title: string;
  detail: string;
}

export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'RISKY';

export interface LinkAnalysis {
  verdict: Verdict;
  score: number;
  scheme: string;
  isIP: boolean;
  host: string;
  labels: number;
  port: string;
  registrable: string;
  assumedScheme: string | null;
  findings: Finding[];
  tips: string[];
}

export interface LinkError {
  error: true;
  message: string;
}

export type LinkResult = LinkAnalysis | LinkError | null;

const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

function truncateMiddle(str: string, max: number): string {
  if (str.length <= max) return str;
  const half = Math.floor((max - 1) / 2);
  return str.slice(0, half) + '…' + str.slice(str.length - half);
}

function splitHostLabels(hostname: string): string[] {
  const labels = hostname.split('.').filter(Boolean);
  if (labels.length === 0) return ['unknown'];
  return labels;
}

function levenshtein(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return Math.max(m, n);
  const dp = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function normaliseHomoglyphs(s: string): string {
  return s
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a')
    .replace(/vv/g, 'w');
}

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'ow.ly',
  'rebrand.ly', 'shorturl.at', 'rb.gy', 'tiny.cc', 'buff.ly', 't.ly', 's.id',
]);

const RISKY_TLDS = new Set([
  'zip', 'mov', 'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'country',
  'stream', 'download', 'racing', 'win', 'bid', 'loan', 'work', 'click',
  'link', 'rest', 'fit', 'cam', 'quest', 'bond', 'cyou', 'sbs', 'cfd',
]);

const IMPERSONATED_BRANDS = [
  'paypal', 'google', 'apple', 'microsoft', 'amazon', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'telegram', 'linkedin', 'twitter', 'youtube',
  'outlook', 'office365', 'dropbox', 'coinbase', 'binance', 'chase',
  'wellsfargo', 'bankofamerica', 'citibank', 'hsbc', 'barclays', 'sbi',
  'hdfc', 'icici', 'axisbank', 'paytm', 'phonepe', 'razorpay', 'flipkart',
  'snapchat', 'tiktok', 'steam', 'roblox', 'yahoo', 'gmail',
];

const TWO_PART_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'co.in', 'org.in', 'net.in',
  'com.au', 'com.br', 'com.mx', 'com.sg', 'co.jp', 'com.cn', 'com.hk',
  'com.tr', 'com.pk', 'com.np', 'com.bd', 'com.my', 'co.za', 'com.ng',
  'com.ph', 'com.vn', 'com.sa',
]);

const KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'secure', 'account', 'update',
  'confirm', 'bank', 'wallet', 'password', 'credential', 'invoice', 'pay',
  'billing', 'refund', 'suspended', 'locked', 'kyc', 'prize', 'gift', 'bonus', 'free',
];

export function analyzeURL(rawInput: string): LinkResult {
  const findings: Finding[] = [];
  const tips: string[] = [];
  let risk = 0;
  const add = (level: FindingLevel, points: number, title: string, detail: string) => {
    findings.push({ level, points, title, detail });
    risk += points;
  };

  let input = (rawInput || '').trim();
  if (!input) return null;

  let assumedScheme: string | null = null;
  if (!SCHEME_RE.test(input) && /^[\w-]+(\.[\w-]+)+/.test(input)) {
    assumedScheme = 'https';
    input = 'https://' + input;
  }

  if (/^(javascript|data|vbscript|file|about):/i.test(input)) {
    return {
      verdict: 'RISKY',
      score: 100,
      scheme: input.split(':')[0].toLowerCase(),
      isIP: false,
      host: '—',
      labels: 0,
      port: '—',
      registrable: '—',
      assumedScheme: null,
      findings: [
        {
          level: 'bad',
          points: 100,
          title: 'Executable/native scheme',
          detail: `“${input.split(':')[0].toLowerCase()}:” links run code or read local files in some contexts. Never paste links like this from messages or emails.`,
        },
      ],
      tips: [
        'Delete the message this link came from.',
        'Never copy-paste javascript: or data: URLs.',
      ],
    };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return {
      error: true,
      message:
        'That doesn’t parse as a valid URL. Check for spaces, missing dots, or stray characters — then try again.',
    };
  }

  const scheme = url.protocol.replace(':', '').toLowerCase();
  const hostname = (url.hostname || '').toLowerCase();
  const labels = splitHostLabels(hostname);
  const path = url.pathname || '/';
  const fullForLength = url.href;
  const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');

  if (!hostname) {
    return {
      error: true,
      message:
        'No hostname found in that link. Paste the full address, e.g. https://example.com/page.',
    };
  }
  const hasUnicodeHost = /[^\x00-\x7F]/.test(hostname) || hostname.includes('xn--');

  // 1 · scheme
  if (scheme === 'http') {
    add('bad', 26, 'Plain HTTP — no encryption', 'Anything you type after clicking can be read or altered in transit. HTTP is never required for a legitimate login page — treat it as suspicious by default.');
    tips.push('Never enter credentials on an http:// page. Look for https:// and a padlock you trust.');
  } else if (scheme === 'https') {
    add('ok', 0, 'Uses HTTPS', 'Good baseline — but HTTPS only encrypts the connection; it does NOT prove the site is legitimate. Phishing sites use certificates too.');
  } else {
    add('warn', 12, `Unusual scheme “${scheme}:”`, 'Not a standard web scheme. Double-check what this link actually does before opening it.');
  }

  // 2 · length
  const len = fullForLength.length;
  if (len > 100) {
    const pts = len > 120 ? 20 : 12;
    add(len > 120 ? 'bad' : 'warn', pts, `Very long URL (${len} chars)`, 'Long URLs bury the real destination inside tracking parameters and filler tokens. Legitimate services can be long-lived, but this much padding is a classic phishing tell.');
    tips.push('Copy the link into this tool on a computer, then compare the visible host with the site it claims to be.');
  } else if (len > 74) {
    add('info', 6, `Length ${len} chars — some padding`, 'Longer than typical, but not damning. Check the host carefully.');
  } else {
    add('ok', 0, `Length ${len} chars`, 'Compact URL — easier to eyeball honestly.');
  }

  // 3 · host structure
  const isPrivateish = TWO_PART_SUFFIXES.has(labels.slice(-2).join('.'));
  const suffixLen = isPrivateish ? 2 : 1;
  const registrable = labels.slice(-(suffixLen + 1)).join('.');
  const subdomainLabels = labels.slice(0, labels.length - suffixLen - 1);

  if (isIP) {
    add('bad', 28, 'IP-address host', `The link points at a raw IP (${hostname}) instead of a domain. Brand-impersonating phishing kits and throwaway command servers often live on bare IPs.`);
    tips.push('Treat bare-IP links that ask for logins or payments as hostile until proven otherwise.');
  } else {
    if (subdomainLabels.length >= 3) {
      add('bad', 22, `${subdomainLabels.length} stacked subdomains`, `Everything before “${registrable}” is decoration chosen by the link's owner. Stacked subdomains mimic official-looking infrastructure (e.g. secure.login.${registrable}).`);
      tips.push(`Ignore everything before “${registrable}” — that suffix is the real owner of this link.`);
    } else if (subdomainLabels.length === 2) {
      add('warn', 10, 'Two subdomain labels', `“${subdomainLabels.join('.')}” precede “${registrable}”. Multiple levels are often used to impersonate security or account sub-portals.`);
    }
    const dotCount = labels.length - 1;
    if (dotCount >= 5) {
      add('bad', 14, `${dotCount} dots in the hostname`, 'Deep hostname nesting is strongly associated with phishing infrastructure that hides behind many fake levels.');
    } else if (dotCount === 4) {
      add('warn', 6, 'Four dots in the hostname', 'More nesting than usual — inspect the rightmost two labels before trusting it.');
    }
    const hyphens = (registrable.match(/-/g) || []).length;
    if (hyphens >= 3) {
      add('bad', 12, `${hyphens} hyphens in domain`, 'Heavy hyphenation (“secure-account-verify-login.com”) is a signature of keyword-stuffed disposable phishing domains.');
    } else if (hyphens >= 1) {
      add('info', 5, 'Hyphen in domain', 'A single hyphen is common and innocent — a weak signal on its own.');
    }
    const longestLabel = labels.reduce((m, l) => Math.max(m, l.length), 0);
    if (longestLabel > 22) {
      add('warn', 8, `A ${longestLabel}-character hostname label`, 'Extremely long labels often pack random strings or base64-ish blobs used by malware campaigns.');
    }
  }

  // 4 · '@' position — the classic userinfo trick
  const atIndex = input.indexOf('@');
  if (atIndex !== -1) {
    const beforeAt = input.slice(0, atIndex);
    const inHostPart = /^[a-z][a-z0-9+.-]*:\/\/[^/]*$/i.test(beforeAt);
    if (inHostPart) {
      add('bad', 24, '“@” hides the real host', `Everything before “@” is userinfo — the browser discards it as credentials. The actual destination is “${hostname}”, not whatever appears in front of the “@”.`);
      tips.push('When you see “@” before the domain, read only the text AFTER it — that is where the link really goes.');
    } else {
      add('info', 2, '“@” inside the path', 'The “@” is in the path/query, not the authority — a weak signal, likely a mention or email-like parameter.');
    }
  }

  // 5 · credentials-in-URL
  if (url.username || url.password) {
    add('warn', 8, 'Credentials embedded in the URL', 'http://user:pass@host is legal but almost never legitimate in a link someone sent you.');
  }

  // 6 · punycode / IDN
  if (hasUnicodeHost) {
    add('bad', 26, 'Punycode / internationalized host', '“xn--” labels mean the real characters are non-Latin — the #1 technique for homograph attacks (аpple.com with Cyrillic “а”). Rendered glyphs lie to your eyes.');
    tips.push('If a link shows “xn--”, expand it with a punycode decoder before trusting it.');
  }

  // 7 · suspicious keywords (weak, contextual)
  const keywordSource = `${hostname}${path}`.toLowerCase();
  const hits = KEYWORDS.filter((k) => keywordSource.includes(k));
  if (hits.length >= 3) {
    add('warn', 12, `Keyword-stuffed URL (${hits.slice(0, 5).join(', ')})`, '“login · verify · secure · account”-type words are deliberately stacked to feel urgent. Genuine services rarely shout this hard in their own URLs.');
  } else if (hits.length > 0) {
    add('info', hits.length * 3, `Urgency keywords: ${hits.join(', ')}`, 'Security-flavored words are weak contextual signals — a real bank uses “login” too. They only matter stacked together.');
  }

  // 8 · brand lookalikes & typosquats
  if (!isIP) {
    const normLabels = labels.map(normaliseHomoglyphs);
    const allHostHit = normLabels.some((l) => IMPERSONATED_BRANDS.some((b) => l.includes(b)));
    const core = normLabels[Math.max(0, labels.length - suffixLen - 1)] || normaliseHomoglyphs(labels[0] || '');
    const rawCore = (labels[Math.max(0, labels.length - suffixLen - 1)] || '').toLowerCase();
    const registrableIsExactBrand = IMPERSONATED_BRANDS.includes(rawCore);

    let tokenBrand: string | null = null;
    let tokenDist = Infinity;
    for (const label of normLabels) {
      for (const token of label.split(/-+/).filter(Boolean)) {
        for (const brand of IMPERSONATED_BRANDS) {
          if (brand.length < 5) continue;
          const d = levenshtein(token, brand);
          if (d < tokenDist) {
            tokenDist = d;
            tokenBrand = brand;
          }
        }
      }
    }

    let brandPts = 0;
    let brandTitle = '';
    let brandDetail = '';
    if (allHostHit && !registrableIsExactBrand) {
      const brand = IMPERSONATED_BRANDS.find((b) => normLabels.some((l) => l.includes(b))) || '';
      brandPts = 14;
      brandTitle = `Host borrows brand “${brand}”`;
      brandDetail = `A label in this URL contains the brand “${brand}”, but the registrable domain “${registrable}” is not ${brand}'s own domain — the compound-squat pattern phishers favour.`;
    } else if (!registrableIsExactBrand && tokenBrand && tokenDist > 0 && tokenDist <= 2) {
      brandPts = tokenDist === 1 ? 26 : 16;
      brandTitle = `Token is ${tokenDist} edit${tokenDist > 1 ? 's' : ''} from “${tokenBrand}”`;
      brandDetail = `After undoing digit/letter swaps, a hyphenated segment sits ${tokenDist} characters away from “${tokenBrand}”. One swapped glyph is all a lookalike domain needs.`;
    } else if (!registrableIsExactBrand) {
      const coreHit = IMPERSONATED_BRANDS.find(
        (b) => levenshtein(core, b) > 0 && levenshtein(core, b) <= 2 && b.length >= 5,
      );
      if (coreHit) {
        const d = levenshtein(core, coreHit);
        brandPts = d === 1 ? 26 : 16;
        brandTitle = `“${rawCore}” is ${d} edit${d > 1 ? 's' : ''} from “${coreHit}”`;
        brandDetail = `The registrable label is a near-miss of “${coreHit}” (edit distance ${d}) — classic typosquat / homoglyph fare.`;
      }
    }
    if (brandPts > 0) {
      add('bad', brandPts, brandTitle, brandDetail);
      tips.push('Type the brand’s address yourself instead of following any link that resembles it.');
    }

    const pathTokens = normaliseHomoglyphs(path).split(/[^a-z0-9]+/).filter((t) => t.length >= 5);
    const pathBrand = IMPERSONATED_BRANDS.find((b) => b.length >= 5 && pathTokens.includes(b));
    if (pathBrand && !registrableIsExactBrand) {
      add('warn', 8, `Brand “${pathBrand}” in the path`, 'The host is not the brand’s, but the path invokes its name — designed to pass a quick eyeball while staying on unrelated infrastructure.');
    }
  }

  // 9 · TLD risk
  const tld = labels[labels.length - 1] || '';
  if (RISKY_TLDS.has(tld)) {
    add('warn', 10, `High-abuse TLD “.${tld}”`, 'This TLD is cheap, fast to rotate, and statistically over-represented in phishing campaigns. Weak signal alone — but it stacks.');
  }

  // 10 · shorteners
  if (SHORTENERS.has(registrable)) {
    add('warn', 10, 'URL shortener', 'Shorteners erase the destination. The service is neutral — but a stranger’s shortened link is a sealed envelope; you cannot pre-read it.');
    tips.push('Expand shorteners with a preview service you trust, or ask the sender to paste the full URL.');
  }

  // 11 · non-standard port
  if (url.port && !['80', '443', '8080', '8443'].includes(url.port)) {
    add('warn', 8, `Non-standard port :${url.port}`, 'Legitimate sites rarely make you connect to odd ports. Temporary phishing kits spin up custom ports constantly.');
  }

  // 12 · encoding & control tricks
  const encodedCount = (url.href.match(/%[0-9a-f]{2}/gi) || []).length;
  if (encodedCount > 4) {
    add('warn', 6, `${encodedCount} percent-encoded characters`, 'Heavy encoding hides the real path/query text from quick inspection — often used to smuggle @ or / inside a “friendly-looking” URL.');
  }
  if (/\\/.test(input) || input.includes('%5c') || input.includes('%5C')) {
    add('warn', 8, 'Backslash tricks', 'Backslashes (or %5C) make one parser read “foo\\@bar” as a path and another as a host separator — a known URL-confusion primitive.');
  }

  // 13 · query noise
  const qLen = (url.search || '').length;
  if (qLen > 120) {
    add('info', 5, `Very long query string (${qLen} chars)`, 'Bulk tracking parameters are common in marketing links — but they also smuggle referral IDs and session tokens past a quick glance.');
  }

  // 14 · positives worth naming
  if (scheme === 'https' && !isIP && labels.length <= 3 && len <= 74 && hits.length === 0) {
    add('ok', 0, 'Clean-looking structure', 'Short, HTTPS, unremarkable host structure. That is genuinely a good sign — remember it is still not proof of safety.');
  }

  risk = Math.max(0, Math.min(100, Math.round(risk)));

  const seenTip = new Set<string>();
  const uniqueTips = tips.filter((t) => !seenTip.has(t) && seenTip.add(t));
  if (uniqueTips.length === 0) {
    if (risk === 0) {
      uniqueTips.push('No heuristic fired — still double-check the sender and the context before logging in or paying.');
    } else {
      uniqueTips.push('Pause before clicking: open the official app/site yourself and navigate to the same page instead.');
      uniqueTips.push('Never type passwords or card numbers into a page you reached from an unexpected message.');
    }
  }
  if (risk >= 35) {
    uniqueTips.push('If you already clicked, change any password you typed on that page immediately — from a trusted device.');
  }

  const verdict: Verdict = risk <= 24 ? 'SAFE' : risk <= 59 ? 'SUSPICIOUS' : 'RISKY';

  return {
    verdict,
    score: risk,
    scheme,
    isIP,
    host: hostname,
    labels: labels.length,
    port: url.port || (scheme === 'https' ? '443 (default)' : scheme === 'http' ? '80 (default)' : '—'),
    registrable,
    assumedScheme,
    findings,
    tips: uniqueTips,
  };
}

export function truncateMiddleExport(str: string, max: number): string {
  return truncateMiddle(str, max);
}
