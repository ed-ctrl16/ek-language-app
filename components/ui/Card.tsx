import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

/**
 * White poster card: 4px black border, 20px radius, hard offset shadow,
 * 8px outer + 24px inner padding (the "framed" feel). No soft shadows.
 */
export function Card({
  interactive = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={
        "rounded-card border-4 border-ink bg-brand-secondary p-2 shadow-hard-md " +
        (interactive
          ? "cursor-pointer transition-[box-shadow,transform] duration-500 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg "
          : "") +
        className
      }
      {...props}
    >
      <div className="p-6 text-brand">{children}</div>
    </div>
  );
}

export function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-2xl font-bold uppercase text-brand">{children}</h2>
  );
}
