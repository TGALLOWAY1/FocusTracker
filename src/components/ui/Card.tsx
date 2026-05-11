import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  className?: string;
  children: ReactNode;
  as?: "section" | "div" | "article" | "aside";
  padded?: boolean;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { className, children, as = "section", padded = true, ...rest },
  ref
) {
  const Tag = as as "section";
  return (
    <Tag
      ref={ref as never}
      className={cn(
        "bg-bg-card border border-border-subtle rounded-2xl shadow-card",
        padded && "p-5",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

type CardHeaderProps = {
  title: ReactNode;
  trailing?: ReactNode;
  subtitle?: string;
  className?: string;
};

export function CardHeader({ title, trailing, subtitle, className }: CardHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
