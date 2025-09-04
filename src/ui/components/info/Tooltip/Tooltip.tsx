import styles from "./Tooltip.module.scss";
import {
    PopoverBase,
    PopoverBaseProps,
} from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { observer } from "mobx-react-lite";

interface TooltipProps extends Omit<PopoverBaseProps, "triggerEvent" | "content"> {
    header?: string;
    text?: ReactNode;
    size?: "large" | "medium";
    textCenter?: boolean;
    hide?: boolean;
}

export const Tooltip = observer((props: TooltipProps) => {
    const {
        header,
        text,
        mode = "neutral",
        size = "medium",
        textCenter,
        fullWidth,
        hide,
    }: TooltipProps = props;
    const contentClassName = clsx(
        styles.content,
        styles[mode],
        styles[size],
        fullWidth && styles.fullWidth,
    );

    if (!header && !text) {
        return props.children;
    }

    return hide ? (
        <>{props.children}</>
    ) : (
        <PopoverBase
            {...props}
            mode={mode}
            triggerEvent={"hover"}
            zIndex={110}
            content={
                <div className={contentClassName}>
                    {header && (
                        <Typo
                            variant={size === "large" ? "subheadXL" : "subheadM"}
                            className={clsx(styles.header, { [styles.textAlign]: textCenter })}
                        >
                            {header}
                        </Typo>
                    )}
                    {text && (
                        <Typo
                            variant={size === "large" ? "bodyXL" : "bodyM"}
                            className={clsx(styles.text, { [styles.textAlign]: textCenter })}
                        >
                            {text}
                        </Typo>
                    )}
                </div>
            }
        >
            {props.children}
        </PopoverBase>
    );
});
