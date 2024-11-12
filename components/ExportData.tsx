"use client";

import React from "react";
import { Match } from "../lib/types";
import { useLanguage } from "../contexts/LanguageContext";
import jsPDF from "jspdf";
import { BiDownload } from "react-icons/bi";
import html2canvas from "html2canvas";

interface ExportDataProps {
  match: Match;
  heatmapRefs: {
    shots: React.RefObject<SVGSVGElement>;
    fouls: React.RefObject<SVGSVGElement>;
    goals: React.RefObject<SVGSVGElement>;
    xg: React.RefObject<SVGSVGElement>;
  };
  statsRef: React.RefObject<HTMLDivElement>;
  events: Event[];
}

export default function ExportData({
  match,
  heatmapRefs,
  statsRef,
  events,
}: ExportDataProps) {
  const { t } = useLanguage();

  const svgToDataUrl = (svg: SVGSVGElement): string => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    return URL.createObjectURL(svgBlob);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const addRotatedHeatmap = async (
    pdf: jsPDF,
    ref: React.RefObject<SVGSVGElement>,
    title: string
  ) => {
    if (ref.current) {
      const url = svgToDataUrl(ref.current);
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");

      // Set canvas dimensions to handle rotation
      canvas.width = img.height * 4;
      canvas.height = img.width * 4;
      const ctx = canvas.getContext("2d")!;

      // Calculate page dimensions and margins
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const titleHeight = 20;

      // Calculate available space
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2 - titleHeight;

      // Clear canvas and prepare for drawing
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate 90 degrees
      ctx.rotate(Math.PI / 2);

      // Scale up for quality while maintaining aspect ratio
      const scale = 4;
      ctx.scale(scale, scale);

      // Draw image centered
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      // Enhance xG text visibility
      const svgText = ref.current.querySelectorAll("text");
      if (svgText.length > 0) {
        ctx.textAlign = "center";
        ctx.font = "bold 14px Arial";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.fillStyle = "white";

        svgText.forEach((textElement) => {
          const x = parseFloat(textElement.getAttribute("x") || "0");
          const y = parseFloat(textElement.getAttribute("y") || "0");
          const text = textElement.textContent || "";

          // Draw text stroke
          ctx.strokeText(text, x, y);
          // Draw text fill
          ctx.fillText(text, x, y);
        });
      }

      // Restore context
      ctx.restore();

      // Add new page and title
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(title, margin, margin);

      // Calculate dimensions to fit the entire pitch
      const imageRatio = canvas.width / canvas.height;
      const maxWidth = availableWidth;
      const maxHeight = availableHeight;

      let finalWidth, finalHeight;

      if (imageRatio > maxWidth / maxHeight) {
        finalWidth = maxWidth;
        finalHeight = maxWidth / imageRatio;
      } else {
        finalHeight = maxHeight;
        finalWidth = maxHeight * imageRatio;
      }

      // Center the image on the page
      const xPos = margin + (availableWidth - finalWidth) / 2;
      const yPos = margin + titleHeight + (availableHeight - finalHeight) / 2;

      // Add the heat map
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        xPos,
        yPos,
        finalWidth,
        finalHeight
      );

      URL.revokeObjectURL(url);
    }
  };

  const exportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yPos = 20;

    // Add title and match details
    pdf.setFontSize(20);
    pdf.text(`${match.homeTeam} vs ${match.awayTeam}`, 20, yPos);
    yPos += 15;

    // Add match details
    pdf.setFontSize(12);
    pdf.text(`${t("match.setup.legNumber")}: ${match.legNumber}`, 20, yPos);
    pdf.text(
      `${t("match.score.home")}: ${match.homeScore} - ${match.awayScore} :${t(
        "match.score.away"
      )}`,
      100,
      yPos
    );
    yPos += 15;

    // Add player lists
    pdf.setFontSize(14);
    pdf.text(t("match.setup.homeTeam"), 20, yPos);
    yPos += 7;

    // Home team players
    pdf.setFontSize(10);
    const homePlayers = match.players.filter((p) => p.team === "home");
    homePlayers.forEach((player) => {
      pdf.text(`${player.number}. ${player.name}`, 25, yPos);
      yPos += 5;
    });
    yPos += 5;

    // Away team players
    pdf.setFontSize(14);
    pdf.text(t("match.setup.awayTeam"), 20, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    const awayPlayers = match.players.filter((p) => p.team === "away");
    awayPlayers.forEach((player) => {
      pdf.text(`${player.number}. ${player.name}`, 25, yPos);
      yPos += 5;
    });
    yPos += 10;

    // Add xG summary section (without the shot map)
    if (statsRef.current) {
      const xgSummaryDiv = statsRef.current.querySelector(".grid"); // Get only the summary grid
      if (xgSummaryDiv) {
        pdf.setFontSize(14);
        pdf.text(t("reports.xg.title"), 20, yPos);
        yPos += 15;

        const canvas = await html2canvas(xgSummaryDiv, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: null,
        });
        const statsImgData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(statsImgData, "PNG", 20, yPos, 170, 40); // Reduced height since we're only showing summary
      }
    }

    // Add shot quality map on a new page
    await addRotatedHeatmap(pdf, heatmapRefs.xg, t("reports.xg.shotMap"));

    // Add other heat maps
    await addRotatedHeatmap(pdf, heatmapRefs.goals, t("match.events.goal"));
    await addRotatedHeatmap(
      pdf,
      heatmapRefs.shots,
      t("reports.heatmaps.shots")
    );
    await addRotatedHeatmap(
      pdf,
      heatmapRefs.fouls,
      t("reports.heatmaps.fouls")
    );

    // Save the PDF
    pdf.save(`match-report-${match.homeTeam}-vs-${match.awayTeam}.pdf`);
  };

  const exportCSV = () => {
    // Validate data before export
    if (!events || events.length === 0) return;

    // Sanitize filename
    const safeFilename = `match-events-${match.homeTeam.replace(
      /[^a-z0-9]/gi,
      "_"
    )}-vs-${match.awayTeam.replace(/[^a-z0-9]/gi, "_")}.csv`;

    // Create CSV content with Match ID and Event ID
    const headers = [
      "Match ID",
      "Event ID",
      "Timestamp",
      "Type",
      "Team",
      "Player",
      "Position X",
      "Position Y",
    ];

    const rows = events.map((event) => [
      match.id, // Match UUID
      event.id, // Event UUID
      new Date(event.timestamp).toLocaleString(),
      event.type,
      event.team === "home" ? match.homeTeam : match.awayTeam,
      event.player
        ? `${event.player.name} (${event.player.number})`
        : "Unknown",
      event.x.toFixed(2),
      event.y.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", safeFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={exportPDF}
        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded inline-flex items-center space-x-2"
      >
        <BiDownload className="h-5 w-5" />
        <span>{t("reports.export.pdf")}</span>
      </button>
      <button
        onClick={exportCSV}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center space-x-2"
      >
        <BiDownload className="h-5 w-5" />
        <span>{t("reports.export.csv")}</span>
      </button>
    </div>
  );
}
