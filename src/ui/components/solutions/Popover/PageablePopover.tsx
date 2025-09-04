import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./Popover.module.scss";
import { clsx } from "clsx";
import {
    PopoverBase,
    PopoverBaseProps,
} from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Spacing } from "src/ui/components/atoms/Spacing/Spacing.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconBack, IconClose, IconEdit, IconNext, IconZoom } from "src/ui/assets/icons";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";

export interface PopoverPage {
    header?: string;
    text?: ReactNode;
    footer?: ReactNode;
    videoUrl?: string;
    videoSize?: [number, number];
    imageUrl?: string;
    imageSize?: [number, number];
    textExamples?: string[];
    zoomAllowed?: boolean;
}

interface PageablePopoverProps extends Omit<PopoverBaseProps, "triggerEvent" | "content"> {
    pages: PopoverPage[];
    size?: "large" | "medium";
    recommendationIndex?: number;
    setRecommendationIndex?: (index: number) => void;
    onCopy?: (text: string) => void;
}

const PADDING = 24;
const POPOVER_MAX_WIDTH = 304;

export const PageablePopover = (props: PageablePopoverProps) => {
    const { pages, mode = "accent", size = "medium" }: PageablePopoverProps = props;
    const [pageIndex, setPageIndex] = useState(props.recommendationIndex ?? 0);
    const pagesRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [showImageOverlay, setShowImageOverlay] = useState(false);

    useEffect(() => {
        if (pageIndex > pages.length - 1) {
            setPageIndex(0);
        }
    }, [pages.length]);

    useEffect(() => {
        setPageIndex(props.recommendationIndex ?? pageIndex);
    }, [props.recommendationIndex]);

    const maxWidth = POPOVER_MAX_WIDTH;

    const renderPage = (page: PopoverPage, index: number) => {
        if (!page) {
            return null;
        }
        const { header, text, footer, videoUrl, videoSize, imageUrl, imageSize } = page;

        const contentClassName = clsx(styles.content, styles[mode]);

        return (
            <div
                className={contentClassName}
                style={{
                    maxWidth: maxWidth,
                    width: maxWidth,
                    position: pageIndex !== index ? "absolute" : undefined,
                    visibility: pageIndex !== index ? "hidden" : undefined,
                }}
                ref={(el) => (pagesRefs.current[index] = el)}
            >
                {videoUrl && (
                    <video
                        src={videoUrl}
                        autoPlay
                        loop
                        muted
                        controls={false}
                        width={videoSize?.[0] ?? maxWidth - PADDING}
                        height={videoSize?.[1] ?? ((maxWidth - PADDING) * 2) / 3}
                        style={{
                            marginBottom: 4,
                            borderRadius: 4,
                        }}
                    />
                )}
                {imageUrl && (
                    <div
                        className={clsx(styles.image, page.zoomAllowed && styles.clickable)}
                        onClick={() => {
                            if (page.zoomAllowed) {
                                setShowImageOverlay(true);
                            }
                        }}
                    >
                        <img
                            src={imageUrl}
                            style={{
                                width: imageSize?.[0] ?? maxWidth - PADDING,
                                height: imageSize?.[1],
                                objectFit: "cover",
                                marginBottom: 4,
                                borderRadius: 4,
                            }}
                            alt={""}
                        />
                        {page.zoomAllowed && (
                            <ButtonIcon
                                mode={"neutral"}
                                type={"primary"}
                                className={styles.zoomIcon}
                            >
                                <IconZoom />
                            </ButtonIcon>
                        )}
                    </div>
                )}
                {header && (
                    <Typo
                        variant={size === "large" ? "subheadXL" : "subheadM"}
                        className={styles.header}
                    >
                        {header}
                    </Typo>
                )}
                {text && (
                    <Typo variant={size === "large" ? "bodyXL" : "bodyM"} className={styles.text}>
                        {text}
                    </Typo>
                )}
                {footer && <div className={styles.footer}>{footer}</div>}
                {pages.length > 1 && (
                    <div className={styles.pagination}>
                        {props.onCopy && typeof text === "string" && (
                            <Button
                                iconBefore={<IconEdit />}
                                mode={"brand"}
                                onClick={() => {
                                    props.onCopy?.(text);
                                    props.setShow?.(false);
                                }}
                            />
                        )}
                        <Typo
                            variant={"actionXL"}
                            mode={"neutral"}
                            type={"quaternary"}
                            style={{ marginLeft: "auto" }}
                        >
                            {pageIndex + 1} / {pages.length}
                        </Typo>
                        <Spacing width={16} />
                        <ButtonIcon
                            type={"primary"}
                            mode={"brand"}
                            onClick={() => {
                                const index = pageIndex === 0 ? pages.length - 1 : pageIndex - 1;
                                setPageIndex(index);
                                props.setRecommendationIndex?.(index);
                            }}
                        >
                            <IconBack />
                        </ButtonIcon>
                        <Spacing width={12} />
                        <ButtonIcon
                            type={"primary"}
                            mode={"brand"}
                            onClick={() => {
                                const index = pageIndex === pages.length - 1 ? 0 : pageIndex + 1;
                                setPageIndex(index);
                                props.setRecommendationIndex?.(index);
                            }}
                        >
                            <IconNext />
                        </ButtonIcon>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <PopoverBase
                {...props}
                triggerEvent={"click"}
                maxWidth={maxWidth}
                content={renderPage(pages[pageIndex], pageIndex)}
                itemKey={`${pageIndex}`}
            >
                {props.children}
            </PopoverBase>
            {pages[pageIndex]?.imageUrl && showImageOverlay && (
                <Overlay
                    open={showImageOverlay}
                    onClose={() => {
                        setShowImageOverlay(false);
                    }}
                    closeOnBackdropClick={true}
                    styles={{
                        content: {
                            padding: 0,
                            margin: 0,
                        },
                    }}
                >
                    <img
                        src={pages[pageIndex].imageUrl}
                        style={{
                            width: 842,
                            objectFit: "cover",
                        }}
                        alt={""}
                    />
                    <ButtonIcon
                        mode={"neutral"}
                        type={"primary"}
                        size={"large"}
                        onClick={() => {
                            setShowImageOverlay(false);
                        }}
                        style={{
                            position: "absolute",
                            top: -26,
                            right: -26,
                        }}
                    >
                        <IconClose />
                    </ButtonIcon>
                </Overlay>
            )}
        </>
    );
};
