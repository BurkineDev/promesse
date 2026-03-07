import { TrackingEvent, STATUS_LABELS, PackageStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

const STATUS_ICONS: Record<PackageStatus, string> = {
  RECU: "📦",
  ENTREPOT: "🏭",
  EXPEDIE: "✈️",
  EN_TRANSIT: "🚢",
  ARRIVE: "📍",
  LIVRE: "✅",
};

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        Aucun événement enregistré
      </p>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 ml-3 space-y-6">
      {events.map((event, index) => (
        <li key={event.id} className="ml-6">
          <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white rounded-full ring-2 ring-gray-200">
            {index === 0 ? (
              <CheckCircle className="w-5 h-5 text-blue-600" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
          </span>
          <div className={`${index === 0 ? "opacity-100" : "opacity-70"}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base">{STATUS_ICONS[event.status as PackageStatus]}</span>
              <p className="text-sm font-semibold text-gray-900">
                {STATUS_LABELS[event.status as PackageStatus]}
              </p>
            </div>
            {event.location && (
              <p className="text-xs text-gray-500 mb-0.5">
                📍 {event.location}
              </p>
            )}
            {event.notes && (
              <p className="text-xs text-gray-400 italic">{event.notes}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {formatDateTime(event.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
