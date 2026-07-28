/**
 * Empty / loading / error states.
 *
 * No illustrations by design. Stock or generated artwork is exactly what
 * makes a product look templated, and it says nothing. A clear sentence
 * explaining what happened plus one obvious action is more useful and
 * ages better.
 */
export function EmptyState({ icon: Icon, title, body, action, tone = "neutral" }) {
  const TONE = {
    neutral: "bg-canvas text-ink-faint",
    info: "bg-blue-soft text-blue",
    warn: "bg-amber-soft text-amber",
    error: "bg-red-soft text-red",
  };
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      {Icon && (
        <span className={`grid size-11 place-items-center rounded-2xl ${TONE[tone]}`}>
          <Icon className="size-5" strokeWidth={1.9} />
        </span>
      )}
      <h4 className="font-display mt-3 text-[15px] font-semibold text-ink">
        {title}
      </h4>
      {body && (
        <p className="mt-1 max-w-[34ch] text-[12px] leading-relaxed text-ink-soft">
          {body}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Skeleton primitive.
 *
 * Only used where data genuinely loads. Faking a delay to look busy makes
 * the product slower for no gain, so nothing on the mock-data screens uses
 * this yet — it's here ready for the real reporting API.
 */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-line-soft ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-3 h-2 w-full" />
    </div>
  );
}
