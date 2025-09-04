import styles from "./Status.module.scss";
import { cloneElement, CSSProperties, isValidElement, ReactNode, RefObject } from "react";
import { clsx } from "clsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";

export interface StatusProps {
    size?: "medium" | "small" | "tiny";
    mode?: "neutral" | "positive" | "negative" | "warning" | "accent" | "brand";
    iconBefore?: ReactNode;
    iconAfter?: ReactNode;
    children: ReactNode;
    _ref?: RefObject<HTMLDivElement>;
    style?: CSSProperties;
}

export const Status = (props: StatusProps) => {
    const {
        size = "medium",
        mode = "neutral",
        iconBefore,
        iconAfter,
        children,
        _ref,
    }: StatusProps = props;

    const renderIcon = (icon: ReactNode) => {
        if (isValidElement<SVGElement>(icon)) {
            return cloneElement(icon, { className: styles.icon });
        }
    };

    const getTypoVariant = () => {
        const map: Record<Required<StatusProps>["size"], TypoVariant> = {
            medium: "actionL",
            small: "actionM",
            tiny: "actionS",
        };
        return map[size];
    };

    return (
        <div
            className={clsx(styles.container, styles[size], styles[mode])}
            ref={_ref}
            style={props.style}
        >
            {iconBefore && renderIcon(iconBefore)}
            <Typo className={styles.text} variant={getTypoVariant()}>
                {children}
            </Typo>
            {iconAfter && renderIcon(iconAfter)}
        </div>
    );
};
