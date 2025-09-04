import styles from "./Button.module.scss";
import { clsx } from "clsx";
import React, {
    cloneElement,
    createRef,
    CSSProperties,
    isValidElement,
    ReactNode,
    RefObject,
    useLayoutEffect,
    useState,
} from "react";
import { Counter } from "../../info/Counter/Counter.tsx";
import {
    ButtonAlign,
    ButtonEdge,
    ButtonMode,
    ButtonRounding,
    ButtonSize,
    ButtonType,
} from "./Button.types.ts";
import { CounterMode, CounterType } from "../../info/Counter/Counter.types.ts";
import { TypoVariant } from "../../atoms/Typo/Typo.types.ts";
import { TextMeasurer } from "src/shared/utils/TextMeasurer.ts";
import Lottie from "lottie-react";
import { animationLoading32 } from "src/ui/assets/animations";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { NavLink } from "react-router-dom";
import { useThrottledCallback } from "src/shared/hooks/useThrottledCallback.ts";
import { observer } from "mobx-react-lite";
import { Backlight } from "src/ui/components/controls/Backlight/Backlight.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { layoutStore } from "src/app/AppStore.ts";

export const buttonStyles = styles;

export interface ButtonProps {
    children?: ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
    onTouchStart?: (event: React.MouseEvent) => void;
    type?: ButtonType;
    mode?: ButtonMode;
    size?: ButtonSize;
    rounding?: ButtonRounding;
    disabled?: boolean;
    pale?: boolean;
    focused?: boolean;
    hover?: boolean;
    iconBefore?: ReactNode;
    customIconBefore?: ReactNode;
    iconAfter?: ReactNode;
    counter?: number;
    className?: string;
    style?: CSSProperties;
    align?: ButtonAlign;
    edge?: ButtonEdge;
    fullWidth?: boolean;
    clickable?: boolean;
    listItem?: boolean;
    _ref?: RefObject<HTMLButtonElement>;
    availableValues?: ReactNode[];
    loading?: boolean;
    disableTransition?: boolean;
    overflow?: "hidden" | "visible";
    isSubmit?: boolean;
    disabledCounter?: boolean;
    href?: string;
    target?: "_blank";
    _brandListItem?: boolean;
    tabIndex?: number;
    counterClassname?: string;
    showBacklight?: boolean;
    antiSpa?: string;
    disableTooltip?: boolean;
    quickOptions?: ReactNode;
    twoLine?: boolean;
}

