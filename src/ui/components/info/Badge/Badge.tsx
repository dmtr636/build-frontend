import styles from "./styles.module.scss";
import { ReactNode } from "react";
import { clsx } from "clsx";

interface BadgeProps {
    children: ReactNode;
    value?: number | string;
    size?: "large" | "medium" | "small" | "tiny" | "micro";
    type?: "primary" | "secondary" | "outlined";
    mode?: "accent" | "negative" | "positive" | "neutral" | "contrast" | "brand";
    pale?: boolean;
    disabled?: boolean;
    top?: number;
    right?: number;
}

export const Badge = ({
    children,
    top,
    right,
    value,
    type = "outlined",
    size = "tiny",
    mode = "accent",
    pale,
    disabled,
}: BadgeProps) => {
    const style = {
        ...(top !== undefined && { top: `${top}px` }),
        ...(right !== undefined && { right: `${right}px` }),
    };
    return (
        <div className={styles.container}>
            {children}
            <div
                style={style}
                className={clsx(styles.badge, styles[size], styles[type], styles[mode], {
                    [styles.pale]: pale,
                    [styles.disabled]: disabled,
                })}
            >
                {value}
            </div>
        </div>
    );
};
