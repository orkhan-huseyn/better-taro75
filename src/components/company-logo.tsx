import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";
import type { CompanyRef } from "@/types";

export function CompanyLogo({
  company,
  size = 22,
  className,
}: {
  company: Pick<CompanyRef, "slug" | "name" | "logo">;
  size?: number;
  className?: string;
}) {
  const common =
    "flex items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border";
  if (!company.logo) {
    return (
      <span
        className={cn(common, "font-semibold text-muted-foreground", className)}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title={company.name}
      >
        {company.name.charAt(0)}
      </span>
    );
  }
  return (
    <span
      className={cn(common, className)}
      style={{ width: size, height: size }}
      title={company.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBasePath(company.logo)}
        alt={company.name}
        width={size}
        height={size}
        loading="lazy"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function CompanyLogoStack({
  companies,
  max = 6,
  size = 22,
}: {
  companies: Pick<CompanyRef, "slug" | "name" | "logo">[];
  max?: number;
  size?: number;
}) {
  const shown = companies.slice(0, max);
  const extra = companies.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {shown.map((c) => (
          <CompanyLogo key={c.slug} company={c} size={size} />
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          +{extra} {extra === 1 ? "company" : "companies"}
        </span>
      )}
    </div>
  );
}