export const Button = observer((props: ButtonProps) => {
    const {
        children,
        onClick,
        onMouseEnter,
        onMouseLeave,
        onMouseDown,
        onTouchStart,
        type = "primary",
        mode = "accent",
        size = "medium",
        rounding = "low",
        pale,
        focused,
        hover,
        iconBefore,
        customIconBefore,
        iconAfter,
        counter,
        className,
        counterClassname,
        style,
        align = "center",
        edge,
        fullWidth,
        clickable = true,
        listItem,
        _ref = createRef<HTMLButtonElement>(),
        availableValues,
        loading,
        disableTransition,
        overflow = "hidden",
        isSubmit = false,
        disabledCounter,
        href,
        antiSpa,
        target,
        _brandListItem,
        tabIndex,
        showBacklight,
        disableTooltip,
        quickOptions,
        twoLine,
    }: ButtonProps = props;
    const [isHovered, setHovered] = useState(false);
    const [width, setWidth] = useState<number>();
    const isIconVariant = !twoLine && isValidElement<SVGElement>(children) && !listItem;
    const disabled = props.disabled || loading;

    useLayoutEffect(() => {
        if (!width && availableValues?.length && _ref?.current && typeof children === "string") {
            let maxWidth = 0;
            const currentTextWidth = Math.ceil(TextMeasurer.getTextWidth(children, _ref?.current));
            const otherElementsWidth = Math.ceil(_ref.current.offsetWidth - currentTextWidth + 1);
            for (const value of availableValues) {
                if (typeof value === "string") {
                    maxWidth = Math.max(
                        maxWidth,
                        Math.ceil(TextMeasurer.getTextWidth(value, _ref?.current)) +
                            otherElementsWidth +
                            (size === "large" ? 10 : 5),
                    );
                }
            }
            setWidth(maxWidth);
        }
    }, [width, availableValues?.length]);

    const renderChildren = () => {
        if (!children) {
            return;
        }
        if (isIconVariant) {
            return renderIcon(children);
        }
        const typoVariants: Record<ButtonSize, TypoVariant> = {
            huge: "actionXL",
            large: "actionXL",
            medium: "actionL",
            small: "actionM",
            tiny: "actionM",
        };
        if (disableTooltip) {
            return (
                <Typo variant={typoVariants[size]} className={styles.text}>
                    {children}
                </Typo>
            );
        }
        return (
            <TooltipTypo variant={typoVariants[size]} className={styles.text}>
                {children}
            </TooltipTypo>
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
        const counterTypes: Record<ButtonType, CounterType> = {
            primary: "secondary",
            secondary: "primary",
            tertiary: "primary",
            outlined: "primary",
            text: "primary",
        };
        const counterModes: Record<ButtonMode, CounterMode> = {
            accent: "accent",
            positive: "positive",
            negative: "negative",
            neutral: "neutral",
            contrast: "contrast",
            brand: "brand",
        };
        return (
            <Counter
                type={counterTypes[type]}
                mode={counterModes[mode]}
                className={counterClassname}
                size={size}
                value={counter}
                pale={!isHovered && pale && type !== "text"}
                disabled={disabledCounter !== undefined ? disabledCounter : disabled}
            />
        );
    };

    const handleMouseEnter = useThrottledCallback(
        (event: React.MouseEvent) => {
            setHovered(true);
            onMouseEnter?.(event);
        },
        50,
        [onMouseEnter],
    );

    const handleMouseLeave = useThrottledCallback(
        (event: React.MouseEvent) => {
            setHovered(false);
            onMouseLeave?.(event);
        },
        50,
        [onMouseLeave],
    );
    const hasOnlyIconBefore = props.iconBefore && !children;

    const buttonClassName = clsx(
        styles.button,
        styles[type],
        styles[mode],
        styles[size],
        styles[`${rounding}Rounding`],
        { [styles.pale]: (!isHovered || layoutStore.isMobile) && pale },
        { [styles.iconVariant]: isIconVariant },
        { [styles.focused]: focused },
        { [styles.hover]: hover },
        { [styles.edgeTop]: edge === "top" },
        { [styles.edgeRight]: edge === "right" },
        { [styles.edgeBottom]: edge === "bottom" },
        { [styles.edgeLeft]: edge === "left" },
        { [styles.fullWidth]: fullWidth },
        { [styles.clickable]: clickable },
        { [styles.alignStart]: align === "start" },
        { [styles.listItemVariant]: listItem },
        { [styles.neutralPale]: isIconVariant && mode === "neutral" },
        { [styles.loading]: loading },
        { [styles.withTransition]: !disableTransition },
        { [styles.brandListItem]: _brandListItem },
        { [styles.hasOnlyIconBefore]: hasOnlyIconBefore },
        className,
    );

    const renderButtonContent = () => {
        return (
            <>
                <div className={styles.startContent} style={{ overflow }}>
                    {renderIcon(iconBefore)}
                    {renderIcon(customIconBefore, styles.customIconBefore)}
                    {renderChildren()}
                    {type === "text" && renderCounter()}
                </div>
                {(iconAfter || counter !== undefined) && (
                    <div className={styles.endContent}>
                        {renderIcon(iconAfter)}
                        {type !== "text" && renderCounter()}
                    </div>
                )}
                {loading && (
                    <Lottie
                        className={clsx(styles.loadingAnimation)}
                        loop={true}
                        animationData={animationLoading32}
                    />
                )}
                {showBacklight && <Backlight />}
            </>
        );
    };

    const renderButton = () => {
        const buttonProps = {
            ref: _ref,
            type: isSubmit ? "submit" : "button",
            className: buttonClassName,
            onClick: onClick,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onMouseDown: onMouseDown,
            onTouchStart: onTouchStart,
            disabled: disabled,
            style: {
                ...style,
                width: style?.width ?? width,
            },
            target,
            tabIndex,
        } as any;
        if (antiSpa)
            return (
                <a href={antiSpa} {...buttonProps}>
                    {renderButtonContent()}
                </a>
            );

        if (href) {
            return (
                <NavLink to={href} {...buttonProps}>
                    {renderButtonContent()}
                </NavLink>
            );
        } else {
            return <button {...buttonProps}>{renderButtonContent()}</button>;
        }
    };

    if (quickOptions) {
        return (
            <div className={styles.quickOptionsContainer}>
                {renderButton()}
                {quickOptions}
            </div>
        );
    }

    return renderButton();
});
