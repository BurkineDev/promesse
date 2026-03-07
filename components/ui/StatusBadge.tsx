import { PackageStatus, STATUS_COLORS, STATUS_LABELS } from "@/types";

interface StatusBadgeProps {
  status: PackageStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${STATUS_COLORS[status]} ${sizeClass}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
