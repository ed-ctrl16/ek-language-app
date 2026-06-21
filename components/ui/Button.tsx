import * as React from "react";

type Variant = "brand" | "secondary" | "tertiary";

const base =
  "inline-flex items-center justify-center font-bold uppercase rounded " +
  "[transform:skewX(-15deg)] transition-[box-shadow,transform] duration-500 " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-tertiary " +
  "disabled:cursor-not-allowed disabled:shadow-none disabled:bg-disabled disabled:text-fg-disabled";

const variants: Record<Variant, string> = {
  // Primary CTA: white block on the brand canvas, hard shadow grows on hover.
  brand:
    "bg-brand-secondary text-brand shadow-hard-sm hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
  secondary:
    "bg-brand-tertiary text-brand-secondary shadow-hard-sm hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
  // Bordered variant (the one variant that uses a border instead of shadow-only).
  tertiary:
    "bg-brand-secondary text-brand border-4 border-ink shadow-hard-sm hover:bg-brand-quaternary hover:text-ink hover:shadow-hard-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Signature skewed poster button. Label is counter-skewed so it reads upright. */
export function Button({
  variant = "brand",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} px-8 py-3 text-xl ${className}`}
      {...props}
    >
      <span className="[transform:skewX(15deg)]">{children}</span>
    </button>
  );
}
