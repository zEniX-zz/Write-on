import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Chakra_Petch } from "next/font/google";
import "./globals.css";
import "./writeon.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Writeon — Check links. Build strong passwords.",
  description:
    "Writeon — a client-side, two-in-one cybersecurity companion: paste a link to surface phishing warning signs, and check password strength against NIST SP 800-63B guidance. Heuristic analysis runs entirely in your browser. No backend, no tracking.",
  keywords: [
    "phishing checker",
    "link safety",
    "password strength",
    "NIST 800-63B",
    "cybersecurity",
    "URL analyzer",
    "Writeon",
  ],
  authors: [{ name: "Parv · Prince · Zaid · Ajit — PW IOI Noida" }],
  icons: {
    icon: "/writeon.svg",
  },
  openGraph: {
    title: "Writeon — Check links. Build strong passwords.",
    description:
      "Two honest, client-side cybersecurity tools. Paste a link, check a password — runs entirely in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Writeon — Check links. Build strong passwords.",
    description: "Two honest, client-side cybersecurity tools. No backend, no tracking.",
  },
};

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${chakraPetch.variable} antialiased`}
        style={{ backgroundColor: "#050505", color: "#f4f4f4" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
