"use client";

import React from "react";
import { Event } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface EventListProps {
  events: Event[];
  legNumber: number;
}

export default function EventList({ events, legNumber }: EventListProps) {
  const { t } = useLanguage();

  const formatPosition = (x: number, y: number) => {
    // Convert coordinates to more readable format
    const formattedX = Math.round(x);
    const formattedY = Math.round(y);
    return `(${formattedX}, ${formattedY})`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStyle = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return "bg-green-100 text-green-800";
      case "shot":
        return "bg-blue-100 text-blue-800";
      case "foul":
        return "bg-red-100 text-red-800";
      case "yellowCard":
        return "bg-yellow-100 text-yellow-800";
      case "redCard":
        return "bg-red-500 text-white";
      case "injury":
        return "bg-orange-100 text-orange-800";
      case "offside":
        return "bg-purple-100 text-purple-800";
      case "assist":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Sanitize event data display
  const displayPlayerName = (player?: Player) => {
    if (!player) return "Unknown";
    return player.name.replace(/[<>]/g, "");
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary">
          {t("match.events.list.title")}
        </h2>
        <span className="text-sm text-gray-600">
          {t("match.setup.legNumber")}: {legNumber}
        </span>
      </div>
      <div className="max-h-[50vh] overflow-y-auto">
        {events.length > 0 ? (
          <ul className="space-y-2 divide-y divide-gray-100">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-3 hover:bg-gray-50 transition-colors first:pt-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getEventStyle(
                        event.type
                      )}`}
                    >
                      {t(`match.events.${event.type}`)}
                    </span>
                    <span className="text-sm font-medium">
                      {event.player
                        ? t("match.events.list.playerEvent", {
                            name: displayPlayerName(event.player),
                            number: event.player.number,
                          })
                        : t("match.events.list.unknownPlayer")}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                    <span>{formatPosition(event.x, event.y)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatTime(event.timestamp)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-4">
            {t("match.events.list.noEvents")}
          </div>
        )}
      </div>
    </div>
  );
}
