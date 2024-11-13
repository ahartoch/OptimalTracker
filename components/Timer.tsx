"use client";

import React, { useState, useEffect } from "react";
import { BiStopwatch, BiPlay } from "react-icons/bi";
import { useLanguage } from "../contexts/LanguageContext";

interface TimerProps {
  isRunning: boolean;
  currentHalf: 1 | 2 | "finished";
  matchLength: number;
  onHalfEnd?: () => void;
  onMatchEnd?: () => void;
}

export default function Timer({
  isRunning,
  currentHalf,
  matchLength,
  onHalfEnd,
  onMatchEnd,
}: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const { t } = useLanguage();
  const halfLength = (matchLength * 60) / 2; // Convert minutes to seconds and split in half

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && currentHalf !== "finished") {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;

          // Check for half/match end
          if (newSeconds >= halfLength) {
            if (currentHalf === 1) {
              onHalfEnd?.();
            } else if (currentHalf === 2) {
              onMatchEnd?.();
            }
          }

          return newSeconds;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, currentHalf, halfLength, onHalfEnd, onMatchEnd]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (currentHalf) {
      case 1:
        return t("match.status.firstHalf");
      case 2:
        return t("match.status.secondHalf");
      case "finished":
        return t("match.status.finished");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-black">{getStatusText()}</h2>
        {isRunning ? (
          <BiStopwatch className="h-6 w-6 text-primary" />
        ) : (
          <BiPlay className="h-6 w-6 text-primary" />
        )}
      </div>
      <div className="text-3xl font-bold text-center text-black">
        {formatTime(seconds)}
      </div>
      <div className="text-sm text-center text-gray-600 mt-1">
        {currentHalf === 1 ? "1st" : "2nd"} Half - {matchLength / 2} minutes
      </div>
    </div>
  );
}
