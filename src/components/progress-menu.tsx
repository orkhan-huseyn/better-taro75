"use client";

import * as React from "react";
import { Download, MoreVertical, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ProgressMap,
  useProgressStore,
} from "@/lib/progress-store";

export function ProgressMenu() {
  const items = useProgressStore((s) => s.items);
  const resetAll = useProgressStore((s) => s.resetAll);
  const replaceAll = useProgressStore((s) => s.replaceAll);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleExport() {
    const payload = {
      app: "better-taro75",
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "better-taro75-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const next = (parsed?.items ?? parsed) as ProgressMap;
      if (next && typeof next === "object") {
        replaceAll(next);
      } else {
        alert("That file doesn't look like a Better Taro 75 export.");
      }
    } catch {
      alert("Could not read that file — is it valid JSON?");
    }
  }

  function handleReset() {
    if (
      window.confirm(
        "Reset all progress? This clears every solved mark, note and confidence rating stored in this browser.",
      )
    ) {
      resetAll();
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Progress options">
            <MoreVertical className="h-[1.15rem] w-[1.15rem]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[13rem]">
          <DropdownMenuLabel>Your progress</DropdownMenuLabel>
          <DropdownMenuItem onSelect={handleExport}>
            <Download /> Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
            <Upload /> Import from JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleReset}
            className="text-destructive focus:text-destructive"
          >
            <RotateCcw /> Reset all progress
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
