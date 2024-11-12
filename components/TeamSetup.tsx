"use client";

import React, { useState, useEffect } from "react";
import { BiImport, BiTrash } from "react-icons/bi";
import { Player } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface TeamSetupProps {
  onSetupComplete: (
    homeTeam: string,
    awayTeam: string,
    players: Player[],
    legNumber: number,
    category: string
  ) => void;
}

export default function TeamSetup({ onSetupComplete }: TeamSetupProps) {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [bulkPlayerList, setBulkPlayerList] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [legNumber, setLegNumber] = useState(1);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem("matchCategories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeTeam && awayTeam && category) {
      onSetupComplete(homeTeam, awayTeam, players, legNumber, category);
    }
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkPlayerList.split("\n").filter((line) => line.trim());
    const newPlayers: Player[] = [];
    let currentNumber = "";

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (/^\d+$/.test(trimmedLine)) {
        // If line is a number, store it
        currentNumber = trimmedLine;
      } else if (currentNumber && trimmedLine) {
        // If we have a number and this line is a name
        newPlayers.push({
          id: Date.now().toString() + Math.random(),
          name: trimmedLine,
          number: parseInt(currentNumber),
          team: selectedTeam,
        });
        currentNumber = ""; // Reset for next player
      }
    });

    // Sort players by number before adding
    const sortedPlayers = newPlayers.sort((a, b) => a.number - b.number);

    // Check team player limit (20 players per team)
    const currentTeamPlayers = players.filter(
      (p) => p.team === selectedTeam
    ).length;
    const availableSlots = 20 - currentTeamPlayers;
    const playersToAdd = sortedPlayers.slice(0, availableSlots);

    setPlayers([...players, ...playersToAdd]);
    setBulkPlayerList(""); // Clear the textarea
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const startEditing = (player: Player) => {
    setEditingPlayer(player.id);
    setEditName(player.name);
    setEditNumber(player.number.toString());
  };

  const saveEdit = (playerId: string) => {
    if (!editName.trim() || !editNumber.trim()) return;

    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? { ...player, name: editName, number: parseInt(editNumber) }
          : player
      )
    );
    setEditingPlayer(null);
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
    setEditName("");
    setEditNumber("");
  };

  const renderSquadList = (team: "home" | "away") => {
    const teamPlayers = players
      .filter((p) => p.team === team)
      .sort((a, b) => a.number - b.number);

    const teamName = team === "home" ? homeTeam : awayTeam;
    const playerCount = teamPlayers.length;

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-primary">
            {teamName || `${team.charAt(0).toUpperCase() + team.slice(1)} Team`}
          </h3>
          <span className="text-sm text-gray-500">
            {playerCount}/20 Players
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-200">
          {teamPlayers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {teamPlayers.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  {editingPlayer === player.id ? (
                    // Edit Mode
                    <div className="flex items-center justify-between w-full">
                      <div className="flex gap-2 flex-1">
                        <input
                          type="number"
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                          placeholder="#"
                        />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 p-1 border rounded"
                          placeholder="Player name"
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => saveEdit(player.id)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
                          aria-label="Save changes"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-50"
                          aria-label="Cancel editing"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-center space-x-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">
                          {player.number}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(player)}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                          aria-label={`Edit ${player.name}`}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                          aria-label={`Remove ${player.name}`}
                        >
                          <BiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No players added yet
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Team Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("match.setup.homeTeam")}
          </label>
          <input
            type="text"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder={t("match.setup.enterTeamName")}
            required
          />
        </div>

        {/* Away Team Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("match.setup.awayTeam")}
          </label>
          <input
            type="text"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder={t("match.setup.enterTeamName")}
            required
          />
        </div>
      </div>

      {/* Match Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leg Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("match.setup.legNumber")}
          </label>
          <input
            type="number"
            min="1"
            value={legNumber}
            onChange={(e) => setLegNumber(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Match Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Import Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-lg font-semibold text-primary mb-2">
            Select Team for Import
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value as "home" | "away")}
            className="w-full rounded-lg border-2 border-primary p-3 text-lg"
            aria-label="Select team for player import"
          >
            <option value="home">{homeTeam || "Home Team"}</option>
            <option value="away">{awayTeam || "Away Team"}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Player List (Name and Number on separate lines)
          </label>
          <textarea
            value={bulkPlayerList}
            onChange={(e) => setBulkPlayerList(e.target.value)}
            className="w-full rounded-lg border-2 border-primary p-3 h-[150px] text-base mb-4"
            placeholder="Example:
John Smith
10
James Wilson
7"
          />
          <button
            onClick={handleBulkImport}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            <BiImport className="h-5 w-5" />
            Import Players
          </button>
        </div>
      </div>

      {/* Squad Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSquadList("home")}
        {renderSquadList("away")}
      </div>

      {/* Start Match Button */}
      <button
        onClick={handleSubmit}
        disabled={!homeTeam || !awayTeam || players.length === 0}
        className="w-full bg-primary hover:bg-secondary disabled:bg-gray-300 
                 text-white font-bold py-4 px-8 rounded-lg transition duration-300 
                 flex items-center justify-center gap-3 text-xl shadow-lg"
      >
        Start Match
      </button>
    </form>
  );
}
