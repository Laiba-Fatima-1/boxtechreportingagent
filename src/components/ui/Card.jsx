/**
 * Surface primitive.
 *
 * `tier` encodes importance, so elevation carries meaning instead of every
 * card looking identical:
 *   sunken – nested inside another surface, recedes
 *   raised – the default card
 *   float  – reserved for the AI summary, the page's anchor
 *
 * min-w-0 by default so charts inside can shrink (see ChartFrame).
 */
const TIER = {
  sunken: "bg-canvas border-line-soft shadow-[var(--shadow-sunken)]",
  raised: "bg-card border-line shadow-[var(--shadow-raised)]",
  float: "bg-card border-transparent shadow-[var(--shadow-float)]",
};

export function Card({ tier = "raised", className = "", children, ...rest }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border ${TIER[tier]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle, className = "" }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-5 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="font-display truncate text-[15px] font-semibold text-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="truncate text-[11px] text-ink-faint">{subtitle}</p>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function GhostButton({ className = "", children, ...rest }) {
  return (
    <button
      className={`press rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Provenance chip — wherever a number needs to declare where it came from. */
export function SourceChip({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-faint">
      <span className="size-1.5 rounded-full bg-ink-faint" />
      {children}
    </span>
  );
}

/** Small caps section label — used to group the dashboard into zones. */
export function SectionLabel({ children, action }) {
  return (
    <div className="mb-2.5 flex items-center gap-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {children}
      </h2>
      <span className="h-px flex-1 bg-line" />
      {action}
    </div>
  );
}
