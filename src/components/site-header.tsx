"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProgressMenu } from "@/components/progress-menu";
import { withBasePath } from "@/lib/base-path";
import { useHydratedProgress } from "@/lib/progress-store";

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
          <span className="text-[15px] font-semibold tracking-tight">
            Better Taro 75
          </span>
        </Link>

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
