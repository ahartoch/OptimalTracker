"use client";

import React from "react";
import { Event } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface EventSummaryProps {
  events: Event[];
  homeTeam?: string;
  awayTeam?: string;
}

export default function EventSummary({
  events,
  homeTeam = "Home",
  awayTeam = "Away",
}: EventSummaryProps) {
  const { t } = useLanguage();

  // Calculate event counts by team and type
  const summary = events.reduce(
    (acc, event) => {
      const team = event.team;
      switch (event.type) {
        case "goal":
          acc[team].goals++;
          break;
        case "shot":
          acc[team].shots++;
          break;
        case "foul":
          acc[team].fouls++;
          break;
        case "corner":
          acc[team].corners++;
          break;
        case "yellowCard":
          acc[team].yellowCards++;
          break;
        case "redCard":
          acc[team].redCards++;
          break;
        case "offside":
          acc[team].offsides++;
          break;
      }
      return acc;
    },
    {
      home: {
        goals: 0,
        shots: 0,
        fouls: 0,
        corners: 0,
        yellowCards: 0,
        redCards: 0,
        offsides: 0,
      },
      away: {
        goals: 0,
        shots: 0,
        fouls: 0,
        corners: 0,
        yellowCards: 0,
        redCards: 0,
        offsides: 0,
      },
    }
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-gray-600">
              {t("reports.summary.stat")}
            </th>
            <th className="px-4 py-2 text-center text-gray-600">{homeTeam}</th>
            <th className="px-4 py-2 text-center text-gray-600">{awayTeam}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.goal")}
            </td>
            <td className="px-4 py-2 text-center">{summary.home.goals}</td>
            <td className="px-4 py-2 text-center">{summary.away.goals}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.shot")}
            </td>
            <td className="px-4 py-2 text-center">{summary.home.shots}</td>
            <td className="px-4 py-2 text-center">{summary.away.shots}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.corner")}
            </td>
            <td className="px-4 py-2 text-center">{summary.home.corners}</td>
            <td className="px-4 py-2 text-center">{summary.away.corners}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.foul")}
            </td>
            <td className="px-4 py-2 text-center">{summary.home.fouls}</td>
            <td className="px-4 py-2 text-center">{summary.away.fouls}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.yellowCard")}
            </td>
            <td className="px-4 py-2 text-center">
              {summary.home.yellowCards}
            </td>
            <td className="px-4 py-2 text-center">
              {summary.away.yellowCards}
            </td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.redCard")}
            </td>
            <td className="px-4 py-2 text-center">{summary.home.redCards}</td>
            <td className="px-4 py-2 text-center">{summary.away.redCards}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-gray-700">
              {t("match.events.offside")}
            </td>
            <td className="px-4 py-2 text-center">{summary.home.offsides}</td>
            <td className="px-4 py-2 text-center">{summary.away.offsides}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
