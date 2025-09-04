import styles from "./Content.module.scss";
import { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";

export interface CardProps {
    children: ReactNode;
    tabs?: ReactNode;
    noPadding?: boolean;
    className?: string;
    style?: CSSProperties;
    tabsStyle?: CSSProperties;
}

export const Content = (props: CardProps) => {
    return (
        <div
            className={clsx(styles.card, props.noPadding && styles.noPadding, props.className)}
            style={props.style}
        >
            {props.tabs && <div className={styles.tabsBorder} />}
            {props.tabs && (
                <div className={styles.tabs} style={props.tabsStyle}>
                    {props.tabs}
                </div>
            )}
            {props.tabs && <div className={styles.tabsRightGradient} />}
            {props.children}
        </div>
    );
};
