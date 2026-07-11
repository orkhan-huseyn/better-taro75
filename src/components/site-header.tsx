"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProgressMenu } from "@/components/progress-menu";
import { withBasePath } from "@/lib/base-path";
import { useHydratedProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  // Rehydrate persisted progress once, globally, on every page.
  useHydratedProgress();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-3">
        <Link href="/" className="group flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/taro-logo.png")}
            alt="Taro"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg shadow-sm"
          />
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
            Better Taro 75
          </span>
        </Link>

        <nav className="ml-2 flex items-center gap-0.5 text-sm font-medium sm:ml-4 sm:gap-1">
          <NavLink href="/">Problems</NavLink>
          <NavLink href="/roadmap">Roadmap</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <Button variant="ghost" size="icon" asChild aria-label="GitHub">
            <a
              href="https://github.com/orkhan-huseyn"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Github className="h-[1.15rem] w-[1.15rem]" />
            </a>
          </Button>
          <ProgressMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Normalise trailing slashes so "/roadmap" and "/roadmap/" both match.
  const norm = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);
  const active = norm(pathname) === norm(href);
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-2.5 py-1.5 transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
