"use client";

import React, { forwardRef } from "react";
import { Event } from "../lib/types";
import { BiZoomIn, BiZoomOut, BiReset, BiStats } from "react-icons/bi";

interface HeatMapProps {
  events: Event[];
  showXG?: boolean;
  onToggleXG?: () => void;
}

const HeatMap = forwardRef<SVGSVGElement, HeatMapProps>(
  ({ events, showXG = false, onToggleXG }, ref) => {
    const [zoom, setZoom] = React.useState(1);
    const [pan, setPan] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

    // FIFA's standard pitch dimensions
    const PITCH_LENGTH = 800;
    const PITCH_WIDTH = 571;
    const SCALE_FACTOR = PITCH_LENGTH / 105; // Scale from meters to pixels

    // Goal dimensions
    const GOAL_WIDTH = 7.32 * SCALE_FACTOR;
    const GOAL_POST_WIDTH = 0.12 * SCALE_FACTOR;

    // Goal area dimensions
    const GOAL_AREA_DEPTH = 5.5 * SCALE_FACTOR;
    const GOAL_AREA_WIDTH = 18.32 * SCALE_FACTOR;
    const GOAL_AREA_START_Y = (PITCH_WIDTH - GOAL_AREA_WIDTH) / 2;

    // Penalty area dimensions
    const PENALTY_AREA_DEPTH = 16.5 * SCALE_FACTOR;
    const PENALTY_AREA_WIDTH = 40.32 * SCALE_FACTOR;
    const PENALTY_AREA_START_Y = (PITCH_WIDTH - PENALTY_AREA_WIDTH) / 2;

    // Center circle and penalty arc dimensions
    const CENTER_CIRCLE_RADIUS = 9.15 * SCALE_FACTOR;
    const PENALTY_SPOT_DISTANCE = 11 * SCALE_FACTOR;
    const PENALTY_ARC_RADIUS = 9.15 * SCALE_FACTOR;

    // Corner arc dimensions
    const CORNER_ARC_RADIUS = 1 * SCALE_FACTOR;

    // Calculate xG based on shot position
    const calculateXG = (x: number, y: number): number => {
      const pitchX = x;
      const pitchY = Math.abs(y - 50);
      const distance = Math.sqrt(
        Math.pow(pitchX - 100, 2) + Math.pow(pitchY, 2)
      );
      const distanceFactor = Math.max(0, 1 - distance / 100);
      const angleFactor = 1 - Math.abs(pitchY) / 50;
      const xg = distanceFactor * angleFactor * 0.7;
      return Math.min(Math.max(xg + Math.random() * 0.05, 0), 1);
    };

    // Pan and zoom handlers
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
    const handleReset = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    return (
      <div className="relative">
        {/* Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          {onToggleXG && (
            <button
              onClick={onToggleXG}
              className={`p-2 rounded-full shadow-lg ${
                showXG ? "bg-primary text-white" : "bg-white text-gray-600"
              } hover:bg-secondary hover:text-white transition-colors`}
              title="Toggle xG Values"
            >
              <BiStats className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-full bg-white text-gray-600 shadow-lg hover:bg-secondary hover:text-white transition-colors"
            title="Zoom In"
          >
            <BiZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-full bg-white text-gray-600 shadow-lg hover:bg-secondary hover:text-white transition-colors"
            title="Zoom Out"
          >
            <BiZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-white text-gray-600 shadow-lg hover:bg-secondary hover:text-white transition-colors"
            title="Reset View"
          >
            <BiReset className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative w-full overflow-hidden cursor-grab"
          style={{ paddingBottom: "66.625%" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            ref={ref}
            className="absolute inset-0 w-full h-full"
            viewBox={`${-5 - pan.x / zoom} ${-5 - pan.y / zoom} ${
              (PITCH_LENGTH + 10) / zoom
            } ${(PITCH_WIDTH + 10) / zoom}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Field background */}
            <rect
              x="-5"
              y="-5"
              width={PITCH_LENGTH + 10}
              height={PITCH_WIDTH + 10}
              fill="#4CAF50"
            />

            {/* Field outline */}
            <rect
              x="0"
              y="0"
              width={PITCH_LENGTH}
              height={PITCH_WIDTH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Center line */}
            <line
              x1={PITCH_LENGTH / 2}
              y1="0"
              x2={PITCH_LENGTH / 2}
              y2={PITCH_WIDTH}
              stroke="white"
              strokeWidth="2"
            />

            {/* Center circle */}
            <circle
              cx={PITCH_LENGTH / 2}
              cy={PITCH_WIDTH / 2}
              r={CENTER_CIRCLE_RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Center spot */}
            <circle
              cx={PITCH_LENGTH / 2}
              cy={PITCH_WIDTH / 2}
              r="2"
              fill="white"
            />

            {/* Left Goal Area */}
            <rect
              x="0"
              y={GOAL_AREA_START_Y}
              width={GOAL_AREA_DEPTH}
              height={GOAL_AREA_WIDTH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Right Goal Area */}
            <rect
              x={PITCH_LENGTH - GOAL_AREA_DEPTH}
              y={GOAL_AREA_START_Y}
              width={GOAL_AREA_DEPTH}
              height={GOAL_AREA_WIDTH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Left Penalty Area */}
            <rect
              x="0"
              y={PENALTY_AREA_START_Y}
              width={PENALTY_AREA_DEPTH}
              height={PENALTY_AREA_WIDTH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Right Penalty Area */}
            <rect
              x={PITCH_LENGTH - PENALTY_AREA_DEPTH}
              y={PENALTY_AREA_START_Y}
              width={PENALTY_AREA_DEPTH}
              height={PENALTY_AREA_WIDTH}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Left Penalty Spot */}
            <circle
              cx={PENALTY_SPOT_DISTANCE}
              cy={PITCH_WIDTH / 2}
              r="2"
              fill="white"
            />

            {/* Right Penalty Spot */}
            <circle
              cx={PITCH_LENGTH - PENALTY_SPOT_DISTANCE}
              cy={PITCH_WIDTH / 2}
              r="2"
              fill="white"
            />

            {/* Left Penalty Arc */}
            <path
              d={`M ${PENALTY_AREA_DEPTH} ${
                PITCH_WIDTH / 2 - PENALTY_ARC_RADIUS
              } A ${PENALTY_ARC_RADIUS} ${PENALTY_ARC_RADIUS} 0 0 1 ${PENALTY_AREA_DEPTH} ${
                PITCH_WIDTH / 2 + PENALTY_ARC_RADIUS
              }`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Right Penalty Arc */}
            <path
              d={`M ${PITCH_LENGTH - PENALTY_AREA_DEPTH} ${
                PITCH_WIDTH / 2 - PENALTY_ARC_RADIUS
              } A ${PENALTY_ARC_RADIUS} ${PENALTY_ARC_RADIUS} 0 0 0 ${
                PITCH_LENGTH - PENALTY_AREA_DEPTH
              } ${PITCH_WIDTH / 2 + PENALTY_ARC_RADIUS}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Corner Arcs */}
            {/* Top Left */}
            <path
              d={`M 0 ${CORNER_ARC_RADIUS} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 ${CORNER_ARC_RADIUS} 0`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            {/* Top Right */}
            <path
              d={`M ${PITCH_LENGTH} ${CORNER_ARC_RADIUS} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${
                PITCH_LENGTH - CORNER_ARC_RADIUS
              } 0`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            {/* Bottom Left */}
            <path
              d={`M 0 ${
                PITCH_WIDTH - CORNER_ARC_RADIUS
              } A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${CORNER_ARC_RADIUS} ${PITCH_WIDTH}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            {/* Bottom Right */}
            <path
              d={`M ${
                PITCH_LENGTH - CORNER_ARC_RADIUS
              } ${PITCH_WIDTH} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${PITCH_LENGTH} ${
                PITCH_WIDTH - CORNER_ARC_RADIUS
              }`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Event markers */}
            {events.map((event, index) => {
              const xg = showXG ? calculateXG(event.x, event.y) : 0.5;
              const radius = showXG ? 5 + xg * 15 : 5;
              const opacity = showXG ? xg : 0.8;

              return (
                <g key={`event-${index}`}>
                  <circle
                    cx={event.x * (PITCH_LENGTH / 100)}
                    cy={event.y * (PITCH_WIDTH / 100)}
                    r={radius}
                    fill={event.team === "home" ? "#3B82F6" : "#EF4444"}
                    opacity={opacity}
                  />
                  {showXG &&
                    (event.type === "goal" || event.type === "shot") && (
                      <text
                        x={event.x * (PITCH_LENGTH / 100)}
                        y={event.y * (PITCH_WIDTH / 100) - radius - 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        className="font-bold"
                        stroke="black"
                        strokeWidth="0.5"
                      >
                        xG: {xg.toFixed(2)}
                      </text>
                    )}
                  <title>
                    {event.player
                      ? `${event.player.name} (${event.player.number})${
                          showXG ? ` - xG: ${xg.toFixed(2)}` : ""
                        }`
                      : "Unknown Player"}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }
);

HeatMap.displayName = "HeatMap";

export default HeatMap;
