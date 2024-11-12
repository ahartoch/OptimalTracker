"use client";

import React, { useState } from "react";
import { Event, Match, Player } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";
import { BiBarChart, BiBall } from "react-icons/bi";
import Link from "next/link";

interface SoccerPitchProps {
  match: Match;
  onEventAdded: (event: Event) => void;
}

export default function SoccerPitch({ match, onEventAdded }: SoccerPitchProps) {
  const [selectedEventType, setSelectedEventType] =
    useState<Event["type"]>("goal");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(
    undefined
  );
  const [visibleEventTypes, setVisibleEventTypes] = useState<Event["type"][]>([
    "goal",
  ]);
  const { t } = useLanguage();

  // FIFA's standard pitch dimensions (in pixels, scaled from meters)
  const PITCH_LENGTH = 800; // 105m scaled to 800px
  const PITCH_WIDTH = 571; // 75m scaled proportionally (800 * 75/105)
  const SCALE_FACTOR = PITCH_LENGTH / 105; // pixels per meter

  // Goal dimensions
  const GOAL_WIDTH = 7.32 * SCALE_FACTOR; // 7.32m wide
  const GOAL_POST_WIDTH = 0.12 * SCALE_FACTOR; // 12cm wide

  // Goal area - measured 5.5m from inside of each goalpost
  const GOAL_AREA_DEPTH = 5.5 * SCALE_FACTOR; // 5.5m from goal line
  const GOAL_AREA_TOTAL_WIDTH = 5.5 * 2 + 7.32; // 5.5m from each goalpost + goal width
  const GOAL_AREA_START_X = 0; // For left goal area
  const GOAL_AREA_START_Y =
    (PITCH_WIDTH - GOAL_AREA_TOTAL_WIDTH * SCALE_FACTOR) / 2;

  // Penalty area - measured 16.5m from inside of each goalpost
  const PENALTY_AREA_DEPTH = 16.5 * SCALE_FACTOR; // 16.5m from goal line
  const PENALTY_AREA_TOTAL_WIDTH = 16.5 * 2 + 7.32; // 16.5m from each goalpost + goal width
  const PENALTY_AREA_START_X = 0; // For left penalty area
  const PENALTY_AREA_START_Y =
    (PITCH_WIDTH - PENALTY_AREA_TOTAL_WIDTH * SCALE_FACTOR) / 2;

  // Penalty spot and arc
  const PENALTY_SPOT_DIST = 11 * SCALE_FACTOR; // 11m from midpoint between goalposts
  const PENALTY_ARC_RADIUS = 9.15 * SCALE_FACTOR; // 9.15m radius from penalty spot

  const CORNER_ARC_RADIUS = 1 * SCALE_FACTOR; // 1m radius

  const handlePitchClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const point = svg.createSVGPoint();

    // Get click coordinates relative to viewport
    point.x = e.clientX;
    point.y = e.clientY;

    // Transform coordinates to SVG space
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    // Calculate percentages with bounds checking
    const x = Math.max(0, Math.min(100, (svgPoint.x / PITCH_LENGTH) * 100));
    const y = Math.max(0, Math.min(100, (svgPoint.y / PITCH_WIDTH) * 100));

    const newEvent: Event = {
      id: Date.now().toString(),
      type: selectedEventType,
      x,
      y,
      timestamp: Date.now(),
      team: selectedTeam,
      player: selectedPlayer,
      matchId: match.id,
    };

    onEventAdded(newEvent);
  };

  const toggleEventVisibility = (eventType: Event["type"]) => {
    setVisibleEventTypes((prev) =>
      prev.includes(eventType)
        ? prev.filter((type) => type !== eventType)
        : [...prev, eventType]
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">
            {t("match.events.title")}
          </h2>

          {/* View Report Button - Only show when match is finished */}
          {match.currentHalf === "finished" && (
            <Link
              href={`/reports?matchId=${match.id}`}
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded inline-flex items-center space-x-2 transition-colors"
            >
              <BiBarChart className="h-5 w-5" />
              <span>{t("match.controls.viewReport")}</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("match.events.selectEvent")}
            </label>
            <select
              value={selectedEventType}
              onChange={(e) =>
                setSelectedEventType(e.target.value as Event["type"])
              }
              className="w-full rounded-lg border-2 border-primary p-2 text-gray-900"
              title={t("match.events.selectEvent")}
            >
              <option value="goal">{t("match.events.goal")}</option>
              <option value="shot">{t("match.events.shot")}</option>
              <option value="foul">{t("match.events.foul")}</option>
              <option value="corner">{t("match.events.corner")}</option>
              <option value="yellowCard">{t("match.events.yellowCard")}</option>
              <option value="redCard">{t("match.events.redCard")}</option>
              <option value="injury">{t("match.events.injury")}</option>
              <option value="offside">{t("match.events.offside")}</option>
              <option value="assist">{t("match.events.assist")}</option>
            </select>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("match.events.selectTeam")}
            </label>
            <select
              value={selectedTeam}
              onChange={(e) =>
                setSelectedTeam(e.target.value as "home" | "away")
              }
              className="w-full rounded-lg border-2 border-primary p-2 text-gray-900"
              title={t("match.events.selectTeam")}
            >
              <option value="home">{match.homeTeam}</option>
              <option value="away">{match.awayTeam}</option>
            </select>
          </div>

          {/* Player Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("match.events.selectPlayer")}
            </label>
            <select
              value={selectedPlayer?.id || ""}
              onChange={(e) => {
                const player = match.players.find(
                  (p) => p.id === e.target.value
                );
                setSelectedPlayer(player);
              }}
              className="w-full rounded-lg border-2 border-primary p-2 text-gray-900"
              title={t("match.events.selectPlayer")}
            >
              <option value="">{t("match.events.selectPlayer")}</option>
              {match.players
                .filter((p) => p.team === selectedTeam)
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.number})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Event Visibility Filters */}
        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {t("match.events.visibleEvents")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "goal",
              "shot",
              "foul",
              "corner",
              "yellowCard",
              "redCard",
              "injury",
              "offside",
              "assist",
            ].map((eventType) => (
              <button
                key={eventType}
                onClick={() =>
                  toggleEventVisibility(eventType as Event["type"])
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${
                    visibleEventTypes.includes(eventType as Event["type"])
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
              >
                {t(`match.events.${eventType}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Soccer Pitch */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="relative w-full" style={{ paddingBottom: "66.625%" }}>
          <svg
            className="absolute inset-0 w-full h-full cursor-crosshair"
            viewBox={`-5 -5 ${PITCH_LENGTH + 10} ${PITCH_WIDTH + 10}`}
            preserveAspectRatio="xMidYMid meet"
            onClick={handlePitchClick}
          >
            {/* Field background */}
            <rect
              x="-5"
              y="-5"
              width={PITCH_LENGTH + 10}
              height={PITCH_WIDTH + 10}
              fill="#4CAF50"
            />

            {/* Field outline */}
            <rect
              x="0"
              y="0"
              width={PITCH_LENGTH}
              height={PITCH_WIDTH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Center line */}
            <line
              x1={PITCH_LENGTH / 2}
              y1="0"
              x2={PITCH_LENGTH / 2}
              y2={PITCH_WIDTH}
              stroke="white"
              strokeWidth="2"
            />

            {/* Center circle */}
            <circle
              cx={PITCH_LENGTH / 2}
              cy={PITCH_WIDTH / 2}
              r={9.15 * SCALE_FACTOR}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Center spot */}
            <circle
              cx={PITCH_LENGTH / 2}
              cy={PITCH_WIDTH / 2}
              r="2"
              fill="white"
            />

            {/* Penalty areas */}
            <rect
              x="0"
              y={PENALTY_AREA_START_Y}
              width={PENALTY_AREA_DEPTH}
              height={PENALTY_AREA_TOTAL_WIDTH * SCALE_FACTOR}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x={PITCH_LENGTH - PENALTY_AREA_DEPTH}
              y={PENALTY_AREA_START_Y}
              width={PENALTY_AREA_DEPTH}
              height={PENALTY_AREA_TOTAL_WIDTH * SCALE_FACTOR}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Goal areas */}
            <rect
              x="0"
              y={GOAL_AREA_START_Y}
              width={GOAL_AREA_DEPTH}
              height={GOAL_AREA_TOTAL_WIDTH * SCALE_FACTOR}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x={PITCH_LENGTH - GOAL_AREA_DEPTH}
              y={GOAL_AREA_START_Y}
              width={GOAL_AREA_DEPTH}
              height={GOAL_AREA_TOTAL_WIDTH * SCALE_FACTOR}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Penalty spots */}
            <circle
              cx={PENALTY_SPOT_DIST}
              cy={PITCH_WIDTH / 2}
              r="2"
              fill="white"
            />
            <circle
              cx={PITCH_LENGTH - PENALTY_SPOT_DIST}
              cy={PITCH_WIDTH / 2}
              r="2"
              fill="white"
            />

            {/* Penalty arcs */}
            {/* Left penalty arc */}
            <path
              d={`M ${PENALTY_AREA_DEPTH} ${
                PITCH_WIDTH / 2 - PENALTY_ARC_RADIUS
              } 
                 A ${PENALTY_ARC_RADIUS} ${PENALTY_ARC_RADIUS} 0 0 1 
                 ${PENALTY_AREA_DEPTH} ${PITCH_WIDTH / 2 + PENALTY_ARC_RADIUS}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            {/* Right penalty arc */}
            <path
              d={`M ${PITCH_LENGTH - PENALTY_AREA_DEPTH} ${
                PITCH_WIDTH / 2 - PENALTY_ARC_RADIUS
              } 
                 A ${PENALTY_ARC_RADIUS} ${PENALTY_ARC_RADIUS} 0 0 0 
                 ${PITCH_LENGTH - PENALTY_AREA_DEPTH} ${
                PITCH_WIDTH / 2 + PENALTY_ARC_RADIUS
              }`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Corner arcs */}
            <path
              d={`M ${CORNER_ARC_RADIUS} 0 A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 0 ${CORNER_ARC_RADIUS}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d={`M ${
                PITCH_LENGTH - CORNER_ARC_RADIUS
              } 0 A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 ${PITCH_LENGTH} ${CORNER_ARC_RADIUS}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d={`M ${CORNER_ARC_RADIUS} ${PITCH_WIDTH} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 0 ${
                PITCH_WIDTH - CORNER_ARC_RADIUS
              }`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d={`M ${
                PITCH_LENGTH - CORNER_ARC_RADIUS
              } ${PITCH_WIDTH} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${PITCH_LENGTH} ${
                PITCH_WIDTH - CORNER_ARC_RADIUS
              }`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* 9.15m Distance Marks */}
            {/* Top Left Corner Marks */}
            <line
              x1={9.15 * SCALE_FACTOR}
              y1="-2"
              x2={9.15 * SCALE_FACTOR}
              y2="0"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="-2"
              y1={9.15 * SCALE_FACTOR}
              x2="0"
              y2={9.15 * SCALE_FACTOR}
              stroke="white"
              strokeWidth="2"
            />

            {/* Top Right Corner Marks */}
            <line
              x1={PITCH_LENGTH - 9.15 * SCALE_FACTOR}
              y1="-2"
              x2={PITCH_LENGTH - 9.15 * SCALE_FACTOR}
              y2="0"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1={PITCH_LENGTH + 2}
              y1={9.15 * SCALE_FACTOR}
              x2={PITCH_LENGTH}
              y2={9.15 * SCALE_FACTOR}
              stroke="white"
              strokeWidth="2"
            />

            {/* Bottom Left Corner Marks */}
            <line
              x1={9.15 * SCALE_FACTOR}
              y1={PITCH_WIDTH + 2}
              x2={9.15 * SCALE_FACTOR}
              y2={PITCH_WIDTH}
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="-2"
              y1={PITCH_WIDTH - 9.15 * SCALE_FACTOR}
              x2="0"
              y2={PITCH_WIDTH - 9.15 * SCALE_FACTOR}
              stroke="white"
              strokeWidth="2"
            />

            {/* Bottom Right Corner Marks */}
            <line
              x1={PITCH_LENGTH - 9.15 * SCALE_FACTOR}
              y1={PITCH_WIDTH + 2}
              x2={PITCH_LENGTH - 9.15 * SCALE_FACTOR}
              y2={PITCH_WIDTH}
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1={PITCH_LENGTH + 2}
              y1={PITCH_WIDTH - 9.15 * SCALE_FACTOR}
              x2={PITCH_LENGTH}
              y2={PITCH_WIDTH - 9.15 * SCALE_FACTOR}
              stroke="white"
              strokeWidth="2"
            />

            {/* Event markers - filtered by visibility */}
            {match.events
              .filter((event) => visibleEventTypes.includes(event.type))
              .map((event, index) => (
                <g key={index}>
                  {event.type === "goal" ? (
                    // Ball icon for goals
                    <g
                      transform={`translate(${
                        event.x * (PITCH_LENGTH / 100) - 8
                      } ${event.y * (PITCH_WIDTH / 100) - 8})`}
                    >
                      <circle
                        r="8"
                        fill={event.team === "home" ? "#3B82F6" : "#EF4444"}
                        opacity="0.8"
                      />
                      <BiBall
                        className="h-4 w-4 text-white"
                        style={{
                          transform: "translate(-8px, -8px)",
                        }}
                      />
                    </g>
                  ) : (
                    // Regular circle for other events
                    <circle
                      cx={event.x * (PITCH_LENGTH / 100)}
                      cy={event.y * (PITCH_WIDTH / 100)}
                      r="5"
                      fill={event.team === "home" ? "#3B82F6" : "#EF4444"}
                      opacity="0.8"
                    />
                  )}
                  <title>
                    {t(`match.events.${event.type}`)}
                    {event.player
                      ? `: ${event.player.name} (${event.player.number})`
                      : ""}
                  </title>
                </g>
              ))}
          </svg>
        </div>
        <div className="mt-4 text-sm text-gray-600 text-center">
          {t("match.events.clickToRecord")}
        </div>
      </div>
    </div>
  );
}
