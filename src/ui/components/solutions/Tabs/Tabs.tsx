import styles from "./Tabs.module.scss";
import { clsx } from "clsx";
import React, { CSSProperties, ReactNode, useRef, useState } from "react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTab } from "src/ui/components/solutions/Tabs/SortableTab.tsx";
import { IconDrag } from "src/ui/assets/icons";
import { restrictToHorizontalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { observer } from "mobx-react-lite";

export interface Tab<T = string> {
    name: string;
    value: T;
    iconBefore?: ReactNode;
    iconAfter?: ReactNode;
    customIconAfter?: ReactNode;
    counter?: number;
    disableSort?: boolean;
}

export type TabsSize = "large" | "medium" | "small";

export interface TabsProps<T> {
    tabs: Tab<T>[];
    value: T;
    onChange: (value: T) => void;
    type?: "primary" | "secondary";
    size?: TabsSize;
    mode?: "accent" | "brand" | "neutral";
    onReorder?: (tabs: Tab<T>[]) => void;
    style?: CSSProperties;
    reorderCard?: boolean;
    noBottomBorder?: boolean;
}

export const Tabs = observer(<T = string,>(props: TabsProps<T>) => {
    const { tabs, type = "primary", onReorder }: TabsProps<T> = props;
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const draggingTimeoutRef = useRef<number>();
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (props.onReorder) {
            return;
        }
        if (!scrollRef.current) {
            return;
        }
        setIsMouseDown(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        if (props.onReorder) {
            return;
        }
        setIsMouseDown(false);
    };

    const handleMouseUp = () => {
        if (props.onReorder) {
            return;
        }
        setIsMouseDown(false);
        clearTimeout(draggingTimeoutRef.current);
        draggingTimeoutRef.current = window.setTimeout(() => {
            setIsDragging(false);
        }, 10);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (props.onReorder) {
            return;
        }
        if (!scrollRef.current) {
            return;
        }
        if (scrollRef.current.offsetWidth >= scrollRef.current.scrollWidth) {
            return;
        }
        if (!isMouseDown) return;
        setIsMouseDown(true);
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = x - startX;
        scrollRef.current.scrollLeft = scrollLeft - walk;
        if (Math.abs(walk) >= 8) {
            setIsDragging(true);
        }
    };

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        if (event.active.id !== event.over?.id) {
            let newIndex = tabs.findIndex((tab) => tab.name === event.over?.id);
            if (event.over?.id === "Все") {
                newIndex++;
            }
            const oldIndex = tabs.findIndex((tab) => tab.name === event.active.id);
            const newTabs = arrayMove(tabs, oldIndex, newIndex);
            onReorder?.(newTabs);
        }
    };

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            modifiers={[props.reorderCard ? restrictToParentElement : restrictToHorizontalAxis]}
        >
            <SortableContext
                items={tabs.map((tab) => tab.name)}
                strategy={
                    props.reorderCard ? verticalListSortingStrategy : horizontalListSortingStrategy
                }
                disabled={!props.onReorder}
            >
                <div
                    className={clsx(
                        styles.tabs,
                        styles[type],
                        props.reorderCard && styles.reorderCard,
                    )}
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={props.style}
                >
                    {tabs.map((tab) => (
                        <SortableTab
                            {...props}
                            key={tab.name}
                            tab={{
                                ...tab,
                                iconBefore: props.onReorder ? (
                                    tab.disableSort ? (
                                        tab.iconBefore
                                    ) : (
                                        <IconDrag />
                                    )
                                ) : (
                                    tab.iconBefore
                                ),
                            }}
                            onChange={(value, event: any) => {
                                const tabElement = event.target.parentElement.parentElement;
                                tabElement?.scrollIntoView({
                                    behavior: "smooth",
                                    inline: "center",
                                    block: "nearest",
                                });
                                if (!isDragging) {
                                    props.onChange(value);
                                }
                            }}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
});
