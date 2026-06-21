import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

/** White input with 4px black border and hard offset shadow. Label tied via htmlFor. */
export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-3 block text-base font-semibold uppercase text-heading"
      >
        {label}
      </label>
      <input
        id={id}
        className={
          "block w-full rounded border-4 border-ink bg-brand-secondary px-5 py-4 " +
          "text-lg text-brand shadow-hard-xs transition-all duration-200 " +
          "placeholder:uppercase placeholder:text-body-subtle " +
          "hover:shadow-hard-sm focus:border-brand-tertiary focus:shadow-hard-sm focus:outline-none " +
          className
        }
        {...props}
      />
    </div>
  );
}
