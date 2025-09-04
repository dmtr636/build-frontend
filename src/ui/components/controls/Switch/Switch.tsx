import styles from "./Switch.module.scss";
import { clsx } from "clsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { IconCheckmark, IconClose } from "src/ui/assets/icons";
import { CSSProperties } from "react";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    title?: string;
    subtitle?: string;
    disabled?: boolean;
    placeText?: "left" | "right";
    fullWidth?: boolean;
    mode?: "primary" | "brand";
    style?: CSSProperties;
}

export const Switch = (props: SwitchProps) => {
    const {
        checked,
        onChange,
        title,
        subtitle,
        disabled,
        placeText,
        fullWidth,
        mode = "primary",
    }: SwitchProps = props;

    return (
        <button
            className={clsx(styles.container, {
                [styles.textLeft]: placeText === "left",
                [styles.fullWidth]: fullWidth,
            })}
            style={props.style}
            onClick={() => onChange(!checked)}
            disabled={disabled}
        >
            <div className={clsx(styles.switch, { [styles.checked]: checked }, styles[mode])}>
                <div className={styles.circle}>{checked ? <IconCheckmark /> : <IconClose />}</div>
            </div>
            {(title || subtitle) && (
                <div className={clsx(styles.label)}>
                    {title && (
                        <Typo variant={"actionXL"} className={styles.title}>
                            {title}
                        </Typo>
                    )}
                    {subtitle && (
                        <Typo variant={"bodyL"} className={styles.subtitle}>
                            {subtitle}
                        </Typo>
                    )}
                </div>
            )}
        </button>
    );
};
