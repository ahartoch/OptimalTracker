"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BiCog, BiUpload, BiGlobe, BiSave, BiTrash } from "react-icons/bi";
import { useLanguage } from "../contexts/LanguageContext";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [clubEmblem, setClubEmblem] = useState<string | null>(null);
  const [newClubEmblem, setNewClubEmblem] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const savedCategories = localStorage.getItem("matchCategories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      localStorage.setItem(
        "matchCategories",
        JSON.stringify(updatedCategories)
      );
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    const updatedCategories = categories.filter(
      (cat) => cat !== categoryToRemove
    );
    setCategories(updatedCategories);
    localStorage.setItem("matchCategories", JSON.stringify(updatedCategories));
  };

  useEffect(() => {
    const savedEmblem = localStorage.getItem("clubEmblem");
    if (savedEmblem) {
      setClubEmblem(savedEmblem);
      setNewClubEmblem(savedEmblem);
    }
    setTempLanguage(language);
  }, [language]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewClubEmblem(base64String);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setTempLanguage(newLanguage);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (tempLanguage !== language) {
      setLanguage(tempLanguage);
    }

    if (newClubEmblem !== clubEmblem) {
      localStorage.setItem("clubEmblem", newClubEmblem || "");
      setClubEmblem(newClubEmblem);
    }

    setHasChanges(false);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempLanguage(language);
    setNewClubEmblem(clubEmblem);
    setHasChanges(false);
    setIsOpen(false);
  };

  const handleClearData = () => {
    localStorage.removeItem("soccerMatches");
    setShowClearConfirm(false);
    // Optional: Show success message
  };

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={t("settings.title")}
      >
        <BiCog className="h-6 w-6 text-white" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t("settings.title")}
            </h3>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <BiGlobe className="h-5 w-5" />
                  {t("settings.language")}
                </div>
              </label>
              <select
                value={tempLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-2 border rounded-md"
                aria-label={t("settings.language")}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ca">Català</option>
              </select>
            </div>

            {/* Club Emblem Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <BiUpload className="h-5 w-5" />
                  {t("settings.clubEmblem")}
                </div>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                  {newClubEmblem ? (
                    <Image
                      src={newClubEmblem}
                      alt={t("settings.clubEmblem")}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="bg-primary hover:bg-secondary text-white text-sm py-2 px-4 rounded cursor-pointer text-center">
                    {t("settings.uploadImage")}
                  </div>
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {t("settings.imageRecommendation")}
              </p>
            </div>

            {/* Clear Data Section */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("settings.clearData.title")}
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                {t("settings.clearData.description")}
              </p>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded flex items-center justify-center gap-2"
              >
                <BiTrash className="h-4 w-4" />
                {t("settings.clearData.button")}
              </button>
            </div>

            {/* Category Management Section */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Match Categories
              </h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Enter new category"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{cat}</span>
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <BiSave className="h-4 w-4" />
                {t("settings.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {t("settings.clearData.confirmTitle")}
            </h4>
            <p className="text-gray-600 mb-6">
              {t("settings.clearData.confirmMessage")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t("settings.clearData.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
