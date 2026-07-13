import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import { Providers } from "@/components/providers";
import "./globals.css";

// Lexi brand type: Fredoka (display), Nunito (body/UI), Space Mono (code/phonetics)
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lexi — Learn English you'll actually use",
  description:
    "Your AI tutor for vocabulary, grammar, real conversations and TOEIC — five focused minutes a day.",
  applicationName: "Lexi",
  appleWebApp: { capable: true, title: "Lexi", statusBarStyle: "default" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#6C4BF5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} ${spaceMono.variable} h-full antialiased`}
      // Browser extensions (translators, dark-mode, Grammarly…) mutate <html>
      // attributes before React hydrates, causing an unavoidable mismatch here.
      // This only suppresses warnings one level deep — real mismatches inside
      // the app are still reported.
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors theme="light" />
        <PWARegister />
      </body>
    </html>
  );
}
