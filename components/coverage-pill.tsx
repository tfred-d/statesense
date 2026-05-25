import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
}

export function CoveragePill({ score, className }: Props) {
  const tone =
    score >= 80
      ? "bg-green-100 text-green-800 border-green-200"
      : score >= 60
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-red-100 text-red-800 border-red-200";

  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
        tone,
        className
      )}
    >
      <span className="text-sm font-bold tabular-nums">{score}</span>
      <span className="opacity-70">/ 100 coverage</span>
    </div>
  );
}
