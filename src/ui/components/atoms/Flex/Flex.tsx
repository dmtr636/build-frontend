import { CSSProperties, forwardRef, ReactNode } from "react";

export const Flex = forwardRef<
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
                flexDirection: props.direction,
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

Flex.displayName = "Flex";
