"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Match, Player, GameEvent } from "@/lib/types";
import TeamSetup from "@/components/TeamSetup";
import SoccerPitch from "@/components/SoccerPitch";
import ScoreBoard from "@/components/ScoreBoard";
import EventList from "@/components/EventList";
import { useLanguage } from "@/contexts/LanguageContext";
import { BiFootball } from "react-icons/bi";
import SubstitutionTracker from "@/components/SubstitutionTracker";
import Timer from "@/components/Timer";

export default function RecordPage() {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);
  const { t } = useLanguage();

  const handleStartMatch = (
    homeTeam: string,
    awayTeam: string,
    players: Player[],
    homeSubstitutionWindows: number,
    awaySubstitutionWindows: number,
    legNumber: number,
    category: string,
    matchLength: number,
    ageCategory: string
  ) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      currentHalf: 1,
      homeSubstitutionWindows,
      awaySubstitutionWindows,
      startTime: Date.now(),
      events: [],
      players,
      legNumber,
      category,
      matchLength,
      ageCategory,
    };

    setCurrentMatch(newMatch);
  };

  const handleHalfEnd = () => {
    if (currentMatch && currentMatch.currentHalf === 1) {
      const updatedMatch = {
        ...currentMatch,
        currentHalf: 2,
      };
      setCurrentMatch(updatedMatch);
      setIsRunning(false);
      setShouldStartTimer(false);

      // Update match in localStorage
      const matches = JSON.parse(localStorage.getItem("matches") || "[]");
      const updatedMatches = matches.map((m: Match) =>
        m.id === updatedMatch.id ? updatedMatch : m
      );
      localStorage.setItem("matches", JSON.stringify(updatedMatches));
    }
  };

  const handleMatchEnd = () => {
    if (currentMatch) {
      const updatedMatch = {
        ...currentMatch,
        currentHalf: "finished" as const,
      };
      setCurrentMatch(updatedMatch);
      setIsRunning(false);
      setShouldStartTimer(false);

      // Update match in localStorage
      const matches = JSON.parse(localStorage.getItem("matches") || "[]");
      const updatedMatches = matches.map((m: Match) =>
        m.id === updatedMatch.id ? updatedMatch : m
      );
      localStorage.setItem("matches", JSON.stringify(updatedMatches));
    }
  };

  const handleEventAdded = (event: GameEvent) => {
    if (currentMatch) {
      const updatedMatch = {
        ...currentMatch,
        events: [...currentMatch.events, event],
      };

      // Update scores if it's a goal
      if (event.type === "goal") {
        if (event.team === "home") {
          updatedMatch.homeScore++;
        } else {
          updatedMatch.awayScore++;
        }
      }

      setCurrentMatch(updatedMatch);

      // Update match in localStorage
      const matches = JSON.parse(localStorage.getItem("matches") || "[]");
      const updatedMatches = matches.map((m: Match) =>
        m.id === updatedMatch.id ? updatedMatch : m
      );
      localStorage.setItem("matches", JSON.stringify(updatedMatches));
    }
  };

  const handleStartTimer = () => {
    setShouldStartTimer(true);
    setIsRunning(true);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {!currentMatch ? (
        <TeamSetup onStartMatch={handleStartMatch} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">
              {t("match.title")}
            </h1>
            <Link
              href="/reports"
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded inline-flex items-center space-x-2"
            >
              <BiFootball className="h-5 w-5" />
              <span>{t("navigation.reports")}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <ScoreBoard match={currentMatch} />
                </div>
                <div className="flex-1">
                  {!shouldStartTimer ? (
                    <button
                      onClick={handleStartTimer}
                      className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 px-6 rounded transition-colors"
                    >
                      {t("match.controls.startTimer")}
                    </button>
                  ) : (
                    <Timer
                      isRunning={isRunning}
                      currentHalf={currentMatch.currentHalf}
                      matchLength={currentMatch.matchLength}
                      onHalfEnd={handleHalfEnd}
                      onMatchEnd={handleMatchEnd}
                    />
                  )}
                </div>
              </div>

              <SoccerPitch
                match={currentMatch}
                onEventAdded={handleEventAdded}
                isRunning={shouldStartTimer && isRunning}
              />

              <EventList
                events={currentMatch.events}
                legNumber={currentMatch.legNumber}
              />
            </div>

            <div className="space-y-6">
              <SubstitutionTracker
                match={currentMatch}
                onSubstitutionWindowRequested={() => {}}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
