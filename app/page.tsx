"use client";

import Link from "next/link";
import { BiFootball, BiBarChart } from "react-icons/bi";
import { useLanguage } from "../contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen">
      {/* Background Video Container */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          aria-label="Background soccer video"
        >
          <source src="/soccer-background.mp4" type="video/mp4" />
          <track kind="captions" />
          <p>Your browser does not support the video tag.</p>
        </video>
      </div>

      {/* Content Container */}
      <div className="relative z-20 min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Main Content Card */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 lg:p-12 rounded-xl shadow-2xl mb-8 lg:mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-primary flex items-center justify-center gap-4">
              <BiFootball className="h-10 w-10 lg:h-14 lg:w-14" />
              <span>{t("home.title")}</span>
            </h1>

            <p className="text-xl lg:text-2xl mb-12 text-gray-700 text-center">
              {t("home.subtitle")}
            </p>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/record"
                className="w-full sm:w-auto bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-lg transition duration-300 flex items-center justify-center gap-3 text-xl min-w-[240px]"
              >
                <BiFootball className="h-7 w-7" />
                <span>{t("navigation.record")}</span>
              </Link>
              <Link
                href="/reports"
                className="w-full sm:w-auto bg-secondary hover:bg-primary text-white font-bold py-4 px-8 rounded-lg transition duration-300 flex items-center justify-center gap-3 text-xl min-w-[240px]"
              >
                <BiBarChart className="h-7 w-7" />
                <span>{t("navigation.reports")}</span>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm p-6 lg:p-8 rounded-lg shadow-xl">
              <h2 className="text-xl lg:text-2xl font-bold mb-3 text-primary">
                {t("home.features.recording.title")}
              </h2>
              <p className="text-gray-700 lg:text-lg">
                {t("home.features.recording.description")}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 lg:p-8 rounded-lg shadow-xl">
              <h2 className="text-xl lg:text-2xl font-bold mb-3 text-primary">
                {t("home.features.players.title")}
              </h2>
              <p className="text-gray-700 lg:text-lg">
                {t("home.features.players.description")}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 lg:p-8 rounded-lg shadow-xl sm:col-span-2 lg:col-span-1">
              <h2 className="text-xl lg:text-2xl font-bold mb-3 text-primary">
                {t("home.features.analysis.title")}
              </h2>
              <p className="text-gray-700 lg:text-lg">
                {t("home.features.analysis.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
