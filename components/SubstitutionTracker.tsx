"use client";

import React from "react";
import { Match } from "../lib/types";
import { BiTransfer } from "react-icons/bi";
import { useLanguage } from "../contexts/LanguageContext";

interface SubstitutionTrackerProps {
  match: Match;
  onSubstitutionWindowRequested: (team: "home" | "away") => void;
}

export default function SubstitutionTracker({
  match,
  onSubstitutionWindowRequested,
}: SubstitutionTrackerProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
        <BiTransfer className="h-6 w-6" />
        {t("match.substitutions.title")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Home Team */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">{match.homeTeam}</h3>
            <span className="text-sm text-gray-500">
              {t("match.substitutions.windowsUsed", {
                count: match.homeSubstitutionWindows,
              }).replace("{{count}}", match.homeSubstitutionWindows.toString())}
            </span>
          </div>
          <button
            onClick={() => onSubstitutionWindowRequested("home")}
            disabled={
              match.homeSubstitutionWindows >= 3 ||
              match.currentHalf === "finished"
            }
            className="w-full bg-primary hover:bg-secondary disabled:bg-gray-300 
                     text-white font-semibold py-2 px-4 rounded-lg transition 
                     duration-300 flex items-center justify-center gap-2"
          >
            <BiTransfer className="h-5 w-5" />
            {t("match.substitutions.request")}
          </button>
          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(match.homeSubstitutionWindows / 3) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Away Team */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">{match.awayTeam}</h3>
            <span className="text-sm text-gray-500">
              {t("match.substitutions.windowsUsed", {
                count: match.awaySubstitutionWindows,
              }).replace("{{count}}", match.awaySubstitutionWindows.toString())}
            </span>
          </div>
          <button
            onClick={() => onSubstitutionWindowRequested("away")}
            disabled={
              match.awaySubstitutionWindows >= 3 ||
              match.currentHalf === "finished"
            }
            className="w-full bg-primary hover:bg-secondary disabled:bg-gray-300 
                     text-white font-semibold py-2 px-4 rounded-lg transition 
                     duration-300 flex items-center justify-center gap-2"
          >
            <BiTransfer className="h-5 w-5" />
            {t("match.substitutions.request")}
          </button>
          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(match.awaySubstitutionWindows / 3) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {match.currentHalf === "finished" && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          {t("match.substitutions.matchFinished")}
        </div>
      )}
    </div>
  );
}
