import { CSSProperties, ReactNode } from "react";

interface GridStoryProps {
    children: ReactNode;
    columns: number;
    gap?: number;
    columnGap?: number;
    rowGap?: number;
    justifyItems?: CSSProperties["justifyItems"];
    color?: CSSProperties["color"];
}

export const GridStory = (props: GridStoryProps) => {
    const {
        children,
        columns,
        gap,
        columnGap = 32,
        rowGap = 16,
        justifyItems,
        color,
    }: GridStoryProps = props;
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: gap && `${gap}px`,
                columnGap: columnGap && `${columnGap}px`,
                rowGap: rowGap && `${rowGap}px`,
                justifyItems,
                color,
            }}
        >
            {children}
        </div>
    );
};
