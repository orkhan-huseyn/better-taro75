"use client";

import * as React from "react";
import { MoreVertical, RotateCcw } from "lucide-react";
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
  useProgressStore,
} from "@/lib/progress-store";

export function ProgressMenu() {
  const resetAll = useProgressStore((s) => s.resetAll);

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Progress options">
            <MoreVertical className="h-[1.15rem] w-[1.15rem]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[13rem]">
          <DropdownMenuLabel>Your progress</DropdownMenuLabel>
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
