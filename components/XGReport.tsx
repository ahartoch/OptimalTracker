"use client";

import React, { useMemo, useRef } from "react";
import { Match } from "../lib/types";
import { BiTargetLock } from "react-icons/bi";
import { useLanguage } from "../contexts/LanguageContext";

interface XGReportProps {
  match: Match | null;
}

interface EventXG {
  eventId: string;
  xg: number;
}

export default function XGReport({ match }: XGReportProps) {
  const { t } = useLanguage();
  // Store calculated xG values
  const xgValuesRef = useRef<Map<string, number>>(new Map());

  // Calculate xG based on shot position with improved angle and distance calculations
  const calculateXG = (x: number, y: number, eventId: string): number => {
    // Check if we already calculated xG for this event
    if (xgValuesRef.current.has(eventId)) {
      return xgValuesRef.current.get(eventId)!;
    }

    // Calculate new xG value
    const pitchX = x;
    const pitchY = Math.abs(y - 50);
    const distanceToGoal = Math.sqrt(
      Math.pow(100 - pitchX, 2) + Math.pow(pitchY, 2)
    );

    const GOAL_WIDTH = 7.32;
    const PITCH_WIDTH = 75;
    const goalPostY1 = 50 + (GOAL_WIDTH / PITCH_WIDTH) * 50;
    const goalPostY2 = 50 - (GOAL_WIDTH / PITCH_WIDTH) * 50;

    const angleToPost1 = Math.atan2(Math.abs(y - goalPostY1), 100 - x);
    const angleToPost2 = Math.atan2(Math.abs(y - goalPostY2), 100 - x);
    const shotAngle = Math.abs(angleToPost1 - angleToPost2);
    const shotAngleDegrees = (shotAngle * 180) / Math.PI;

    const distanceFactor = Math.exp(-0.05 * distanceToGoal);
    const angleFactor = Math.pow(shotAngleDegrees / 90, 1.5);
    const centralityFactor = 1 - Math.abs(y - 50) / 50;

    let xg = distanceFactor * 0.4 + angleFactor * 0.4 + centralityFactor * 0.2;

    // Add small random variation (1-5%)
    const randomSeed = (parseInt(eventId.slice(-8), 16) % 100) / 100;
    xg += randomSeed * 0.04 + 0.01;

    // Clamp between 0 and 1
    xg = Math.min(Math.max(xg, 0), 1);

    // Store the calculated value
    xgValuesRef.current.set(eventId, xg);

    return xg;
  };

  // Memoize the xG calculations to maintain consistency
  const teamXG = useMemo(() => {
    if (!match) return { home: 0, away: 0 };

    return match.events
      .filter((event) => event.type === "goal" || event.type === "shot")
      .reduce(
        (acc, event) => {
          const xg = calculateXG(event.x, event.y, event.id);
          if (event.team === "home") {
            acc.home += xg;
          } else {
            acc.away += xg;
          }
          return acc;
        },
        { home: 0, away: 0 }
      );
  }, [match]);

  // If no match is provided, show a placeholder
  if (!match) {
    return (
      <div className="text-center text-gray-500">{t("reports.xg.noMatch")}</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 text-center xg-summary">
      {/* Home Team */}
      <div>
        <div className="text-lg font-semibold text-gray-700">
          {match.homeTeam}
        </div>
        <div className="text-3xl font-bold text-primary">
          {teamXG.home.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          {t("reports.xg.actual")}: {match.homeScore}
        </div>
      </div>

      {/* VS */}
      <div className="flex items-center justify-center">
        <span className="text-xl font-bold text-gray-400">
          {t("reports.xg.vs")}
        </span>
      </div>

      {/* Away Team */}
      <div>
        <div className="text-lg font-semibold text-gray-700">
          {match.awayTeam}
        </div>
        <div className="text-3xl font-bold text-primary">
          {teamXG.away.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          {t("reports.xg.actual")}: {match.awayScore}
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="col-span-3 mt-4 text-sm text-gray-600">
        <p>
          {teamXG.home > match.homeScore
            ? t("reports.xg.performance.underperformed", {
                team: match.homeTeam,
              })
            : t("reports.xg.performance.overperformed", {
                team: match.homeTeam,
              })}
        </p>
        <p>
          {teamXG.away > match.awayScore
            ? t("reports.xg.performance.underperformed", {
                team: match.awayTeam,
              })
            : t("reports.xg.performance.overperformed", {
                team: match.awayTeam,
              })}
        </p>
      </div>
    </div>
  );
}
