import styles from "./Alert.module.scss";
import { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { AlertMode } from "src/ui/components/solutions/Alert/Alert.types.ts";

interface AlertProps {
    mode: AlertMode;
    title?: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode[];
    style?: CSSProperties;
}

export const Alert = (props: AlertProps) => {
    const { mode, title, subtitle, icon, actions }: AlertProps = props;

    const alertClassName = clsx(styles.alert, styles[mode]);

    const renderActions = () => {
        if (actions && actions.length) {
            return <div className={clsx(styles.actions, icon && styles.withIcon)}>{actions}</div>;
        }
    };

    return (
        <div className={alertClassName} style={props.style}>
            <div className={styles.content}>
                {icon}
                <div>
                    {title && <Typo variant={"subheadXL"}>{title}</Typo>}
                    {subtitle && (
                        <Typo
                            variant={"bodyXL"}
                            className={clsx(styles.subtitle, title && styles.withTitle)}
                        >
                            {subtitle}
                        </Typo>
                    )}
                </div>
            </div>
            {renderActions()}
        </div>
    );
};
