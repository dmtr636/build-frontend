import React from "react";

export type CircularProgressProps = {
    value: number;

    size?: number; // default 28

    strokeWidth?: number; // default 4

    trackColor?: string; // default #E0E0E0

    progressColor?: string; // default #F8AA49

    successColor?: string; // default #267D5F

    showLabel?: boolean;

    className?: string;

    ariaLabel?: string;
};

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
                {}
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    {}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {}
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
