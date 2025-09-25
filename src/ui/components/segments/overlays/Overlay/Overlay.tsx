import styles from "./Overlay.module.scss";
import { IconClose } from "src/ui/assets/icons";
import React, {
    CSSProperties,
    ReactNode,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { createPortal } from "react-dom";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { clsx } from "clsx";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";
import { observer } from "mobx-react-lite";
import { layoutStore } from "src/app/AppStore.ts";
import { useLocation, useSearchParams } from "react-router-dom";
import { useNavigateBack } from "src/shared/hooks/useNavigateBack.ts";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";

interface OverlayProps {
    open: boolean;
    onClose?: () => void;
    title?: ReactNode;
    titleIcon?: ReactNode;
    children: ReactNode;
    actions?: ReactNode[];
    closeOnBackdropClick?: boolean;
    hideBackdrop?: boolean;
    mode?: "accent" | "neutral" | "negative";
    styles?: {
        card?: CSSProperties;
        content?: CSSProperties;
        background?: CSSProperties;
    };
    noTitleClose?: boolean;
    onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
    titleVariant?: TypoVariant;
    titleMode?: "accent" | "negative" | "positive" | "neutral" | "contrast" | "brand";
    titleType?: "primary" | "secondary" | "tertiary" | "quaternary";
    draggable?: boolean;
    uploadingOverlay?: boolean;
}

export const Overlay = observer((props: OverlayProps) => {
    const {
        open,
        onClose,
        title,
        children,
        actions,
        closeOnBackdropClick,
        hideBackdrop,
        mode = "neutral",
        titleVariant = "h5",
        titleMode,
        titleType,
        noTitleClose,
        draggable = true,
        uploadingOverlay,
    }: OverlayProps = props;
    const dragging = useRef(false);
    const translate = useRef({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isMobile = layoutStore.isMobile;
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;
    const navigateBack = useNavigateBack();
    const linkedToRouting = useRef(false);
    const linkedToRouting2 = useRef(false);
    const location = useLocation();
    const [overflowed, setOverflowed] = useState(false);
    const scrollBarWidth = useMemo(() => getScrollBarWidth(), []);
    const [scrolled, setScrolled] = useState(false);

    useLayoutEffect(() => {
        if (open) {
            setScrolled(false);
            setOverflowed(false);
        }
    }, [open]);

    useEffect(() => {
        const element = contentRef.current;
        if (!element) {
            return;
        }
        const checkOverflow = () => {
            setOverflowed(element.scrollHeight > element.offsetHeight);
        };
        checkOverflow();
        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(element);
        return () => resizeObserver.unobserve(element);
    }, [contentRef.current]);

    useEffect(() => {
        if (open) {
            translate.current = { x: 0, y: 0 };
            document.addEventListener("mouseup", handleDocumentMouseUp);
            document.documentElement.style.overflow = "hidden";
            layoutStore.overflowHidden = true;
        }
        return () => {
            document.removeEventListener("mouseup", handleDocumentMouseUp);
            setTimeout(() => {
                if (
                    window.location.search.includes("overlay=open") ||
                    window.location.search.includes("overlay2=open")
                ) {
                    return;
                }
                document.documentElement.style.overflow = "initial";
                layoutStore.overflowHidden = false;
            });
        };
    }, [open]);

    useEffect(() => {
        if (!searchParams.has("overlay") && linkedToRouting.current && open) {
            onClose?.();
            linkedToRouting.current = false;
        }
        if (!searchParams.has("overlay2") && linkedToRouting2.current && open) {
            onClose?.();
            linkedToRouting2.current = false;
        }
    }, [searchParams, open]);

    useEffect(() => {
        if (!open || !onClose) {
            return;
        }
        if (!searchParams.has("overlay")) {
            setSearchParams((searchParams) => {
                searchParams.set("overlay", "open");
                return searchParams;
            });
            linkedToRouting.current = true;

            return () => {
                if (searchParamsRef.current.has("overlay")) {
                    if (window.location.pathname === location.pathname) {
                        navigateBack();
                    }
                }
                linkedToRouting.current = false;
            };
        } else if (!searchParams.has("overlay2")) {
            setSearchParams((searchParams) => {
                searchParams.set("overlay2", "open");
                return searchParams;
            });
            linkedToRouting2.current = true;

            return () => {
                if (searchParamsRef.current.has("overlay2")) {
                    if (window.location.pathname === location.pathname) {
                        navigateBack();
                    }
                }
                linkedToRouting2.current = false;
            };
        }
    }, [open]);

    const handleDocumentMouseUp = () => {
        dragging.current = false;
    };

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className={clsx(styles.background, hideBackdrop && styles.hideBackdrop)}
            style={props.styles?.background}
            onClick={() => {
                if (closeOnBackdropClick) {
                    onClose?.();
                }
            }}
            onMouseMove={(event) => {
                if (dragging.current && cardRef.current) {
                    let { x, y } = translate.current;
                    x += event.movementX;
                    y += event.movementY;
                    translate.current = { x, y };
                    cardRef.current.style.translate = `${x}px ${y}px`;
                }
            }}
            onPaste={props.onPaste}
        >
            <div
                ref={cardRef}
                className={clsx(styles.card, uploadingOverlay && styles.uploadingOverlay)}
                style={props.styles?.card}
                onClick={(event) => {
                    if (closeOnBackdropClick) {
                        event.stopPropagation();
                    }
                }}
            >
                {props.title !== undefined && (
                    <div
                        className={clsx(
                            styles.header,
                            styles[mode],
                            draggable && styles.draggable,
                            overflowed && styles.overflowed,
                        )}
                        onMouseDown={() => {
                            if (draggable) {
                                dragging.current = true;
                            }
                        }}
                    >
                        <Typo
                            variant={titleVariant}
                            type={titleType}
                            mode={titleMode}
                            className={clsx(styles.title, draggable && styles.draggable)}
                        >
                            {props.titleIcon}
                            {title}
                        </Typo>
                        {onClose && (
                            <ButtonIcon
                                /*
                                className={styles.closeIcon}
*/
                                onClick={onClose}
                                type={"outlined"}
                                mode={"neutral"}
                                size={"small"}
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                <IconClose />
                            </ButtonIcon>
                        )}
                        {overflowed && scrolled && <div className={styles.gradientTop} />}
                    </div>
                )}
                {onClose && noTitleClose && (
                    <ButtonIcon
                        className={styles.closeIcon}
                        onClick={onClose}
                        type={"primary"}
                        mode={"neutral"}
                        size={isMobile ? "medium" : "large"}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <IconClose />
                    </ButtonIcon>
                )}
                <div
                    className={styles.content}
                    style={{
                        ...props.styles?.content,
                        paddingRight: `${32 - (overflowed ? scrollBarWidth : 0)}px`,
                        paddingBottom: overflowed ? "40px" : undefined,
                    }}
                    ref={contentRef}
                    onScroll={() => {
                        setScrolled(!!contentRef.current?.scrollTop);
                    }}
                >
                    {children}
                </div>
                {!!actions?.length && (
                    <div className={clsx(styles.actions, overflowed && styles.overflowed)}>
                        {actions.map((action, index) => (
                            <div
                                key={index}
                                style={{
                                    width: actions.length === 1 ? "100%" : undefined,
                                }}
                            >
                                {action}
                            </div>
                        ))}
                        {overflowed && <div className={styles.gradient} />}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
});
