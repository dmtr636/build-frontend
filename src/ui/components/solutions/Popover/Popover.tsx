import { ReactNode } from "react";
import styles from "./Popover.module.scss";
import { clsx } from "clsx";
import {
    PopoverBase,
    PopoverBaseProps,
} from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

interface PopoverProps extends Omit<PopoverBaseProps, "triggerEvent" | "content"> {
    header?: string;
    text?: string;
    footer?: ReactNode;
    size?: "large" | "medium";
    videoUrl?: string;
    videoSize?: [number, number];
}

const PADDING = 24;
const POPOVER_MAX_WIDTH = 304 - PADDING;

export const Popover = (props: PopoverProps) => {
    const maxWidth = props.maxWidth ?? props.videoSize?.[0] ?? POPOVER_MAX_WIDTH;

    const { header, text, footer, mode = "accent", size = "medium" }: PopoverProps = props;

    const contentClassName = clsx(styles.content, styles[mode]);

    return (
        <PopoverBase
            {...props}
            triggerEvent={"click"}
            maxWidth={maxWidth + 24}
            content={
                <div className={contentClassName} style={{ maxWidth: maxWidth + 24 }}>
                    {header && (
                        <Typo
                            variant={size === "large" ? "subheadXL" : "subheadM"}
                            className={styles.header}
                        >
                            {header}
                        </Typo>
                    )}
                    {text && (
                        <Typo
                            variant={size === "large" ? "bodyXL" : "bodyM"}
                            className={styles.text}
                        >
                            {text}
                        </Typo>
                    )}
                    {footer && <div className={styles.footer}>{footer}</div>}
                    {props.videoUrl && (
                        <video
                            src={props.videoUrl}
                            autoPlay
                            loop
                            muted
                            controls={false}
                            width={props.videoSize?.[0]}
                            height={props.videoSize?.[1]}
                        />
                    )}
                </div>
            }
        >
            {props.children}
        </PopoverBase>
    );
};
