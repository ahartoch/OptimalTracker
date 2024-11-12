"use client";

import React from "react";
import { Match } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface ScoreBoardProps {
  match: Match;
}

export default function ScoreBoard({ match }: ScoreBoardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div
            className="text-sm sm:text-base font-medium text-gray-600 truncate"
            title={match.homeTeam}
          >
            {match.homeTeam}
          </div>
          <div className="text-2xl sm:text-4xl font-bold text-primary">
            {match.homeScore}
          </div>
          <div className="text-sm text-gray-500">{t("match.score.home")}</div>
        </div>

        {/* Separator */}
        <div className="text-2xl sm:text-4xl font-bold text-gray-400">
          {t("match.score.vs")}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div
            className="text-sm sm:text-base font-medium text-gray-600 truncate"
            title={match.awayTeam}
          >
            {match.awayTeam}
          </div>
          <div className="text-2xl sm:text-4xl font-bold text-primary">
            {match.awayScore}
          </div>
          <div className="text-sm text-gray-500">{t("match.score.away")}</div>
        </div>
      </div>
    </div>
  );
}
