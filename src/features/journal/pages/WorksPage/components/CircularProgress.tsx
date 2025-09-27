import React from "react";

export type CircularProgressProps = {
    /** Progress value from 0 to 100 */
    value: number;
    /** Overall size of the icon in pixels */
    size?: number; // default 28
    /** Stroke thickness of the ring */
    strokeWidth?: number; // default 4
    /** Track (background ring) color */
    trackColor?: string; // default #E0E0E0
    /** Progress color when value < 100 */
    progressColor?: string; // default #F8AA49
    /** Progress color when value === 100 */
    successColor?: string; // default #267D5F
    /** Whether to show the numeric value in the center */
    showLabel?: boolean;
    /** Additional className passed to the wrapper */
    className?: string;
    /** Accessible label; describe what this progress represents */
    ariaLabel?: string;
};

/**
 * Circular progress indicator matching the provided 28×28 SVG look.
 * - Default colors: track #E0E0E0, progress #F8AA49, success at 100% #267D5F
 * - Starts at 12 o'clock and grows clockwise
 */
const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 28,
    strokeWidth = 4,
    trackColor = "#E0E0E0",
    progressColor = "#F8AA49",
    successColor = "#267D5F",
    showLabel = false,
    className,
    ariaLabel,
}) => {
    const clamped = Math.max(0, Math.min(100, value));

    const radius = (size - strokeWidth) / 2; // ensure stroke stays inside viewBox
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - clamped / 100);

    const currentColor = clamped === 100 ? successColor : progressColor;

    // Use a unique id per instance for gradient/mask if needed in future (not used now)
    const id = React.useId();

    return (
        <div
            className={className}
            role="img"
            aria-label={ariaLabel ?? `Progress: ${clamped}%`}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Rotate -90° so progress starts at 12 o'clock */}
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {/* Progress */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={currentColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 300ms ease, stroke 150ms ease" }}
                    />
                </g>

                {showLabel && (
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="central"
                        textAnchor="middle"
                        fontSize={Math.max(10, size * 0.38)}
                        fontWeight={600}
                        fill="#111827"
                    >
                        {Math.round(clamped)}%
                    </text>
                )}
            </svg>
        </div>
    );
};

export default CircularProgress;
