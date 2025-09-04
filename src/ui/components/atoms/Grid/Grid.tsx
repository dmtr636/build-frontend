import { CSSProperties, ReactNode, RefObject } from "react";

export const Grid = (props: {
    columns?: CSSProperties["gridTemplateColumns"];
    rows?: CSSProperties["gridTemplateRows"];
    gap?: CSSProperties["gap"];
    align?: CSSProperties["alignItems"];
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    style?: CSSProperties;
    className?: string;
    children: ReactNode;
    _ref?: RefObject<HTMLDivElement>;
    ref?: RefObject<HTMLDivElement>;
}) => {
    return (
        <div
            ref={props._ref}
            style={{
                display: "grid",
                gridTemplateColumns: props.columns,
                gridTemplateRows: props.rows,
                alignItems: props.align,
                width: props.width,
                height: props.height,
                gap: props.gap,
                ...props.style,
            }}
            className={props.className}
        >
            {props.children}
        </div>
    );
};
