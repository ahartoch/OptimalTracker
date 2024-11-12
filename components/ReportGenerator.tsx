"use client";

import React, { useRef, useState } from "react";
import { Event, Match } from "@/lib/types";
import HeatMap from "./HeatMap";
import XGReport from "./XGReport";
import ExportData from "./ExportData";
import EventSummary from "./EventSummary";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReportGeneratorProps {
  events: Event[];
  match: Match | null;
  selectedTeamName?: string;
  availableMatches: Match[];
}

export default function ReportGenerator({
  events,
  match,
  selectedTeamName = "all",
  availableMatches,
}: ReportGeneratorProps) {
  const { t } = useLanguage();
  const [showXG, setShowXG] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const heatmapRefs = {
    shots: useRef<SVGSVGElement>(null),
    fouls: useRef<SVGSVGElement>(null),
    goals: useRef<SVGSVGElement>(null),
    xg: useRef<SVGSVGElement>(null),
  };

  // Filter events by team
  const filterEventsByTeam = (eventsToFilter: Event[]): Event[] => {
    if (selectedTeamName === "all") return eventsToFilter;

    return eventsToFilter.filter((event) => {
      const eventMatch =
        match || events.find((e) => e.matchId === event.matchId);
      if (!eventMatch) return false;

      return event.team === "home"
        ? eventMatch.homeTeam === selectedTeamName
        : eventMatch.awayTeam === selectedTeamName;
    });
  };

  // Filter events by type and apply team filter
  const shotEvents = filterEventsByTeam(
    events.filter((event) => event.type === "shot")
  );
  const goalEvents = filterEventsByTeam(
    events.filter((event) => event.type === "goal")
  );
  const foulEvents = filterEventsByTeam(
    events.filter((event) => event.type === "foul")
  );
  const xgEvents = filterEventsByTeam(
    events.filter((event) => event.type === "shot" || event.type === "goal")
  );

  // Create a virtual match for aggregated stats when no specific match is selected
  const aggregatedMatch =
    !match && events.length > 0
      ? {
          id: "aggregated",
          homeTeam: selectedTeamName === "all" ? "All Teams" : selectedTeamName,
          awayTeam:
            selectedTeamName === "all"
              ? ""
              : availableMatches.length === 1
              ? availableMatches[0].homeTeam === selectedTeamName
                ? availableMatches[0].awayTeam
                : availableMatches[0].homeTeam
              : "",
          homeScore: goalEvents.filter((e) => {
            const eventMatch = availableMatches.find((m) => m.id === e.matchId);
            return (
              eventMatch &&
              ((e.team === "home" &&
                eventMatch.homeTeam === selectedTeamName) ||
                (e.team === "away" && eventMatch.awayTeam === selectedTeamName))
            );
          }).length,
          awayScore: goalEvents.filter((e) => {
            const eventMatch = availableMatches.find((m) => m.id === e.matchId);
            return (
              eventMatch &&
              ((e.team === "away" &&
                eventMatch.homeTeam === selectedTeamName) ||
                (e.team === "home" && eventMatch.awayTeam === selectedTeamName))
            );
          }).length,
          currentHalf: "finished" as const,
          homeSubstitutionWindows: 0,
          awaySubstitutionWindows: 0,
          startTime: 0,
          events: events,
          players: [],
          legNumber: 0,
          category: "all",
        }
      : match;

  if (!events.length) {
    return (
      <div className="text-center text-gray-500 p-6">
        {t("reports.noEventsFound")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Summary Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">
          {t("reports.summary.title")}
        </h2>
        <EventSummary
          events={events}
          homeTeam={aggregatedMatch?.homeTeam}
          awayTeam={aggregatedMatch?.awayTeam}
        />
      </div>

      {/* Expected Goals Section */}
      <div ref={statsRef} className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">
          {t("reports.xg.title")}
        </h2>
        <XGReport match={aggregatedMatch} />

        {/* Shot Quality Map */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-black">
            {t("reports.xg.shotMap")}
          </h3>
          <div className="max-w-3xl mx-auto">
            <HeatMap
              events={xgEvents}
              ref={heatmapRefs.xg}
              showXG={showXG}
              onToggleXG={() => setShowXG(!showXG)}
            />
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            {t("reports.xg.legend")}
          </p>
        </div>
      </div>

      {/* Heat Maps Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">
          {t("reports.heatmaps.title")}
        </h2>
        <div className="flex flex-col space-y-8">
          {/* Goals Heat Map */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-black">
              {t("match.events.goal")}
            </h3>
            <div className="max-w-3xl mx-auto">
              <HeatMap events={goalEvents} ref={heatmapRefs.goals} />
            </div>
          </div>

          {/* Shots Heat Map */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-black">
              {t("reports.heatmaps.shots")}
            </h3>
            <div className="max-w-3xl mx-auto">
              <HeatMap events={shotEvents} ref={heatmapRefs.shots} />
            </div>
          </div>

          {/* Fouls Heat Map */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-black">
              {t("reports.heatmaps.fouls")}
            </h3>
            <div className="max-w-3xl mx-auto">
              <HeatMap events={foulEvents} ref={heatmapRefs.fouls} />
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">
          {t("reports.export.title")}
        </h2>
        <ExportData
          match={
            aggregatedMatch || {
              id: "all",
              homeTeam: "All Teams",
              awayTeam: "",
              homeScore: 0,
              awayScore: 0,
              currentHalf: "finished",
              homeSubstitutionWindows: 0,
              awaySubstitutionWindows: 0,
              startTime: 0,
              events: [],
              players: [],
              legNumber: 0,
              category: "all",
            }
          }
          heatmapRefs={heatmapRefs}
          statsRef={statsRef}
          events={events}
        />
      </div>
    </div>
  );
}
