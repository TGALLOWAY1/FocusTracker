import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: "div" | "span";
  className?: string;
};

export function Eyebrow({ children, as = "div", className }: Props) {
  const Tag = as as ElementType;
  return (
    <Tag
      className={`text-[11px] uppercase tracking-wider font-medium text-text-muted${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </Tag>
  );
}
