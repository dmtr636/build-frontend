import styles from "./Counter.module.scss";
import { clsx } from "clsx";
import {
    CounterMode,
    CounterSize,
    CounterType,
} from "src/ui/components/info/Counter/Counter.types.ts";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ReactNode, RefObject } from "react";

interface BaseCounterProps {
    type?: CounterType;
    mode?: CounterMode;
    size?: CounterSize;
    pale?: boolean;
    disabled?: boolean;
    maxValue?: number;
    className?: string;
    showPlus?: boolean;
    _ref?: RefObject<HTMLDivElement>;
}

interface ValueCounterProps extends BaseCounterProps {
    value: number;
}

interface TextCounterProps extends BaseCounterProps {
    text: ReactNode;
}

type CounterProps = ValueCounterProps | TextCounterProps;

export const Counter = ({
    type = "primary",
    mode = "accent",
    size = "medium",
    pale,
    disabled,
    maxValue = 99,
    className,
    showPlus,
    _ref,
    ...props
}: CounterProps) => {
    const counterClassName = clsx(
        styles.counter,
        styles[type],
        styles[mode],
        styles[size],
        { [styles.pale]: pale },
        { [styles.disabled]: disabled },
        className,
    );

    const typoVariants: Record<CounterSize, TypoVariant> = {
        huge: "actionXL",
        large: "actionXL",
        medium: "actionL",
        small: "actionM",
        tiny: "actionS",
        micro: "actionS",
    };

    if ("text" in props) {
        return (
            <div className={counterClassName} ref={_ref}>
                <Typo variant={typoVariants[size]}>{props.text}</Typo>
            </div>
        );
    }

    return (
        <div className={counterClassName} ref={_ref}>
            {size !== "micro" && (
                <Typo variant={typoVariants[size]}>
                    {(props.value > maxValue || showPlus) && "+"}
                    {Math.min(props.value, maxValue)}
                </Typo>
            )}
        </div>
    );
};
