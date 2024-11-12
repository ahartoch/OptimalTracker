"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Match, Player } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface ReportFiltersProps {
  matches: Match[];
  selectedMatch: Match | null;
  selectedLeg: number | "all";
  selectedPlayers: string[];
  onMatchSelect: (match: Match | null) => void;
  onLegSelect: (leg: number | "all") => void;
  onPlayerSelect: (playerIds: string[]) => void;
  onTeamSelect: (teamName: string) => void;
}

type TeamSide = "home" | "away" | "both";

interface PlayerWithHistory {
  id: string;
  name: string;
  currentNumber: number;
  hasMultipleNumbers: boolean;
  numbers: number[];
  team: "home" | "away";
}

export default function ReportFilters({
  matches,
  selectedMatch,
  selectedLeg,
  selectedPlayers,
  onMatchSelect,
  onLegSelect,
  onPlayerSelect,
  onTeamSelect,
}: ReportFiltersProps) {
  const { t } = useLanguage();
  const [selectedTeamSide, setSelectedTeamSide] = useState<TeamSide>("both");
  const [selectedTeamName, setSelectedTeamName] = useState<string>("all");
  const [availablePlayers, setAvailablePlayers] = useState<PlayerWithHistory[]>(
    []
  );

  // Process players to handle multiple jersey numbers
  const processPlayers = useCallback(
    (players: Player[]): PlayerWithHistory[] => {
      const playerMap = new Map<string, PlayerWithHistory>();

      // Sort matches by date (most recent first) to get the current number
      const sortedMatches = [...matches].sort(
        (a, b) => b.startTime - a.startTime
      );

      sortedMatches.forEach((match) => {
        match.players.forEach((player) => {
          if (!playerMap.has(player.id)) {
            playerMap.set(player.id, {
              id: player.id,
              name: player.name,
              currentNumber: player.number,
              hasMultipleNumbers: false,
              numbers: [player.number],
              team: player.team,
            });
          } else {
            const existingPlayer = playerMap.get(player.id)!;
            if (!existingPlayer.numbers.includes(player.number)) {
              existingPlayer.numbers.push(player.number);
              existingPlayer.hasMultipleNumbers = true;
            }
          }
        });
      });

      return Array.from(playerMap.values());
    },
    [matches]
  );

  // Get unique leg numbers
  const legNumbers = Array.from(new Set(matches.map((m) => m.legNumber))).sort(
    (a, b) => a - b
  );

  // Get all unique team names
  const teamNames = Array.from(
    new Set(matches.flatMap((match) => [match.homeTeam, match.awayTeam]))
  ).sort();

  // Update available players when filters change
  useEffect(() => {
    const updatePlayers = () => {
      let players: PlayerWithHistory[] = [];

      if (selectedMatch) {
        players = processPlayers(selectedMatch.players);
      } else {
        const allPlayers = matches.flatMap((match) => match.players);
        players = processPlayers(allPlayers);
      }

      setAvailablePlayers(players);
    };

    updatePlayers();
  }, [matches, selectedMatch, processPlayers]);

  // Handle team selection change
  const handleTeamSelect = (value: string) => {
    setSelectedTeamName(value);
    onTeamSelect(value);
  };

  // Team Side Selection options
  const teamSideOptions = [
    { value: "home", label: t("match.score.home") },
    { value: "away", label: t("match.score.away") },
    { value: "both", label: t("reports.filters.bothSides") },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      {/* Match Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {t("reports.filters.selectMatch")}
        </label>
        <select
          aria-label={t("reports.filters.selectMatch")}
          value={selectedMatch?.id || "all"}
          onChange={(e) => {
            const match = matches.find((m) => m.id === e.target.value);
            onMatchSelect(match || null);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
        >
          <option key="all-matches" value="all">
            {t("reports.filters.allMatches")}
          </option>
          {matches.map((match) => (
            <option key={`match-${match.id}`} value={match.id}>
              {match.homeTeam} vs {match.awayTeam}
            </option>
          ))}
        </select>
      </div>

      {/* Leg Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {t("reports.filters.selectLeg")}
        </label>
        <select
          value={selectedLeg}
          onChange={(e) =>
            onLegSelect(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
        >
          <option key="all-legs" value="all">
            {t("reports.filters.allLegs")}
          </option>
          {legNumbers.map((leg) => (
            <option key={`leg-${leg}`} value={leg}>
              {t("reports.filters.legNumber", { number: leg })}
            </option>
          ))}
        </select>
      </div>

      {/* Team Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {t("reports.filters.selectTeam")}
        </label>
        <select
          value={selectedTeamName}
          onChange={(e) => handleTeamSelect(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
        >
          <option key="all-teams" value="all">
            {t("reports.filters.allTeams")}
          </option>
          {teamNames.map((teamName) => (
            <option key={`team-${teamName}`} value={teamName}>
              {teamName}
            </option>
          ))}
        </select>
      </div>

      {/* Team Side Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {t("reports.filters.selectTeamSide")}
        </label>
        <div className="mt-1 space-x-4">
          {teamSideOptions.map((option) => (
            <label
              key={`team-side-${option.value}`}
              className="inline-flex items-center"
            >
              <input
                type="radio"
                value={option.value}
                checked={selectedTeamSide === option.value}
                onChange={(e) =>
                  setSelectedTeamSide(e.target.value as TeamSide)
                }
                className="form-radio text-primary"
              />
              <span className="ml-2 text-black">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Player Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {t("reports.filters.selectPlayers")}
        </label>
        <select
          multiple
          value={selectedPlayers}
          onChange={(e) =>
            onPlayerSelect(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
          size={5}
        >
          {availablePlayers.map((player) => (
            <option key={`player-${player.id}`} value={player.id}>
              {player.name} ({player.currentNumber})
              {player.hasMultipleNumbers &&
                ` [${player.numbers.sort((a, b) => a - b).join(", ")}]`}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-600">
          {t("reports.filters.multipleSelectHint")}
        </p>
      </div>
    </div>
  );
}
