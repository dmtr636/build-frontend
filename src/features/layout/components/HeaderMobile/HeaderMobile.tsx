import styles from "./header.module.scss";
import { useNavigate } from "react-router-dom";
import { IconBack } from "../../../../ui/assets/icons";
import clsx from "clsx";
import { observer } from "mobx-react-lite";

interface HeaderProps {
    title: string;
    actions?: {
        icon: React.ReactNode;
        onClick?: () => void;
        type?: "primary" | "secondary";
        counter?: number;
    }[];
    buttonBack?: boolean;
    badge?: { text: string; type?: "warning" | "negative" | "positive" | "info" };
}

const HeaderMobile = observer(({ title, actions, badge, buttonBack = true }: HeaderProps) => {
    const navigate = useNavigate();
    const textCenter =
        (!actions && !buttonBack && !badge) ||
        (actions && actions.length === 1 && buttonBack && !badge);
    return (
        <div
            className={clsx(styles.container, {
                [styles.noButtonBack]: !buttonBack,
                [styles.noActions]: !actions || badge,
            })}
        >
            {buttonBack && (
                <button onClick={() => navigate(-1)} className={styles.buttonBack}>
                    <IconBack />
                </button>
            )}
            <div className={styles.title} style={{ textAlign: textCenter ? "center" : "start" }}>
                {title}
            </div>
            {!badge && actions && actions?.length > 0 && (
                <div className={styles.actionArray}>
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            className={clsx(styles.button, styles[action?.type ?? ""])}
                        >
                            {action.icon}{" "}
                            {action.counter && (
                                <div className={styles.counter}>{action.counter}</div>
                            )}
                        </button>
                    ))}
                </div>
            )}
            {badge && (
                <div className={clsx(styles.badge, styles[badge.type ?? "info"])}>{badge.text}</div>
            )}
        </div>
    );
});

export default HeaderMobile;
