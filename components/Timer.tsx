"use client";

import React, { useState, useEffect } from "react";
import { BiStopwatch, BiPlay } from "react-icons/bi";
import { useLanguage } from "../contexts/LanguageContext";

interface TimerProps {
  isRunning: boolean;
  currentHalf: 1 | 2 | "finished";
  matchLength?: 70 | 80 | 90;
  onHalfTimeAlert?: () => void;
  onStartMatch?: () => void;
}

export default function Timer({
  isRunning,
  currentHalf,
  matchLength = 90,
  onHalfTimeAlert,
  onStartMatch,
}: TimerProps) {
  const [time, setTime] = useState(0);
  const [injuryTime, setInjuryTime] = useState(0);
  const [isInjuryTime, setIsInjuryTime] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const { t } = useLanguage();

  const halfLength = matchLength / 2;
  const warningTime = halfLength - 5; // 5 minutes before end of half

  useEffect(() => {
    // Reset timer when changing halves
    if (currentHalf === 2) {
      setTime(0);
      setInjuryTime(0);
      setIsInjuryTime(false);
    }
  }, [currentHalf]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && currentHalf !== "finished") {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;

          // Check if we're entering injury time
          if (newTime === halfLength * 60) {
            setIsInjuryTime(true);
            setInjuryTime(0);
          }

          // Check if we're entering warning period
          if (newTime === warningTime * 60) {
            onHalfTimeAlert?.();
          }

          return newTime;
        });

        // Update injury time if active
        if (isInjuryTime) {
          setInjuryTime((prev) => prev + 1);
          // Flash effect in injury time
          setIsFlashing((prev) => !prev);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isRunning,
    currentHalf,
    halfLength,
    warningTime,
    isInjuryTime,
    onHalfTimeAlert,
  ]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (isInjuryTime) return isFlashing ? "text-red-600" : "text-red-500";
    if (time >= warningTime * 60) return "text-yellow-600";
    return "text-primary";
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-center gap-3">
        <BiStopwatch className={`h-6 w-6 sm:h-8 sm:w-8 ${getTimerColor()}`} />
        <div className="text-center">
          <div className="text-sm sm:text-base font-medium text-gray-600 mb-1">
            {currentHalf === "finished"
              ? t("match.status.finished")
              : currentHalf === 1
              ? t("match.status.firstHalf")
              : t("match.status.secondHalf")}
          </div>
          <div
            className={`text-2xl sm:text-4xl font-bold font-mono ${getTimerColor()}`}
          >
            {formatTime(time)}
          </div>
          {isInjuryTime && (
            <div className="mt-2 text-lg font-bold text-red-500">
              +{Math.floor(injuryTime / 60)}:
              {(injuryTime % 60).toString().padStart(2, "0")}
            </div>
          )}
        </div>
      </div>

      {/* Match Length Selector and Start Button */}
      {!isRunning && time === 0 && currentHalf === 1 && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("match.settings.matchLength")}
            </label>
            <select
              value={matchLength}
              onChange={(e) =>
                onMatchLengthChange?.(Number(e.target.value) as 70 | 80 | 90)
              }
              className="w-full p-2 border rounded-md"
              title={t("match.settings.matchLength")}
            >
              <option value={70}>70 {t("match.settings.minutes")}</option>
              <option value={80}>80 {t("match.settings.minutes")}</option>
              <option value={90}>90 {t("match.settings.minutes")}</option>
            </select>
          </div>

          {/* Start Match Button */}
          <button
            onClick={onStartMatch}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <BiPlay className="h-5 w-5" />
            {t("match.controls.startTimer")}
          </button>
        </div>
      )}
    </div>
  );
}
