import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";
import { TooltipMode } from "src/ui/components/info/Tooltip/Tooltip.types.ts";
import { ReactNode } from "react";
import { TipPosition } from "src/ui/components/solutions/PopoverBase/PopoverBase.types.ts";

interface TooltipTypoProps {
    variant: TypoVariant;
    children: ReactNode;
    mode?: TooltipMode;
    className?: string;
    closeOnClick?: boolean;
    tipPosition?: TipPosition;
    fullWidth?: boolean;
    typoProps?: {
        mode?: "accent" | "negative" | "positive" | "neutral" | "contrast" | "brand";
        type?: "primary" | "secondary" | "tertiary" | "quaternary";
    };
    disableTooltip?: boolean;
}

export const TooltipTypo = (props: TooltipTypoProps) => {
    const {
        variant,
        children,
        mode = "neutral",
        className,
        closeOnClick,
        disableTooltip,
    }: TooltipTypoProps = props;
    return (
        <Tooltip
            text={disableTooltip ? "" : children}
            mode={mode}
            requireOverflow
            closeOnClick={closeOnClick}
            tipPosition={props.tipPosition}
            fullWidth={props.fullWidth}
        >
            <Typo variant={variant} noWrap className={className} {...props.typoProps}>
                {children}
            </Typo>
        </Tooltip>
    );
};
