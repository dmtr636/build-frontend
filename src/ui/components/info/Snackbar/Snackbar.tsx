import styles from "./Snackbar.module.scss";
import { ReactNode } from "react";
import { clsx } from "clsx";
import { IconAttention, IconError, IconSuccess } from "src/ui/assets/icons";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import {
    DEFAULT_SNACKBAR_DELAY_MS,
    DEFAULT_SNACKBAR_EXIT_ANIMATION_DURATION_MS,
} from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";

interface SnackbarProps {
    mode: "positive" | "negative" | "neutral";
    children: ReactNode;
    onClick?: () => void;
    actions?: ReactNode[];
    icon?: ReactNode;
    removing?: boolean;
    delayMs?: number;
    isFirst?: boolean;
}

export const Snackbar = (props: SnackbarProps) => {
    const getIcon = () => {
        if (props.icon) {
            return props.icon;
        }
        switch (props.mode) {
            case "positive":
                return <IconSuccess />;
            case "negative":
                return <IconError />;
            case "neutral":
                return <IconAttention />;
        }
    };

    return (
        <div
            className={clsx(styles.snackbar, styles[props.mode], props.removing && styles.removing)}
            onClick={props.onClick}
        >
            {getIcon()}
            <Typo variant={"actionL"}>{props.children}</Typo>
            {props.actions && props.actions.length > 0 && (
                <div className={styles.actions}>{props.actions}</div>
            )}
            {props.isFirst && (
                <div
                    className={styles.loader}
                    style={{
                        animationDuration: `${(props.delayMs ?? DEFAULT_SNACKBAR_DELAY_MS) - DEFAULT_SNACKBAR_EXIT_ANIMATION_DURATION_MS}ms`,
                    }}
                />
            )}
        </div>
    );
};
