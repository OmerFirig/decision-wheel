import React from "react";
import "./Wheel.css";

export interface WheelOption {
  text: string;
  color: string;
  size: number;
}

interface WheelProps {
  options: WheelOption[];
  size?: number;
  rotation?: number; // derece cinsinden, default 0
}

const BASE_RADIUS = 100;
const OVERLAP_DEG = 2;

function getCoordinatesForAngle(angle: number, radius: number, center: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

function getArcLength(radius: number, angle: number) {
  return (Math.PI * radius * angle) / 180;
}

const Wheel: React.FC<WheelProps> = ({ options, size = 100, rotation = 0 }) => {
  const scale = size / 100;
  const wheelRadius = BASE_RADIUS * scale;
  const center = wheelRadius;
  const totalSize = options.reduce((sum, o) => sum + o.size, 0);
  let currentAngle = 0;
  const pointerWidth = 28 * scale;
  const pointerHeight = 32 * scale;
  const centerRadius = wheelRadius * 0.3;
  return (
    <div
      className="wheel-wrapper"
      style={{ width: 2 * wheelRadius, height: 2 * wheelRadius, position: "relative" }}
    >
      {/* Modern SVG pointer - aşağıyı gösteren, gradientli ve gölgeli */}
      <svg
        width={pointerWidth}
        height={pointerHeight}
        className="pointer-modern"
        style={{
          position: "absolute",
          left: `calc(50% - ${pointerWidth / 2}px)`,
          top: -pointerHeight / 2,
          zIndex: 2
        }}
      >
        <defs>
          <linearGradient id="pointer-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,0 ${pointerWidth},0 ${pointerWidth / 2},${pointerHeight}`}
          fill="url(#pointer-gradient)"
          stroke="#ffd700"
          strokeWidth={2 * scale}
        />
      </svg>
      <svg
        className="wheel-svg"
        width={2 * wheelRadius}
        height={2 * wheelRadius}
        style={{ transform: `rotate(${rotation}deg)`, transition: "transform 3s cubic-bezier(0.33,1,0.68,1)" }}
      >
        {/* Dilimler ve ayırıcı çizgiler */}
        {options.map((option, i) => {
          const segmentAngle = (option.size / totalSize) * 360;
          const startAngle = currentAngle - OVERLAP_DEG;
          const endAngle = currentAngle + segmentAngle + OVERLAP_DEG;
          const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
          const start = getCoordinatesForAngle(startAngle, wheelRadius, center);
          const end = getCoordinatesForAngle(endAngle, wheelRadius, center);
          const d = [
            `M ${center} ${center}`,
            `L ${start.x} ${start.y}`,
            `A ${wheelRadius} ${wheelRadius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            "Z",
          ].join(" ");

          // Dış yay path'i (yazı için)
          const outerRadius = wheelRadius * 0.82;
          const arcStart = getCoordinatesForAngle(startAngle, outerRadius, center);
          const arcEnd = getCoordinatesForAngle(endAngle, outerRadius, center);
          const arcId = `arc-path-${i}`;
          const arcPath = [
            `M ${arcStart.x} ${arcStart.y}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`
          ].join(" ");

          // Yazı font size'ı yayı aşmasın
          const baseFontSize = 16 * (option.size || 1) * scale;
          const arcLength = getArcLength(outerRadius, segmentAngle);
          const textWidth = option.text.length * baseFontSize * 0.6;
          const fontSize = textWidth > arcLength ? (arcLength / (option.text.length * 0.6)) : baseFontSize;

          // Segment ayırıcı çizgi (her segmentin başında)
          const borderStart = getCoordinatesForAngle(startAngle, 0, center);
          const borderEnd = getCoordinatesForAngle(startAngle, wheelRadius, center);

          currentAngle += segmentAngle;
          return (
            <g key={i}>
              <path d={d} style={{ fill: option.color }} className="wheel-segment" />
              {/* Segment ayırıcı çizgi */}
              <line x1={borderStart.x} y1={borderStart.y} x2={borderEnd.x} y2={borderEnd.y} stroke="#fff" strokeWidth={2 * scale} opacity={0.7} />
              <path id={arcId} d={arcPath} fill="none" />
              <text
                className="wheel-text"
                style={{ fontSize: `${fontSize}px` }}
              >
                <textPath
                  href={`#${arcId}`}
                  startOffset="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {option.text}
                </textPath>
              </text>
            </g>
          );
        })}
        {/* Ortadaki merkez dairesi */}
        <circle
          cx={center}
          cy={center}
          r={centerRadius}
          className="wheel-center"
        />
      </svg>
    </div>
  );
};

export default Wheel; 