import React from "react";

interface LogoProps {
    className?: string;
    variant?: "light" | "dark";
    size?: number;
    withShadow?: boolean;
    is3D?: boolean;
}

const FrameworkLogo: React.FC<LogoProps> = ({
  className = "",
  variant = "light",
  size = 64,
  withShadow = true,
  is3D = false
}) => {
  const isLight = variant === "light";
  const strokeColor = isLight ? "#1f2937" : "#f9fafb";

  if (is3D) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className}`}
        style={{ overflow: "visible" }}
      >
        {/* Dynamic Shadow */}
        <ellipse
          cx="100"
          cy="175"
          rx="60"
          ry="20"
          fill="black"
          className="animate-shadow-float origin-center"
          style={{ filter: "blur(15px)", opacity: 0.6 }}
        />

        {/* Floating Container */}
        <g className="animate-float-slow">

          {/* 3D Extrusion (Back/Side Body) */}
          {/* Explicitly traces the bottom contour +40px down, then back up to the face edge */}
          <path
            d="M40 80 L40 120 Q40 135 50 145 L70 160 Q85 170 100 170 Q115 170 130 160 L150 145 Q160 135 160 120 L160 80 Q160 95 150 105 L130 120 Q115 130 100 130 Q85 130 70 120 L50 105 Q40 95 40 80 Z"
            fill="url(#slab-side-gradient)"
          />

          {/* Top Face (Rounded Diamond) */}
          <path
            d="M100 30 Q115 30 130 40 L150 55 Q160 65 160 80 Q160 95 150 105 L130 120 Q115 130 100 130 Q85 130 70 120 L50 105 Q40 95 40 80 Q40 65 50 55 L70 40 Q85 30 100 30 Z"
            fill="url(#slab-face-gradient)"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Glossy Reflection (Top half sheen) */}
          <path
            d="M100 35 Q110 35 120 40 L145 60 Q150 65 145 70 C140 60 120 50 100 50 C80 50 60 60 55 70 Q50 65 55 60 L80 40 Q90 35 100 35 Z"
            fill="url(#reflection-gradient)"
            opacity="0.8"
          />

          {/* Highlight Edge (Top-Left) */}
          <path
            d="M45 90 L70 40 Q85 30 100 30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.8"
            fill="none"
          />

          {/* Framework Shield Icon (Embossed on surface) */}
          <g transform="translate(100, 95) scale(1.0)">
            {/* Icon Base */}
            <path
              d="M0 -35 L30 -18 V17 L0 34 L-30 17 V-18 Z"
              fill="white"
              filter="drop-shadow(0 5px 8px rgb(0 0 0 / 0.2))"
            />
            {/* Icon Outline Detail */}
            <path
              d="M0 -35 L30 -18 V17 L0 34 L-30 17 V-18 Z"
              stroke="#047857"
              strokeWidth="2"
              strokeOpacity="0.1"
              fill="none"
            />
            {/* Center Dot */}
            <circle cx="0" cy="0" r="10" fill="#10b981" />
          </g>
        </g>

        <defs>
          <linearGradient id="slab-face-gradient" x1="50" y1="35" x2="150" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="slab-side-gradient" x1="100" y1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          <linearGradient id="reflection-gradient" x1="100" y1="40" x2="100" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.95" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const shadowId = `logo-shadow-${variant}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {withShadow && (
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity={isLight ? "0.25" : "0.4"} />
          </filter>
        )}
      </defs>
      <path
        d="M100 25L165 62V138L100 175L35 138V62L100 25Z"
        stroke={strokeColor}
        strokeWidth="20"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={withShadow ? `url(#${shadowId})` : undefined}
      />
      <circle
        cx="100"
        cy="100"
        r="30"
        fill="#10b981"
        filter={withShadow ? `url(#${shadowId})` : undefined}
      />
    </svg>
  );
};

export default FrameworkLogo;
