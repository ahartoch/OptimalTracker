"use client";

import React, { useState, useEffect } from "react";
import { BiImport, BiTrash, BiDownload } from "react-icons/bi";
import { Player } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";

interface TeamSetupProps {
  onStartMatch: (
    homeTeam: string,
    awayTeam: string,
    players: Player[],
    homeSubstitutionWindows: number,
    awaySubstitutionWindows: number,
    legNumber: number,
    category: string
  ) => void;
}

export default function TeamSetup({ onStartMatch }: TeamSetupProps) {
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
  const [homeSubstitutionWindows, setHomeSubstitutionWindows] = useState(3);
  const [awaySubstitutionWindows, setAwaySubstitutionWindows] = useState(3);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importTeam, setImportTeam] = useState<"home" | "away">("home");
  const [matchLength, setMatchLength] = useState<MatchLength>(90);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("U19");
  const { t } = useLanguage();

  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem("matchCategories");
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        setCategories(parsedCategories);
      } catch (e) {
        console.error("Error loading match categories:", e);
        setCategories(["league", "cup", "friendly"]); // Default categories as fallback
      }
    } else {
      setCategories(["league", "cup", "friendly"]); // Default categories if none saved
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartMatch(
      homeTeam,
      awayTeam,
      players,
      homeSubstitutionWindows,
      awaySubstitutionWindows,
      legNumber,
      category
    );
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkPlayerList.split("\n").filter((line) => line.trim());
    const newPlayers: Player[] = [];
    let currentNumber = "";
    let currentName = "";

    // Process each line
    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Try first format: "1 Player Name"
      const singleLineFormat = line.match(/^(\d+)\s+(.+)$/);

      if (singleLineFormat) {
        // Format: "1 Player Name"
        const [, number, name] = singleLineFormat;

        // Check if player with same number already exists
        const playerExists = players.some(
          (p) => p.team === importTeam && p.number === parseInt(number)
        );

        if (!playerExists) {
          newPlayers.push({
            id: Date.now().toString() + Math.random(),
            name: name.trim(),
            number: parseInt(number),
            team: importTeam,
          });
        }
      } else if (/^\d+$/.test(trimmedLine)) {
        // If line is just a number, store it
        currentNumber = trimmedLine;
      } else if (currentNumber && trimmedLine) {
        // If we have a stored number and this line is a name
        const playerExists = players.some(
          (p) => p.team === importTeam && p.number === parseInt(currentNumber)
        );

        if (!playerExists) {
          newPlayers.push({
            id: Date.now().toString() + Math.random(),
            name: trimmedLine,
            number: parseInt(currentNumber),
            team: importTeam,
          });
        }
        currentNumber = ""; // Reset for next player
      }
    });

    // Sort players by number
    const sortedPlayers = newPlayers.sort((a, b) => a.number - b.number);

    // Check team size limit
    const currentTeamSize = players.filter((p) => p.team === importTeam).length;
    const availableSlots = 20 - currentTeamSize;

    if (sortedPlayers.length > availableSlots) {
      alert(
        t("match.setup.players.tooManyPlayers", {
          available: availableSlots,
        })
      );
    }

    const playersToAdd = sortedPlayers.slice(0, availableSlots);
    setPlayers([...players, ...playersToAdd]);
    setBulkPlayerList(""); // Clear textarea
    setShowBulkImport(false); // Close modal
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
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-black">
            {teamName || t(`match.setup.${team}Team`)}
          </h3>
          <span className="text-sm text-black">
            {t("match.setup.players.playerCount", { count: playerCount })}
          </span>
        </div>
        <div className="border rounded-lg overflow-hidden">
          {teamPlayers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {teamPlayers.map((player) => (
                <li
                  key={player.id}
                  className="p-3 flex justify-between items-center hover:bg-gray-50"
                >
                  {editingPlayer === player.id ? (
                    // Edit Mode
                    <div className="flex items-center justify-between w-full">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          className="w-16 p-1 border rounded text-black"
                          min="1"
                          max="99"
                        />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="p-1 border rounded text-black"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(player.id)}
                          className="text-green-600 hover:text-green-800"
                          title={t("match.setup.players.save")}
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-800"
                          title={t("match.setup.players.cancel")}
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
                        <span className="text-black font-medium">
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(player)}
                          className="text-blue-600 hover:text-blue-800"
                          title={t("match.setup.players.edit")}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-red-600 hover:text-red-800"
                          title={t("match.setup.players.remove")}
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
            <div className="p-4 text-center text-black">
              {t("match.setup.players.noPlayers")}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update input classes to include text-black
  const inputClasses =
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black";

  // Function to handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split("\n").filter((line) => line.trim());
      // Skip header row
      lines.shift();
      setBulkPlayerList(lines.join("\n"));
    };
    reader.readAsText(file);
  };

  // Function to download CSV template
  const downloadTemplate = () => {
    const templateContent = "Number,Name\n1,John Smith\n2,Jane Doe";
    const blob = new Blob([templateContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "player-import-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add helper function to handle age category changes
  const handleAgeCategoryChange = (category: AgeCategory) => {
    setAgeCategory(category);
    switch (category) {
      case "U14":
        setMatchLength(70);
        break;
      case "U16":
        setMatchLength(80);
        break;
      case "U19":
        setMatchLength(90);
        break;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-primary">
        {t("match.setup.title")}
      </h1>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">
              {t("match.setup.players.import")}
            </h2>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t("match.setup.players.selectTeam")}
                </label>
                <select
                  value={importTeam}
                  onChange={(e) =>
                    setImportTeam(e.target.value as "home" | "away")
                  }
                  className={inputClasses}
                  aria-label={t("match.setup.players.selectTeam")}
                  required
                >
                  <option value="" disabled>
                    {t("match.setup.players.selectTeamPrompt")}
                  </option>
                  <option value="home">
                    {homeTeam || t("match.setup.homeTeam")}
                  </option>
                  <option value="away">
                    {awayTeam || t("match.setup.awayTeam")}
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  {t("match.setup.players.importMethod")}
                </label>

                {/* Template Download */}
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <BiDownload className="h-5 w-5 mr-2" />
                  {t("match.setup.players.downloadTemplate")}
                </button>

                {/* CSV File Upload */}
                <label className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <BiImport className="h-5 w-5 mr-2" />
                  {t("match.setup.players.uploadCsv")}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {t("match.setup.players.or")}
                    </span>
                  </div>
                </div>

                {/* Existing textarea for manual input */}
                <textarea
                  value={bulkPlayerList}
                  onChange={(e) => setBulkPlayerList(e.target.value)}
                  className={`${inputClasses} min-h-[200px]`}
                  placeholder={t("match.setup.players.importFormat")}
                  aria-label={t("match.setup.players.pasteList")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkPlayerList("");
                    setImportTeam("home");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t("settings.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
                  disabled={!importTeam || !bulkPlayerList.trim()}
                >
                  {t("match.setup.players.import")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Button */}
      <button
        type="button"
        onClick={() => setShowBulkImport(true)}
        className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <BiImport className="h-5 w-5 mr-2" />
        {t("match.setup.players.import")}
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t("match.setup.homeTeam")}
            </label>
            <input
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className={inputClasses}
              placeholder={t("match.setup.enterTeamName")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t("match.setup.awayTeam")}
            </label>
            <input
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className={inputClasses}
              placeholder={t("match.setup.enterTeamName")}
              required
            />
          </div>
        </div>

        {/* Substitution Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t("match.setup.homeSubstitutionWindows")}
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={homeSubstitutionWindows}
              onChange={(e) =>
                setHomeSubstitutionWindows(Number(e.target.value))
              }
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t("match.setup.awaySubstitutionWindows")}
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={awaySubstitutionWindows}
              onChange={(e) =>
                setAwaySubstitutionWindows(Number(e.target.value))
              }
              className={inputClasses}
              required
            />
          </div>
        </div>

        {/* Leg Number */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {t("match.setup.legNumber")}
          </label>
          <input
            type="number"
            min="1"
            value={legNumber}
            onChange={(e) => setLegNumber(Number(e.target.value))}
            className={inputClasses}
            required
          />
        </div>

        {/* Match Category */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {t("match.setup.category")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClasses}
            required
            aria-label={t("match.setup.category")}
          >
            <option value="">{t("match.setup.selectCategory")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Squad Lists */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Team Squad */}
          {renderSquadList("home")}

          {/* Away Team Squad */}
          {renderSquadList("away")}
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {t("match.setup.start")}
        </button>
      </form>
    </div>
  );
}
