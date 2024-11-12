"use client";

import React from "react";
import Link from "next/link";
import { BiHome, BiFootball, BiBarChart } from "react-icons/bi";
import Settings from "./Settings";
import ClubEmblem from "./ClubEmblem";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navigation() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#2563eb] shadow-md">
      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <ClubEmblem />
            <ul className="flex space-x-8 text-lg font-semibold">
              <li>
                <Link
                  href="/"
                  className="text-[#ffffff] hover:text-[#fbbf24] transition-colors duration-200"
                >
                  {t("navigation.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/record"
                  className="text-[#ffffff] hover:text-[#fbbf24] transition-colors duration-200"
                >
                  {t("navigation.record")}
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="text-[#ffffff] hover:text-[#fbbf24] transition-colors duration-200"
                >
                  {t("navigation.reports")}
                </Link>
              </li>
            </ul>
            <Settings />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <ClubEmblem />
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-[#ffffff] hover:text-[#fbbf24] p-2"
                aria-label="Home"
              >
                <BiHome className="h-6 w-6" />
              </Link>
              <Link
                href="/record"
                className="text-[#ffffff] hover:text-[#fbbf24] p-2"
                aria-label="Record Events"
              >
                <BiFootball className="h-6 w-6" />
              </Link>
              <Link
                href="/reports"
                className="text-[#ffffff] hover:text-[#fbbf24] p-2"
                aria-label="View Reports"
              >
                <BiBarChart className="h-6 w-6" />
              </Link>
              <Settings />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
