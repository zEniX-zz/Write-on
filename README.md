<div align="center">

# 🛡️ WRITEON

### Check links. Build strong passwords.

**Two honest cybersecurity tools. One page. No backend.**

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel)

### 🌐 [**Live Demo → write-on-zai.vercel.app**](https://write-on-zai.vercel.app/)

</div>

---

## 🎯 The Problem

Most people don't get hacked by movie-style exploits. They get hacked by an **ordinary link** and an **ordinary password**.

| 😈 Threat | 💡 Why it works |
|---|---|
| 📧 Phishing links | Fake "urgent" emails: KYC, invoices, password resets |
| 🔗 Lookalike URLs | `paypa1.com`, `@` tricks, punycode hide the real site |
| 🔑 Weak passwords | Short or reused passwords are guessed in seconds |

**WriteOn** gives students and everyday users two fast checks that run **100% on their own device**.

---

## ✨ Features

### 🔍 1. Link Checker
Paste any URL. WriteOn splits it into scheme, host, subdomains and path, then scores **21 warning signs**:

- 🌐 `http` instead of `https`
- 🎭 `@` trick and lookalike brands (`paypa1`)
- 🔤 Punycode (`xn--`) and IP-address hosts
- 📏 Very long URLs (400+ chars) and stacked subdomains
- 🚦 Final result: **SAFE ✅ / SUSPICIOUS ⚠️ / RISKY 🚨**, with a plain-English reason for every point

### 🔐 2. Password Checker
Live, keystroke-by-keystroke strength check:

- 📐 Length-first scoring (NIST SP 800-63B: **length beats complexity**)
- 🧮 Entropy estimate and offline-crack time estimate
- 🚫 Common-password list, sequences (`1234`), keyboard walks (`qwerty`)
- 💡 Improvement tips and a **passphrase generator** (`crypto.getRandomValues()`)

---

## 🔒 Privacy by Design

| | |
|---|---|
| 📤 Data uploaded | **0 bytes** |
| 🧾 Passwords stored | **None** (no logs, no cookies, no localStorage) |
| 🕵️ Tracking / analytics | **None** |
| 🖥️ Backend | **None**, all analysis is local JavaScript |

---

## ⚙️ How It Works

```
Input (URL / password)
        ↓
Signals checked in your browser
        ↓
Score (0-100 for links, 5 bands for passwords)
        ↓
Explanation + what to do next
```

1. **Input stays on-device**: nothing is sent to any server.
2. **Signals get scored**: each warning sign adds weight to a risk score.
3. **You get the reasoning**: no black box, every point is explained.

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS, custom dark-glass design |
| Runtime | Bun |
| Hosting | Vercel |

---

## 🚀 Run Locally

```bash
git clone https://github.com/zEniX-zz/Write-on.git
cd Write-on
bun install
bun run dev
```

Open **http://localhost:3000** 🎉

---

## ⚠️ Known Limitations

WriteOn is honest about what it can't do:

- ❌ **False positives**: long Google/GitHub links can look "suspicious"
- ❌ **False negatives**: a brand-new phishing domain with clean text can pass
- 🌍 **No live threat data**: no WHOIS, DNS, blocklists or redirect following
- 🔓 **HTTPS ≠ safe**: attackers also get certificates
- 📋 **Small common-password list** (~160 entries), this is not "Have I Been Pwned"
- 📊 **Meters are estimates**, always use MFA

> 🧠 *Warning signs, not a guarantee.*

---

## 📚 Research & References

Every rule in WriteOn comes from published research or official standards.
*(WriteOn uses simple transparent rules, not the papers' ML models.)*

| # | 📄 Source | 🧩 What we used (simple English) | 📍 Where to look |
|---|---|---|---|
| 1 | [**NIST SP 800-63B** — Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html#abstract) | Use long passwords (15+ chars if it is the only login step, 8+ with MFA). Length matters more than symbols. Allow paste for password managers. | Password rules section (web page, no page numbers) |
| 2 | [**How Does Your Password Measure Up?**](https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/ur) — Ur et al., Carnegie Mellon, USENIX Security 2012 | Strength meters push people to make longer passwords, and strict meters make passwords harder to crack. This is why our meter has 5 bands and honest tips. | Full paper, pp. 65-80 (key result in the abstract) |
| 3 | [**A Review of Human- and Computer-Facing URL Phishing Features**](https://www.research.ed.ac.uk/en/publications/a-review-of-human-and-computer-facing-url-phishing-features/) — University of Edinburgh | A list of URL clues that show phishing (long URL, many dots, hyphens, `@`). We used it to pick our link-check signals. | Feature lists / tables section |
| 4 | [**PhishAri: Automatic Realtime Phishing Detection on Twitter**](https://arxiv.org/pdf/1301.6899) — Aggarwal, Rajadesingan & Kumaraguru, IIIT-Delhi | Phishing URLs are usually longer, with more dots and subdomains, and use many redirects. Blacklists are slow, so checking the URL text itself helps. | Section IV "URL based features", pp. 4-5 |
| 5 | [**PhiSN: Phishing URL Detection Using Segmentation and NLP Features**](https://www.jstage.jst.go.jp/article/ipsjjip/32/0/32_973/_pdf/-char/en) — Journal of Information Processing | Breaking a URL into words and reading them helps spot fake brand names. Their accuracy is theirs; we use simple rules. | Segmentation + features section |

---

## 👥 Team

**Parv · Prince · Zaid · Ajit**
🎓 First-year students, **PW IOI Noida**
🏆 Built for **Hacktober HackDays 2026**

---

<div align="center">

**0 passwords logged · 0 links uploaded · 0 tracking**

⭐ If you like WriteOn, star the repo!

</div>
