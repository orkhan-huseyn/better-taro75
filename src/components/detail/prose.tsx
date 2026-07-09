import { cn } from "@/lib/utils";

export function Prose({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("taro-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
