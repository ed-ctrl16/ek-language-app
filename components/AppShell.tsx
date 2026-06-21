import * as React from "react";

const navItems: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Progress", href: "#" }, // Iteration 5
  { label: "Settings", href: "/settings" },
];

/**
 * App shell: left rail + main content + right context panel on desktop.
 * Collapses to a single column with a bottom tab bar on mobile (see UI_UX_PLAN §5).
 * Iteration 0 renders structure only.
 */
export function AppShell({
  children,
  rightPanel,
}: {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand">
      <div className="mx-auto flex max-w-[1280px] gap-6 px-4 py-6 md:px-8">
        {/* Left rail (desktop) */}
        <nav
          aria-label="Primary"
          className="hidden w-44 shrink-0 flex-col gap-3 md:flex"
        >
          <div className="mb-4 text-2xl font-bold uppercase text-heading">
            Habla
          </div>
          {navItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={i === 0 ? "page" : undefined}
              className={
                "rounded border-4 px-4 py-3 text-base font-bold uppercase transition-colors duration-200 " +
                (i === 0
                  ? "border-ink bg-brand-secondary text-brand shadow-hard-2xs"
                  : "border-transparent text-heading hover:bg-brand-quaternary hover:text-ink")
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Main */}
        <main className="min-w-0 flex-1">{children}</main>

        {/* Right context panel (desktop) */}
        {rightPanel ? (
          <aside className="hidden w-72 shrink-0 lg:block">{rightPanel}</aside>
        ) : null}
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 flex border-t-4 border-ink bg-brand-secondary md:hidden"
      >
        {navItems.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={i === 0 ? "page" : undefined}
            className={
              "flex-1 py-4 text-center text-sm font-bold uppercase " +
              (i === 0 ? "bg-brand text-brand-secondary" : "text-brand")
            }
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
