"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BiHome } from "react-icons/bi";
import TeamSetup from "../../components/TeamSetup";
import SoccerPitch from "../../components/SoccerPitch";
import ScoreBoard from "../../components/ScoreBoard";
import Timer from "../../components/Timer";
import EventList from "../../components/EventList";
import SubstitutionTracker from "../../components/SubstitutionTracker";
import { Match, Event, Player } from "../../lib/types";
import { useLocalStorage } from "../../lib/useLocalStorage";
import { useLanguage } from "../../contexts/LanguageContext";

export default function RecordPage() {
  const [matches, setMatches] = useLocalStorage<Match[]>("soccerMatches", []);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);
  const { t } = useLanguage();

  const handleStartMatch = (
    homeTeam: string,
    awayTeam: string,
    players: Player[],
    legNumber: number
  ) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      currentHalf: 1,
      homeSubstitutionWindows: 0,
      awaySubstitutionWindows: 0,
      startTime: Date.now(),
      events: [],
      players: players,
      legNumber: legNumber,
    };
    setCurrentMatch(newMatch);
    setMatches([...matches, newMatch]);
    setIsRunning(false);
  };

  const handleStartTimer = () => {
    setIsRunning(true);
    setShouldStartTimer(true);
  };

  const handleEventAdded = (event: Event) => {
    if (!currentMatch) return;

    const updatedMatch = {
      ...currentMatch,
      events: [...currentMatch.events, event],
    };

    if (event.type === "goal") {
      if (event.team === "home") {
        updatedMatch.homeScore++;
      } else {
        updatedMatch.awayScore++;
      }
    }

    setCurrentMatch(updatedMatch);
    setMatches(
      matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };

  const handleSubstitutionWindowRequested = (team: "home" | "away") => {
    if (!currentMatch) return;

    const updatedMatch = {
      ...currentMatch,
      homeSubstitutionWindows:
        team === "home"
          ? currentMatch.homeSubstitutionWindows + 1
          : currentMatch.homeSubstitutionWindows,
      awaySubstitutionWindows:
        team === "away"
          ? currentMatch.awaySubstitutionWindows + 1
          : currentMatch.awaySubstitutionWindows,
    };

    setCurrentMatch(updatedMatch);
    setMatches(
      matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };

  const handleHalfChange = () => {
    if (!currentMatch) return;
    const updatedMatch = {
      ...currentMatch,
      currentHalf: 2 as const,
    };
    setCurrentMatch(updatedMatch);
    setMatches(
      matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };

  const handleMatchEnd = () => {
    if (!currentMatch) return;
    const updatedMatch = {
      ...currentMatch,
      currentHalf: "finished" as const,
    };
    setCurrentMatch(updatedMatch);
    setMatches(
      matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {!currentMatch ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-primary mb-6">
              {t("match.setup.title")}
            </h1>
            <TeamSetup onSetupComplete={handleStartMatch} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Timer
                isRunning={isRunning}
                currentHalf={currentMatch.currentHalf}
                onStartMatch={handleStartTimer}
              />
              <ScoreBoard match={currentMatch} />
              <SubstitutionTracker
                match={currentMatch}
                onSubstitutionWindowRequested={
                  handleSubstitutionWindowRequested
                }
              />
            </div>

            {/* Match Controls */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex justify-center gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
                disabled={currentMatch.currentHalf === "finished"}
              >
                {t(`match.controls.${isRunning ? "pause" : "resume"}`)}
              </button>
              {currentMatch.currentHalf === 1 && (
                <button
                  onClick={handleHalfChange}
                  className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
                >
                  {t("match.controls.secondHalf")}
                </button>
              )}
              {currentMatch.currentHalf === 2 && (
                <button
                  onClick={handleMatchEnd}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  {t("match.controls.endMatch")}
                </button>
              )}
            </div>

            {/* Soccer Pitch */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <SoccerPitch
                match={currentMatch}
                onEventAdded={handleEventAdded}
              />
            </div>

            {/* Event List */}
            <div className="grid grid-cols-1 gap-6">
              <EventList
                events={currentMatch.events}
                legNumber={currentMatch.legNumber}
              />
            </div>
          </div>
        )}

        {/* Home Button */}
        <Link
          href="/"
          className="fixed bottom-4 right-4 bg-primary hover:bg-secondary text-white p-3 rounded-full shadow-lg transition-colors duration-300"
          aria-label={t("navigation.home")}
        >
          <BiHome className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
