/* ============================================================
   WRITEON — Password Checker engine
   NIST SP 800-63B-aligned local estimate.
   Ported verbatim (logic-preserving) from the original JS build,
   now fully typed. Runs entirely client-side — no network calls.
   ============================================================ */

export interface PasswordChecks {
  len8: boolean;
  len15: boolean;
  common: boolean;
  pattern: boolean;
  variety: boolean;
}

export interface PasswordEvaluation {
  points: number;
  band: number; // 0 = awaiting, 1..5 = very weak → very strong
  label: string;
  checks: PasswordChecks;
  tips: string[];
  entropy: number;
  crack: string;
  len: number;
}

// ~160 of the most-frequently-cracked passwords — finite, local, honest
const COMMON_PASSWORDS = new Set([
  '123456', 'password', '123456789', '12345678', '12345', '1234567', 'qwerty',
  'abc123', 'football', 'monkey', 'letmein', 'dragon', '111111', 'baseball',
  'iloveyou', 'trustno1', 'sunshine', 'master', '123123', 'welcome', 'shadow',
  'ashley', 'michael', 'ninja', 'mustang', 'password1', '1234567890', 'qwerty123',
  '000000', 'superman', 'hunter', 'computer', 'michelle', 'daniel', 'andrew',
  'charlie', 'thomas', 'ranger', 'buster', 'soccer', 'tigger', 'jordan', 'robert',
  'matthew', 'starwars', 'whatever', 'freedom', '123abc', 'qazwsx', '121212',
  'asdfgh', 'zxcvbn', '1q2w3e4r', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'p@55word',
  'admin', 'administrator', 'login', 'pass', 'test', 'guest', 'hello', 'lovely',
  'bailey', 'access', 'thunder', '123321', '654321', 'joshua', 'killer', 'george',
  'asshole', 'fuckyou', 'trustme', 'nicole', 'jessica', 'pepper', 'ginger',
  'cookie', 'robert1', 'soccer1', 'cowboys', 'lakers', 'yankees', 'chelsea',
  'arsenal', 'liverpool', 'barcelona', 'manchester', 'pokemon', 'princess',
  'orange', 'banana', 'summer', 'winter', 'autumn', 'spring', 'abcdefg',
  'abcd1234', 'qwertz', 'q1w2e3r4', 'zaq12wsx', 'pass@123', 'password123',
  'abc@123', 'welcome1', 'admin123', 'changeme', 'iloveyou1', 'princess1',
  'pokemon1', 'charlie1', 'qwerty1', '1234qwer', 'qwer1234', '1qaz2wsx',
  'zaq123', 'silver', 'golden', 'diamond', 'phoenix', 'matrix', 'secret',
  'qwert', 'asdf', 'zxcv', 'aaaaaa', '11111111', '1234', 'pass1', 'root',
  'toor', 'admin1', 'system', 'oracle', 'support', 'user', 'default', 'temp123',
  'india@123', 'india123', 'password@123', 'sharma', 'delhi', 'mumbai',
  'lovely123', 'arsenal1', 'chelsea1', 'liverpool1', 'spiderman', 'batman',
  'superman1', 'ironman', 'hulk', 'thor', 'captain', 'america', 'winterfell',
  'dracarys', 'targaryen', 'harrypotter', 'hermione', 'dumbledore', 'zelda',
  'mario', 'luigi', 'yoshi', 'asdfg', 'qazwsxedc', '159753', '147258369',
  '987654321', '111222333',
]);

