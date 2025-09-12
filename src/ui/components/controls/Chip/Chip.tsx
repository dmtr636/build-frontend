import styles from "./Chip.module.scss";
import { clsx } from "clsx";
import { cloneElement, CSSProperties, isValidElement, ReactNode, RefObject } from "react";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconClose } from "src/ui/assets/icons";
import { layoutStore } from "src/app/AppStore.ts";

export interface ChipProps {
    type?: "primary" | "secondary";
    children: ReactNode;
    selected?: boolean;
    onChange?: (selected: boolean) => void;
    onDelete?: () => void;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    iconBefore?: ReactNode;
    iconAfter?: ReactNode;
    counter?: number;
    className?: string;
    style?: CSSProperties;
    rounding?: "peak" | "low";
    pale?: boolean;
    size?: "small" | "medium";
    _ref?: RefObject<HTMLButtonElement>;
    closePale?: boolean;
}

export const Chip = (props: ChipProps) => {
    const {
        type = "primary",
        children,
        selected,
        onChange,
        onDelete,
        onClick,
        onMouseEnter,
        onMouseLeave,
        iconBefore,
        iconAfter,
        counter,
        className,
        style,
        rounding = "low",
        size = "medium",
        _ref,
        closePale,
    }: ChipProps = props;

    const renderChildren = () => {
        return (
            <Typo variant={layoutStore.isMobile ? "actionM" : "actionL"} noWrap={true}>
                {children}
            </Typo>
        );
    };

    const renderIcon = (icon?: ReactNode, className?: string) => {
        if (isValidElement<SVGElement>(icon)) {
            return cloneElement(icon, {
                className: clsx(styles.icon, className, icon.props.className),
            });
        }
    };

    const renderCounter = () => {
        if (counter === undefined) {
            return null;
        }
        return (
            <Counter
                type={"primary"}
                mode={selected ? "accent" : "neutral"}
                size={"large"}
                value={counter}
            />
        );
    };

    const handleMouseEnter = () => {
        onMouseEnter?.();
    };

    const handleMouseLeave = () => {
        onMouseLeave?.();
    };

    const handleClick = (event: React.MouseEvent) => {
        onChange?.(!selected);
        onClick?.(event);
    };

    const buttonClassName = clsx(
        styles.button,
        styles[type],
        styles[size],
        {
            [styles.clickable]: onChange || onClick,
            [styles.selected]: selected,
            [styles.roundingPeak]: rounding === "peak",
            [styles.pale]: props.pale,
        },
        className,
    );

    const renderContent = () => {
        return (
            <>
                <div className={styles.startContent}>
                    {renderIcon(iconBefore)}
                    {renderChildren()}
                </div>
                {(iconAfter || counter !== undefined || onDelete) && (
                    <div className={styles.endContent}>
                        {renderIcon(iconAfter)}
                        {renderCounter()}
                        {onDelete && <IconClose className={styles.deleteButton} />}
                    </div>
                )}
            </>
        );
    };

    if (onClick || onChange) {
        return (
            <button
                ref={_ref}
                className={buttonClassName}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={style}
            >
                {renderContent()}
            </button>
        );
    } else {
        return (
            <div
                ref={_ref as any}
                className={buttonClassName}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={style}
            >
                {renderContent()}
            </div>
        );
    }
};
