import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { withBasePath } from "@/lib/base-path";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Better Taro 75 — DSA interview problems",
    template: "%s · Better Taro 75",
  },
  description:
    "A faster, filterable UI for the Taro 75 list of the most frequently asked data-structures & algorithms interview questions, with local progress tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center gap-3 text-center">
        <a
          href="https://www.jointaro.com/"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
          aria-label="Taro"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/taro-logo.png")}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 rounded"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/taro-wordmark.png")}
            alt="Taro"
            width={64}
            height={16}
            className="h-4 w-auto"
          />
        </a>
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          All problems, rankings, and explanations belong to{" "}
          <a
            href="https://www.jointaro.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            Taro
          </a>
          . This is an unofficial, better-UI reader of the{" "}
          <a
            href="https://www.jointaro.com/interviews/taro-75/"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            Taro 75
          </a>{" "}
          list — all credit goes to Taro. Your progress is stored only in this
          browser.
        </p>
      </div>
    </footer>
  );
}
