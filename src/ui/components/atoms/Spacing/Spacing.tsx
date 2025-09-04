import { CSSProperties } from "react";

export const Spacing = (props: {
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    style?: CSSProperties;
    className?: string;
}) => {
    return (
        <div
            style={{
                width: props.width,
                height: props.height,
                flexShrink: 0,
                ...props.style,
            }}
            className={props.className}
        />
    );
};
