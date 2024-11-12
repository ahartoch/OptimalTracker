"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function ClubEmblem() {
  const [emblem, setEmblem] = useState<string | null>(null);

  useEffect(() => {
    const savedEmblem = localStorage.getItem("clubEmblem");
    if (savedEmblem) {
      setEmblem(savedEmblem);
    }
  }, []);

  return (
    <div className="flex items-center">
      <div className="w-12 h-12 bg-white rounded-full mr-4 flex items-center justify-center">
        {emblem ? (
          <Image
            src={emblem}
            alt="Club Emblem"
            width={40}
            height={40}
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="text-gray-400 text-sm">Logo</div>
        )}
      </div>
    </div>
  );
}
