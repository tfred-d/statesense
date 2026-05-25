// Loading skeleton scaffold while the audit runs. PRD §F3 — "Skeleton results
// scaffold, not just a spinner."

export function AuditSkeleton() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-12 w-24 rounded" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-2/3" />
      </div>

      <div className="space-y-3">
        <div className="skeleton h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Running audit — usually 10–15 seconds.
      </p>
    </div>
  );
}
