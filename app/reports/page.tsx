"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Match, Event } from "@/lib/types";
import ReportFilters from "@/components/ReportFilters";
import ReportGenerator from "@/components/ReportGenerator";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ReportsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedLeg, setSelectedLeg] = useState<number | "all">("all");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedTeamName, setSelectedTeamName] = useState<string>("all");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Load matches from localStorage
  useEffect(() => {
    const loadMatches = () => {
      const savedMatches = localStorage.getItem("soccerMatches");
      if (savedMatches) {
        const parsedMatches = JSON.parse(savedMatches);
        setMatches(parsedMatches);

        // Check for matchId in URL params
        const matchId = searchParams.get("matchId");
        if (matchId) {
          const match = parsedMatches.find((m: Match) => m.id === matchId);
          if (match) {
            setSelectedMatch(match);
            setFilteredEvents(match.events);
          }
        }
      }
    };

    loadMatches();
  }, [searchParams]);

  // Get matches where selected team appears
  const getMatchesForTeam = (teamName: string) => {
    if (teamName === "all") return matches;
    return matches.filter(
      (match) => match.homeTeam === teamName || match.awayTeam === teamName
    );
  };

  // Update filtered events when filters change
  useEffect(() => {
    let filteredMatches = matches;
    let events: Event[] = [];

    // First filter by team if selected
    if (selectedTeamName !== "all") {
      filteredMatches = getMatchesForTeam(selectedTeamName);
      if (filteredMatches.length === 1 && !selectedMatch) {
        setSelectedMatch(filteredMatches[0]);
      }
    }

    // Then get events based on match selection
    if (selectedMatch) {
      events = selectedMatch.events;
    } else {
      events = filteredMatches.flatMap((match) => match.events);
    }

    // Filter by leg if selected
    if (selectedLeg !== "all") {
      events = events.filter(
        (event) =>
          filteredMatches.find((m) => m.id === event.matchId)?.legNumber ===
          selectedLeg
      );
    }

    // Filter by players if selected
    if (selectedPlayers.length > 0) {
      events = events.filter(
        (event) => event.player && selectedPlayers.includes(event.player.id)
      );
    }

    setFilteredEvents(events);
  }, [matches, selectedMatch, selectedLeg, selectedPlayers, selectedTeamName]);

  // Debug logging
  console.log("Selected Match:", selectedMatch);
  console.log("Filtered Events:", filteredEvents);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-primary">
          {t("reports.title")}
        </h1>

        <ReportFilters
          matches={getMatchesForTeam(selectedTeamName)}
          selectedMatch={selectedMatch}
          selectedLeg={selectedLeg}
          selectedPlayers={selectedPlayers}
          onMatchSelect={setSelectedMatch}
          onLegSelect={setSelectedLeg}
          onPlayerSelect={setSelectedPlayers}
          onTeamSelect={setSelectedTeamName}
        />

        {filteredEvents.length > 0 ? (
          <ReportGenerator
            events={filteredEvents}
            match={selectedMatch}
            selectedTeamName={selectedTeamName}
            availableMatches={getMatchesForTeam(selectedTeamName)}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-500">
            {t("reports.noEventsFound")}
          </div>
        )}
      </div>
    </main>
  );
}
