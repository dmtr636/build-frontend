import styles from "./Divider.module.scss";
import { clsx } from "clsx";
import { CSSProperties } from "react";

export const Divider = (props: {
    direction: "horizontal" | "vertical";
    type: "primary" | "secondary" | "tertiary";
    mode?: "neutral" | "brand" | "contrast";
    style?: CSSProperties;
    className?: string;
    noMargin?: boolean;
}) => {
    return (
        <div
            className={clsx(
                styles.divider,
                styles[props.direction],
                styles[props.type],
                styles[props.mode ?? "neutral"],
                props.noMargin && styles.noMargin,
                props.className,
            )}
            style={props.style}
        />
    );
};
