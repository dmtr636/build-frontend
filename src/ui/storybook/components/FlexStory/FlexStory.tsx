import { ReactNode } from "react";

interface FlexProps {
    children: ReactNode;
    gap?: number;
    direction?: "row" | "column";
}

export const FlexStory = ({ children, gap = 10, direction = "row" }: FlexProps) => (
    <div
        style={{
            display: "flex",
            gap: `${gap}px`,
            flexDirection: direction,
        }}
    >
        {children}
    </div>
);
