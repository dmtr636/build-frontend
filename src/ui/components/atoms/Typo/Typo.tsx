import styles from "./Typo.module.scss";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";
import { CSSProperties, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";

interface TypoProps {
    variant: TypoVariant;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    noWrap?: boolean;
    mode?: "accent" | "negative" | "positive" | "neutral" | "contrast" | "brand";
    type?: "primary" | "secondary" | "tertiary" | "quaternary";
    onClick?: () => void;
    element?: "h1" | "h2" | "h3";
}

export const Typo = forwardRef<HTMLDivElement, TypoProps>((props, ref) => {
    let mode = props.mode;
    let type = props.type;
    if (mode && !type) {
        type = "primary";
    }
    if (!mode && type) {
        mode = "neutral";
    }

    const className = clsx(
        styles.typo,
        { [styles.preLine]: !props.noWrap },
        { [styles.noWrap]: props.noWrap },
        styles[props.variant],
        mode && styles[mode],
        type && styles[type],
        props.className,
    );

    if (props.element === "h1") {
        return (
            <h1 ref={ref} className={className} style={props.style} onClick={props.onClick}>
                {props.children}
            </h1>
        );
    }

    if (props.element === "h2") {
        return (
            <h2 ref={ref} className={className} style={props.style} onClick={props.onClick}>
                {props.children}
            </h2>
        );
    }

    if (props.element === "h3") {
        return (
            <h3 ref={ref} className={className} style={props.style} onClick={props.onClick}>
                {props.children}
            </h3>
        );
    }

    return (
        <div ref={ref} className={className} style={props.style} onClick={props.onClick}>
            {props.children}
        </div>
    );
});

Typo.displayName = "Typo";
