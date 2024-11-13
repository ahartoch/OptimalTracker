"use client";

import React, { useState } from "react";
import { Match, GameEvent } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface SoccerPitchProps {
  match: Match;
  onEventAdded: (event: GameEvent) => void;
  isRunning: boolean;
}

export default function SoccerPitch({
  match,
  onEventAdded,
  isRunning,
}: SoccerPitchProps) {
  const { t } = useLanguage();
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [showEvents, setShowEvents] = useState(true);

  // Define event types as a constant
  const EVENT_TYPES = [
    "goal",
    "shot",
    "foul",
    "corner",
    "yellowCard",
    "redCard",
    "injury",
    "offside",
    "assist",
  ] as const;

  // Constants from HeatMap
  const SCALE_FACTOR = 10;
  const PADDING = 20;
  const WIDTH = 800;
  const HEIGHT = 500;

  // Field dimensions
  const FIELD_WIDTH = WIDTH - 2 * PADDING;
  const FIELD_HEIGHT = HEIGHT - 2 * PADDING;

  // Penalty area dimensions
  const PENALTY_AREA_WIDTH = 44 * SCALE_FACTOR;
  const PENALTY_AREA_DEPTH = 18 * SCALE_FACTOR;

  // Goal area dimensions
  const GOAL_AREA_WIDTH = 18.32 * SCALE_FACTOR;
  const GOAL_AREA_DEPTH = 5.5 * SCALE_FACTOR;

  // Center circle radius
  const CENTER_CIRCLE_RADIUS = 9.15 * SCALE_FACTOR;

  // Penalty spot distance
  const PENALTY_SPOT_DISTANCE = 11 * SCALE_FACTOR;

  // Corner arc radius
  const CORNER_ARC_RADIUS = 1 * SCALE_FACTOR;

  // Handle click on pitch
  const handlePitchClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isRunning || !selectedEventType) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to percentage coordinates
    const xPercent = ((x - PADDING) / (WIDTH - 2 * PADDING)) * 100;
    const yPercent = ((y - PADDING) / (HEIGHT - 2 * PADDING)) * 100;

    // Validate coordinates are within pitch bounds
    if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100)
      return;

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type: selectedEventType as GameEvent["type"],
      team: selectedTeam,
      player: selectedPlayer
        ? match.players.find((p) => p.id === selectedPlayer)
        : undefined,
      x: xPercent,
      y: yPercent,
      timestamp: Date.now(),
      matchId: match.id,
    };

    onEventAdded(newEvent);
  };

  // Event color helper function
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return "#22c55e"; // green
      case "shot":
        return "#3b82f6"; // blue
      case "foul":
        return "#ef4444"; // red
      case "corner":
        return "#f59e0b"; // amber
      case "yellowCard":
        return "#fbbf24"; // yellow
      case "redCard":
        return "#dc2626"; // red
      case "injury":
        return "#f97316"; // orange
      case "offside":
        return "#8b5cf6"; // purple
      case "assist":
        return "#6366f1"; // indigo
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {t("match.events.selectEvent")}
          </label>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            disabled={!isRunning}
            aria-label={t("match.events.selectEvent")}
          >
            <option value="">{t("match.events.selectEvent")}</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`match.events.${type}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {t("match.events.selectTeam")}
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value as "home" | "away")}
            className="w-full p-2 border rounded-md text-black"
            disabled={!isRunning}
            aria-label={t("match.events.selectTeam")}
          >
            <option value="home">{match.homeTeam}</option>
            <option value="away">{match.awayTeam}</option>
          </select>
        </div>

        {/* Player Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {t("match.events.selectPlayer")}
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            disabled={!isRunning}
            aria-label={t("match.events.selectPlayer")}
          >
            <option value="">{t("match.events.selectPlayer")}</option>
            {match.players
              .filter((p) => p.team === selectedTeam)
              .sort((a, b) => a.number - b.number)
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.number} - {player.name}
                </option>
              ))}
          </select>
        </div>

        {/* Show Events Toggle */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-black cursor-pointer">
            <input
              type="checkbox"
              checked={showEvents}
              onChange={(e) => setShowEvents(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded"
            />
            <span>{t("match.events.visibleEvents")}</span>
          </label>
        </div>
      </div>

      {/* Instructions */}
      {!isRunning && (
        <div className="text-center text-gray-500">
          {t("match.controls.startTimer")}
        </div>
      )}
      {isRunning && !selectedEventType && (
        <div className="text-center text-gray-500">
          {t("match.events.selectEvent")}
        </div>
      )}
      {isRunning && selectedEventType && (
        <div className="text-center text-gray-500">
          {t("match.events.clickToRecord")}
        </div>
      )}

      {/* Soccer Pitch SVG Container */}
      <div className="aspect-[8/5] w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={`w-full h-full ${
            isRunning && selectedEventType ? "cursor-crosshair" : "cursor-default"
          }`}
          onClick={handlePitchClick}
        >
          {/* Background */}
          <rect width={WIDTH} height={HEIGHT} fill="#4ade80" />

          {/* Field outline */}
          <rect
            x={PADDING}
            y={PADDING}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Center line */}
          <line
            x1={WIDTH / 2}
            y1={PADDING}
            x2={WIDTH / 2}
            y2={HEIGHT - PADDING}
            stroke="white"
            strokeWidth="2"
          />

          {/* Center circle */}
          <circle
            cx={WIDTH / 2}
            cy={HEIGHT / 2}
            r={CENTER_CIRCLE_RADIUS}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Center spot */}
          <circle cx={WIDTH / 2} cy={HEIGHT / 2} r="2" fill="white" />

          {/* Penalty areas */}
          <rect
            x={PADDING}
            y={(HEIGHT - PENALTY_AREA_WIDTH) / 2}
            width={PENALTY_AREA_DEPTH}
            height={PENALTY_AREA_WIDTH}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <rect
            x={WIDTH - PADDING - PENALTY_AREA_DEPTH}
            y={(HEIGHT - PENALTY_AREA_WIDTH) / 2}
            width={PENALTY_AREA_DEPTH}
            height={PENALTY_AREA_WIDTH}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Goal areas */}
          <rect
            x={PADDING}
            y={(HEIGHT - GOAL_AREA_WIDTH) / 2}
            width={GOAL_AREA_DEPTH}
            height={GOAL_AREA_WIDTH}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <rect
            x={WIDTH - PADDING - GOAL_AREA_DEPTH}
            y={(HEIGHT - GOAL_AREA_WIDTH) / 2}
            width={GOAL_AREA_DEPTH}
            height={GOAL_AREA_WIDTH}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Penalty spots */}
          <circle
            cx={PADDING + PENALTY_SPOT_DISTANCE}
            cy={HEIGHT / 2}
            r="2"
            fill="white"
          />
          <circle
            cx={WIDTH - PADDING - PENALTY_SPOT_DISTANCE}
            cy={HEIGHT / 2}
            r="2"
            fill="white"
          />

          {/* Penalty arcs */}
          <path
            d={`M ${PADDING + PENALTY_SPOT_DISTANCE} ${
              HEIGHT / 2 - CENTER_CIRCLE_RADIUS
            } 
                A ${CENTER_CIRCLE_RADIUS} ${CENTER_CIRCLE_RADIUS} 0 0 1 
                ${PADDING + PENALTY_SPOT_DISTANCE} ${
              HEIGHT / 2 + CENTER_CIRCLE_RADIUS
            }`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${WIDTH - PADDING - PENALTY_SPOT_DISTANCE} ${
              HEIGHT / 2 - CENTER_CIRCLE_RADIUS
            } 
                A ${CENTER_CIRCLE_RADIUS} ${CENTER_CIRCLE_RADIUS} 0 0 0 
                ${WIDTH - PADDING - PENALTY_SPOT_DISTANCE} ${
              HEIGHT / 2 + CENTER_CIRCLE_RADIUS
            }`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Corner arcs */}
          <path
            d={`M ${PADDING + CORNER_ARC_RADIUS} ${PADDING} 
                A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 
                ${PADDING} ${PADDING + CORNER_ARC_RADIUS}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${WIDTH - PADDING - CORNER_ARC_RADIUS} ${PADDING} 
                A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 
                ${WIDTH - PADDING} ${PADDING + CORNER_ARC_RADIUS}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${PADDING + CORNER_ARC_RADIUS} ${HEIGHT - PADDING} 
                A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 
                ${PADDING} ${HEIGHT - PADDING - CORNER_ARC_RADIUS}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${WIDTH - PADDING - CORNER_ARC_RADIUS} ${HEIGHT - PADDING} 
                A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 
                ${WIDTH - PADDING} ${HEIGHT - PADDING - CORNER_ARC_RADIUS}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Events */}
          {showEvents &&
            match.events.map((event) => (
              <circle
                key={event.id}
                cx={PADDING + (event.x * FIELD_WIDTH) / 100}
                cy={PADDING + (event.y * FIELD_HEIGHT) / 100}
                r="4"
                fill={getEventColor(event.type)}
                stroke="white"
                strokeWidth="1"
              />
            ))}
        </svg>
      </div>
    </div>
  );
}