function isCommonish(pw: string): { hit: boolean; what?: string } {
  const p = pw.toLowerCase().trim();
  if (COMMON_PASSWORDS.has(p)) return { hit: true, what: p };
  const stripped = p.replace(/[\d!@#$%^&*._-]{1,3}$/, '');
  if (stripped !== p && stripped.length >= 4 && COMMON_PASSWORDS.has(stripped)) {
    return { hit: true, what: stripped };
  }
  return { hit: false };
}

function entropyBits(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  if (/[^\x00-\x7F]/.test(pw)) pool += 64;
  if (pool === 0) return 0;
  return Math.round(pw.length * Math.log2(pool));
}

const SEQUENCES = [
  'abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiop[]', 'asdfghjkl;',
  'zxcvbnm,.', '1qaz2wsx3edc', 'qazwsx', '147258369', 'qweasdzxc', '!@#$%^&*()',
];
const REV_SEQUENCES = SEQUENCES.map((s) => [...s].reverse().join(''));

function sequenceAnalysis(p: string): { longest: number; coverage: number } {
  const claimed = new Array<boolean>(p.length).fill(false);
  let longest = 0;
  let covered = 0;
  const candidates: Array<[number, number]> = [];
  for (const seq of [...SEQUENCES, ...REV_SEQUENCES]) {
    for (let i = 0; i + 3 <= p.length; i++) {
      for (let len = 3; len <= Math.min(14, p.length - i); len++) {
        if (seq.includes(p.slice(i, i + len))) candidates.push([i, len]);
      }
    }
  }
  candidates.sort((a, b) => b[1] - a[1]);
  for (const [start, len] of candidates) {
    let free = true;
    for (let i = start; i < start + len; i++) {
      if (claimed[i]) {
        free = false;
        break;
      }
    }
    if (!free) continue;
    for (let i = start; i < start + len; i++) claimed[i] = true;
    covered += len;
    longest = Math.max(longest, len);
  }
  return { longest, coverage: p.length ? covered / p.length : 0 };
}

function longestSequenceRun(pw: string): number {
  return sequenceAnalysis(pw.toLowerCase()).longest;
}

function longestRepeat(pw: string): number {
  let best = 1;
  let cur = 1;
  for (let i = 1; i < pw.length; i++) {
    if (pw[i] === pw[i - 1]) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }
  const p = pw.toLowerCase();
  for (let block = 2; block <= 4; block++) {
    for (let i = 0; i + block * 2 <= p.length; i++) {
      const unit = p.slice(i, i + block);
      let count = 1;
      let j = i + block;
      while (p.slice(j, j + block) === unit) {
        count++;
        j += block;
      }
      if (count >= 3) best = Math.max(best, block * count);
    }
  }
  return best;
}

function humanizeSeconds(s: number): string {
  if (s < 1) return 'instantly';
  const units: Array<[number, string]> = [
    [31557600, 'years'],
    [2592000, 'months'],
    [86400, 'days'],
    [3600, 'hours'],
    [60, 'minutes'],
    [1, 'seconds'],
  ];
  for (const [sec, name] of units) {
    if (s >= sec) {
      const v = s / sec;
      const nice = v >= 100 ? Math.round(v).toLocaleString() : Math.round(v * 10) / 10;
      if (name === 'years' && v > 1e6) {
        if (v > 1e12) return 'heat-death of the universe';
        if (v > 1e9) return 'billions of years';
        if (v > 1e6) return 'millions of years';
      }
      return `~${nice} ${name}`;
    }
  }
  return 'instantly';
}

export function evaluatePassword(pw: string): PasswordEvaluation {
  const len = pw.length;
  const entropy = entropyBits(pw);
  const seqRun = longestSequenceRun(pw);
  const repeatRun = longestRepeat(pw);
  const common = isCommonish(pw);

  let points = 0;
  if (len === 0) points = 0;
  else if (len < 8) points = 8 + len * 2;
  else if (len < 12) points = 34 + (len - 8) * 4;
  else if (len < 15) points = 50 + (len - 12) * 7;
  else if (len < 20) points = 71 + (len - 15) * 6;
  else points = Math.min(100, 95 + (len - 19) * 1.5);

  points += Math.min(10, Math.max(0, (entropy - len * 3.5) * 0.25));

  if (common.hit) points -= 45;
  if (seqRun >= 5) points -= 14;
  else if (seqRun >= 3) points -= 6;
  if (repeatRun >= 6) points -= 14;
  else if (repeatRun >= 3) points -= 5;
  if (/^\d+$/.test(pw)) points -= 10;
  if (len > 0 && len < 5) points = Math.min(points, 8);
  if (/(19|20)\d{2}$/.test(pw)) points -= 4;

  const p = pw.toLowerCase();
  const seqCoverage = seqRun >= 3 && len > 0 ? seqRun / len : 0;
  const repeatCoverage = repeatRun >= 3 && len > 0 ? repeatRun / len : 0;
  const distinctChars = new Set(p).size;
  const singlePool = distinctChars <= 1 && len > 0;
  const seqStats = sequenceAnalysis(p);
  const totalSeqCoverage = seqStats.coverage;

  if (singlePool) {
    points = Math.min(points, 14);
  } else if (totalSeqCoverage >= 0.7) {
    points = Math.min(points, 22);
  } else if (totalSeqCoverage >= 0.45) {
    points = Math.min(points, 32);
  } else if (seqCoverage >= 0.6) {
    points = Math.min(points, 30);
  } else if (seqCoverage >= 0.4) {
    points = Math.min(points, 45);
  } else if (repeatCoverage >= 0.6) {
    points = Math.min(points, 30);
  } else if (repeatCoverage >= 0.4) {
    points = Math.min(points, 45);
  }

  points = Math.max(0, Math.min(100, Math.round(points)));

  let band: number;
  let label: string;
  if (len === 0) {
    band = 0;
    label = 'Awaiting input';
  } else if (points < 28) {
    band = 1;
    label = 'Very Weak';
  } else if (points < 48) {
    band = 2;
    label = 'Weak';
  } else if (points < 68) {
    band = 3;
    label = 'Fair';
  } else if (points < 86) {
    band = 4;
    label = 'Strong';
  } else {
    band = 5;
    label = 'Very Strong';
  }

  const checks: PasswordChecks = {
    len8: len >= 8,
    len15: len >= 15,
    common: len > 0 && !common.hit,
    pattern: len > 0 && seqRun < 3 && repeatRun < 3,
    variety: entropy >= 60 && len >= 12,
  };

  let crack = '—';
  if (common.hit) {
    crack = 'instantly — in common-password lists';
  } else if (len > 0) {
    const guesses = Math.pow(2, Math.min(entropy, 128)) / 2;
    crack = humanizeSeconds(guesses / 1e10);
  }

  const tips: string[] = [];
  if (len === 0) {
    tips.push('Start typing — analysis runs locally, keystroke by keystroke.');
  } else {
    if (common.hit) tips.push('Pick a completely different password — anything resembling a common one is effectively public.');
    if (len < 8) tips.push('Aim for at least 8 characters — the MFA-assisted floor in NIST SP 800-63B.');
    else if (len < 15) tips.push('Push to 15+ characters — NIST’s single-factor recommendation. Length is the cheapest security you can add.');
    if (seqRun >= 3) tips.push('Break up sequences — “qwerty”, “abc”, “123” are tried in the first second of any attack.');
    if (repeatRun >= 3) tips.push('Avoid runs of one repeated character or repeating blocks (abcabc).');
    if (/^\d+$/.test(pw)) tips.push('Add letters — numbers alone collapse your entropy.');
    if (tips.length === 0 && band >= 4) {
      tips.push('Excellent. Store it in a password manager and never reuse it anywhere else.');
      tips.push('This is exactly what a passphrase should look like — long, odd, and memorable to only you.');
    } else if (band === 3) {
      tips.push('Solid base. Add a few more words to hit passphrase territory (4+ random words).');
    }
    if (len >= 8 && len < 15) tips.push('Remember: 8 characters is only comfortable when MFA guards the same account.');
    if (tips.length < 2) tips.push('A random four-word passphrase (e.g. “violet-trombone-cafeteria-lantern”) beats “P@ssw0rd!” every time.');
  }

  return { points, band, label, checks, tips, entropy, crack, len };
}

// Local passphrase generator — crypto.getRandomValues, never leaves the page
const PASSPHRASE_WORDS = [
  'violet', 'trombone', 'cafeteria', 'lantern', 'harbor', 'marble', 'falcon',
  'willow', 'prism', 'copper', 'meadow', 'saffron', 'tundra', 'ember',
  'cascade', 'quartz', 'juniper', 'monsoon', 'compass', 'clover', 'onyx',
  'breeze', 'cedar', 'galaxy', 'nectar', 'anchor', 'opal', 'prairie', 'ridge',
  'summit', 'timber', 'umbra', 'velvet', 'walnut', 'xenon', 'yonder', 'zephyr',
  'aurora', 'cobalt', 'dune', 'eclipse', 'fjord', 'granite', 'halcyon',
  'indigo', 'jungle', 'kraken', 'lumen', 'mango', 'nebula', 'orchid', 'pebble',
  'quill', 'raven', 'sage', 'tidal', 'ultraviolet', 'vortex', 'whisper', 'yucca',
  'zircon', 'basil', 'cinder', 'dahlia', 'evergreen', 'flint', 'glacier',
  'horizon', 'ivory', 'jasmine',
];

function secureRandomIndex(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export function generatePassphrase(): string {
  const words: string[] = [];
  for (let i = 0; i < 4; i++) words.push(PASSPHRASE_WORDS[secureRandomIndex(PASSPHRASE_WORDS.length)]);
  const sep = ['-', '.', '_'][secureRandomIndex(3)];
  const num = 10 + secureRandomIndex(90);
  return `${words.join(sep)}${sep}${num}`;
}
