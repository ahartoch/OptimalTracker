"use client";

import React, { useState } from "react";
import { Player, Match } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface PlayerManagementProps {
  match: Match;
  onPlayerAdded: (player: Player) => void;
}

export default function PlayerManagement({
  match,
  onPlayerAdded,
}: PlayerManagementProps) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [team, setTeam] = useState<"home" | "away">("home");
  const { t } = useLanguage();
  const [lastActionTime, setLastActionTime] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && number) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name,
        number: parseInt(number),
        team,
      };
      onPlayerAdded(newPlayer);
      setName("");
      setNumber("");
    }
  };

  const handleAddPlayer = () => {
    // Rate limit to prevent spam
    const now = Date.now();
    if (now - lastActionTime < 500) return; // 500ms cooldown
    setLastActionTime(now);

    // ... rest of add player logic
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-primary">
        {t("match.players.title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("match.events.selectTeam")}
          </label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value as "home" | "away")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            title="Select team"
          >
            <option value="home">{match.homeTeam}</option>
            <option value="away">{match.awayTeam}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("match.players.name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder={t("match.players.enterName")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("match.players.number")}
          </label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder={t("match.players.enterNumber")}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {t("match.players.add")}
        </button>
      </form>
    </div>
  );
}
