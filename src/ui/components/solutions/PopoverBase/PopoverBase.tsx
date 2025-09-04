import styles from "./PopoverBase.module.scss";
import React, {
    cloneElement,
    CSSProperties,
    ReactElement,
    ReactNode,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { PopoverMode, PopoverTrigger, TipPosition } from "./PopoverBase.types.ts";
import { clsx } from "clsx";
import { createPortal } from "react-dom";
import { DRAWER_CONTAINER_ID } from "src/ui/components/segments/Drawer/Drawer.tsx";
import { layoutStore } from "src/app/AppStore.ts";
import { observer } from "mobx-react-lite";

export interface PopoverBaseProps {
    show?: boolean;
    setShow?: (show: boolean) => void;
    children: ReactElement;
    content: ReactNode;
    itemsLength?: number;
    triggerEvent: PopoverTrigger;
    mode?: PopoverMode;
    tipPosition?: TipPosition;
    delay?: number;
    maxWidth?: number;
    maxHeight?: number;
    fullWidth?: boolean;
    hideTip?: boolean;
    requireOverflow?: boolean;
    autoCloseDelay?: number;
    closeOnClick?: boolean;
    margin?: number;
    popoverChildren?: ReactNode;
    closeOnSecondClick?: boolean;
    itemKey?: string;
    closeOnBackdropClick?: boolean;
    zIndex?: number;
    container?: HTMLElement;
    cardStyle?: CSSProperties;
    disableAnimation?: boolean;
    disableRecalcPositionOnClick?: boolean;
}

const POPOVER_MARGIN = 8;
const ARROW_MARGIN = 16;
const ARROW_WIDTH = 12;

export const PopoverBase = observer((props: PopoverBaseProps) => {
    const {
        children,
        content,
        itemsLength,
        triggerEvent,
        mode = "accent",
        tipPosition,
        delay,
        maxWidth,
        fullWidth,
        maxHeight,
        hideTip,
        requireOverflow,
        autoCloseDelay,
        closeOnClick,
        margin = POPOVER_MARGIN,
        popoverChildren,
        closeOnSecondClick,
        closeOnBackdropClick,
        cardStyle,
        disableAnimation,
        disableRecalcPositionOnClick,
    }: PopoverBaseProps = props;
    const childrenRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState<{
        left?: number;
        top?: number;
    }>({
        left: 0,
        top: 0,
    });
    const delayTimeoutRef = useRef<NodeJS.Timeout>();
    const container: HTMLElement =
        props.container ?? document.getElementById(DRAWER_CONTAINER_ID) ?? document.body;

    useLayoutEffect(() => {
        setShow(props.show ?? show);
    }, [props.show]);

    useEffect(() => {
        props.setShow?.(show);
        if (show && autoCloseDelay) {
            setTimeout(() => {
                setShow(false);
            }, autoCloseDelay);
        }
    }, [show]);

    useEffect(() => {
        const childrenElement = childrenRef.current;
        if (!childrenElement) {
            return;
        }
        const cleanup = initializeEventListeners(childrenElement);
        return () => cleanup();
    }, [show, triggerEvent]);

    const getArrowSide = () => {
        if (tipPosition) {
            return tipPosition.split("-")[0];
        }
        const childrenElement = childrenRef.current!;
        const popoverElement = popoverRef.current!;
        if (!childrenElement || !popoverElement) {
            return "top";
        }
        const childrenRect = childrenElement.getBoundingClientRect();
        const popoverHeight = popoverElement.clientHeight;
        if (
            childrenRect.top + childrenRect.height + margin + popoverHeight >=
            window.innerHeight - layoutStore.tabBarHeight
        ) {
            if (childrenRect.top - margin >= popoverHeight) {
                return "bottom";
            }
        }
        return "top";
    };

    useLayoutEffect(() => {
        if (show) {
            calcPosition();
            setTimeout(() => {
                calcPosition();
            });
        }
    }, [show, itemsLength, container, props.itemKey]);

    const getScrollbarWidth = () => {
        if (!cardRef.current) {
            return 0;
        }
        return cardRef.current.offsetWidth - cardRef.current.clientWidth;
    };

    const initializeEventListeners = (element: HTMLElement) => {
        if (triggerEvent === "click") {
            element.addEventListener("click", handleMouseClick);
            element.addEventListener("input", handleInput);
            document.addEventListener("click", handleDocumentClick);
            if (show) {
                container.addEventListener("scroll", handleWindowResize);
                window.addEventListener("resize", handleWindowResize);
            }
        }
        if (triggerEvent === "none") {
            document.addEventListener("click", handleDocumentClick);
            if (show) {
                window.addEventListener("resize", handleWindowResize);
            }
        }
        if (triggerEvent === "hover") {
            element.addEventListener("click", handleMouseClickForHoverTrigger);
            element.addEventListener("mouseenter", handleMouseEnter);
            element.addEventListener("mouseleave", handleMouseLeave);
            document.addEventListener("wheel", handleMouseLeave);
            if (closeOnClick) {
                element.addEventListener("click", handleClose);
            }
            if (show) {
                container.addEventListener("scroll", handleWindowResize);
            }
        }
        return () => {
            element.removeEventListener("click", handleClose);
            element.removeEventListener("click", handleMouseClick);
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
            element.removeEventListener("input", handleInput);
            element.removeEventListener("click", handleMouseClickForHoverTrigger);
            window.removeEventListener("resize", handleWindowResize);
            document.removeEventListener("click", handleDocumentClick);
            document.removeEventListener("wheel", handleMouseLeave);
            container.removeEventListener("scroll", handleWindowResize);
        };
    };

    const calcPosition = () => {
        const childrenElement = childrenRef.current;
        const popoverElement = popoverRef.current;
        if (!childrenElement || !popoverElement) {
            return;
        }
        const childrenRect = childrenElement.getBoundingClientRect();
        const childrenWidth = childrenRect.width;
        const childrenHeight = childrenRect.height;
        const popoverRect = popoverElement.getBoundingClientRect();
        const popoverHeight = popoverRect.height;
        const popoverWidth = popoverRect.width;
        const arrowSide = getArrowSide();

        let offsetY = 0;
        let offsetX = 0;

        if (arrowSide === "top") {
            offsetX = getPositionOffset(childrenWidth, popoverWidth);
            offsetY = childrenHeight + margin;
        }
        if (arrowSide === "bottom") {
            offsetX = getPositionOffset(childrenWidth, popoverWidth);
            offsetY = -popoverHeight - margin;
        }
        if (arrowSide === "left") {
            offsetX = childrenWidth + margin;
            offsetY = getPositionOffset(childrenHeight, popoverHeight);
        }
        if (arrowSide === "right") {
            offsetX = -popoverWidth - margin;
            offsetY = getPositionOffset(childrenHeight, popoverHeight);
        }

        if (hideTip && tipPosition === "top-left") {
            offsetX -= childrenWidth / 2 - ARROW_WIDTH / 2 - ARROW_MARGIN;
        }

        if (hideTip && tipPosition === "top-right") {
            offsetX += childrenWidth / 2 - ARROW_WIDTH / 2 - ARROW_MARGIN;
        }

        setPosition({
            left:
                childrenRect.left +
                offsetX +
                container.scrollLeft -
                container.offsetLeft +
                window.scrollX,
            top: childrenRect.top + offsetY + container.scrollTop + window.scrollY,
        });
    };

    const getPositionOffset = (childrenSize: number, popoverSize: number) => {
        const arrowAlign = getArrowAlign();
        let offset = childrenSize / 2;
        if (arrowAlign === "start") {
            offset -= ARROW_MARGIN + ARROW_WIDTH / 2;
        }
        if (arrowAlign === "center") {
            offset -= popoverSize / 2;
        }
        if (arrowAlign === "end") {
            offset -= popoverSize - ARROW_MARGIN - ARROW_WIDTH / 2;
            if (hideTip) {
                offset -= ARROW_MARGIN - childrenSize / 2 + ARROW_WIDTH / 2;
            }
        }
        const scrollBarWidth = getScrollbarWidth();
        if (fullWidth && scrollBarWidth && childrenSize !== popoverSize) {
            offset += scrollBarWidth / 2;
        }
        return offset;
    };

    const handleInput = () => {
        setTimeout(() => {
            setShow(true);
        }, 100);
    };

    const handleClose = () => {
        setShow(false);
    };

    const handleMouseClick = () => {
        if (show && closeOnSecondClick === false) {
            return;
        }
        setShow((show) => !show);
    };

    const handleMouseClickForHoverTrigger = () => {
        if (show && disableRecalcPositionOnClick) {
            return;
        }
        setTimeout(() => {
            calcPosition();
        });
    };

    const handleWindowResize = () => {
        calcPosition();
    };

    const handleDocumentClick = (event: MouseEvent) => {
        if (!show) {
            return;
        }
        const target = event.target;
        if (
            target instanceof Node &&
            [childrenRef, popoverRef].some((ref) => ref.current?.contains(target))
        ) {
            return;
        }
        if (closeOnBackdropClick === false) {
            return;
        }
        setShow(false);
    };

    const handleMouseEnter = () => {
        if (
            requireOverflow &&
            childrenRef.current &&
            childrenRef.current.offsetWidth === childrenRef.current.scrollWidth
        ) {
            return;
        }
        if (delay) {
            clearTimeout(delayTimeoutRef.current);
            delayTimeoutRef.current = setTimeout(() => {
                setShow(true);
            }, delay);
        } else {
            setShow(true);
        }
    };

    const handleMouseLeave = () => {
        clearTimeout(delayTimeoutRef.current);
        setShow(false);
    };

    const getArrowAlign = () => {
        let align = "center";
        if (tipPosition) {
            align = tipPosition.split("-")[1];
        }
        const map: Record<string, string> = {
            top: "start",
            bottom: "end",
            center: "center",
            left: "start",
            right: "end",
        };
        return map[align];
    };

    const renderPopoverContent = () => {
        const arrowSide = getArrowSide();
        const arrowAlign = getArrowAlign();
        const popoverClassName = clsx(
            styles.popover,
            styles[mode],
            styles[arrowSide],
            styles[arrowAlign],
        );
        const arrowClassName = clsx(styles.arrow, styles[arrowSide]);
        let width = fullWidth && childrenRef.current?.clientWidth;
        if (width) {
            width += getScrollbarWidth();
        }
        return createPortal(
            <div
                ref={popoverRef}
                className={popoverClassName}
                style={{
                    ...position,
                    width: width ? `${width}px` : undefined,
                    zIndex: props.zIndex,
                    animationDuration: disableAnimation ? "0s" : undefined,
                }}
                onClick={(event) => {
                    event.stopPropagation();
                }}
                onWheel={(event) => {
                    event.stopPropagation();
                }}
            >
                {!hideTip && <div className={arrowClassName} />}
                <div className={styles.cardWrapper} style={cardStyle}>
                    <div
                        ref={cardRef}
                        className={clsx(styles.card, styles[mode])}
                        style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
                    >
                        {content}
                    </div>
                </div>
                {popoverChildren}
            </div>,
            container,
        );
    };

    return (
        <>
            {show && renderPopoverContent()}
            {cloneElement(children, {
                _ref: ["a", "span"].includes(children.type as string) ? undefined : childrenRef,
                ref: childrenRef,
            })}
        </>
    );
});
