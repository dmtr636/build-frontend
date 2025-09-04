import { CSSProperties, forwardRef, ReactNode } from "react";

export const FlexColumn = forwardRef<
    HTMLDivElement,
    {
        direction?: CSSProperties["flexDirection"];
        justify?: CSSProperties["justifyContent"];
        align?: CSSProperties["alignItems"];
        gap?: CSSProperties["gap"];
        wrap?: CSSProperties["flexWrap"];
        width?: CSSProperties["width"];
        height?: CSSProperties["height"];
        style?: CSSProperties;
        className?: string;
        children: ReactNode;
    }
>((props, ref) => {
    return (
        <div
            ref={ref}
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: props.justify,
                alignItems: props.align,
                gap: props.gap,
                flexWrap: props.wrap,
                width: props.width,
                height: props.height,
                ...props.style,
            }}
            className={props.className}
        >
            {props.children}
        </div>
    );
});

FlexColumn.displayName = "FlexColumn";
