import styles from "./Checkbox.module.scss";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import {
    IconCheckboxMinus,
    IconCheckboxOff,
    IconCheckboxOn,
    IconCheckboxPlus,
} from "src/ui/assets/icons";
import { clsx } from "clsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import {
    CheckboxColor,
    CheckboxIntermediateState,
    CheckboxSize,
} from "src/ui/components/controls/Checkbox/Checkbox.types.ts";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";

interface CheckboxProps {
    onChange: (checked: boolean) => void;
    onClick?: () => void;
    title?: ReactNode;
    subtitle?: string;
    checked?: boolean;
    intermediate?: CheckboxIntermediateState;
    disabled?: boolean;
    color?: CheckboxColor;
    size?: CheckboxSize;
    hover?: boolean;
    style?: CSSProperties;
}

export const Checkbox = (props: CheckboxProps) => {
    const {
        onChange,
        onClick,
        title,
        subtitle,
        intermediate,
        disabled,
        color = "neutral",
        size = "large",
        hover,
        style,
    }: CheckboxProps = props;

    const [checked, setChecked] = useState(props.checked ?? false);

    useEffect(() => {
        if (props.checked !== undefined) {
            setChecked(props.checked);
        }
    }, [props.checked]);

    const getCheckboxIcon = () => {
        if (intermediate === "minus") {
            return <IconCheckboxMinus className={styles.icon} />;
        }
        if (intermediate === "plus") {
            return <IconCheckboxPlus className={styles.icon} />;
        }
        if (checked) {
            return <IconCheckboxOn className={styles.icon} />;
        } else {
            return <IconCheckboxOff className={styles.icon} />;
        }
    };

    const handleClick = () => {
        onClick?.();
        if (intermediate) {
            return;
        }
        const newState = !checked;
        onChange(newState);
        setChecked(newState);
    };

    const titleVariants: Record<CheckboxSize, TypoVariant> = {
        large: "actionXL",
        medium: "actionL",
    };

    const subtitleVariants: Record<CheckboxSize, TypoVariant> = {
        large: "bodyL",
        medium: "bodyM",
    };

    return (
        <button
            type={"button"}
            className={clsx(styles.checkbox, styles[checked ? color : color], styles[size], {
                [styles.checked]: checked,
                [styles.hover]: hover,
            })}
            onClick={handleClick}
            disabled={disabled}
            style={style}
        >
            {getCheckboxIcon()}
            <div>
                <Typo variant={titleVariants[size]} className={styles.title}>
                    {title}
                </Typo>
                {subtitle && (
                    <Typo variant={subtitleVariants[size]} className={styles.subtitle}>
                        {subtitle}
                    </Typo>
                )}
            </div>
        </button>
    );
};
