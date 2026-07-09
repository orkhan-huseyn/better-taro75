import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
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
    <footer className="border-t py-6 text-center text-xs text-muted-foreground">
      <div className="container">
        A better UI for{" "}
        <a
          href="https://www.jointaro.com/interviews/taro-75/"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium underline underline-offset-2 hover:text-foreground"
        >
          Taro 75
        </a>
        . Problem data &amp; explanations sourced from Taro. Progress is stored
        only in your browser.
      </div>
    </footer>
  );
}
