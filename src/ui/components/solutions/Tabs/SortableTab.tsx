import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tab, TabsSize } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { clsx } from "clsx";
import styles from "src/ui/components/solutions/Tabs/Tabs.module.scss";
import { TypoVariant } from "src/ui/components/atoms/Typo/Typo.types.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";
import React, { cloneElement, isValidElement, ReactNode } from "react";
import { observer } from "mobx-react-lite";

export interface SortableTabProps<T> {
    tab: Tab<T>;
    value: T;
    onChange: (value: T, event: React.MouseEvent) => void;
    type?: "primary" | "secondary";
    size?: TabsSize;
    mode?: "accent" | "brand" | "neutral";
    onReorder?: (tabs: Tab<T>[]) => void;
    reorderCard?: boolean;
}

export const SortableTab = observer(<T,>(props: SortableTabProps<T>) => {
    const {
        tab,
        value,
        onChange,
        type = "primary",
        size = "medium",
        mode = "accent",
    }: SortableTabProps<T> = props;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: tab.name,
        disabled: tab.disableSort,
    });

    const style = !tab.disableSort
        ? {
              transform: CSS.Translate.toString(transform),
              transition,
              zIndex: isDragging ? 1 : undefined,
          }
        : undefined;

    const renderPrimaryTab = (tab: Tab<T>) => {
        return (
            <button
                className={clsx(
                    styles.button,
                    props.onReorder && !props.tab.disableSort && styles.dragMode,
                )}
                onClick={(event) => {
                    onChange(tab.value, event);
                }}
                key={tab.name}
            >
                <div
                    className={clsx(styles.tab, styles[type], styles[size], styles[mode], {
                        [styles.active]: tab.value === value,
                    })}
                    key={tab.name}
                >
                    {renderTabContent(tab)}
                </div>
            </button>
        );
    };

    const renderSecondaryTab = (tab: Tab<T>) => {
        return (
            <button
                className={clsx(styles.tab, styles[type], styles[size], styles[mode], {
                    [styles.active]: tab.value === value,
                })}
                onClick={(event) => onChange(tab.value, event)}
                key={tab.name}
            >
                {renderTabContent(tab)}
            </button>
        );
    };

    const renderTabContent = (tab: Tab<T>) => {
        const typoMap: Record<TabsSize, TypoVariant> = {
            large: "actionXL",
            medium: "actionL",
            small: "actionM",
        };
        return (
            <>
                <div className={styles.startContent}>
                    {renderIcon(tab.iconBefore)}
                    <Typo variant={typoMap[size]} noWrap={true}>
                        {tab.name}
                    </Typo>
                </div>
                {(tab.iconAfter || tab.customIconAfter || tab.counter !== undefined) && (
                    <div className={styles.endContent}>
                        {renderIcon(tab.iconAfter)}
                        {tab.customIconAfter}
                        {!!tab.counter && (
                            <Counter
                                type={"primary"}
                                mode={tab.value === value ? mode : "neutral"}
                                size={size}
                                value={tab.counter}
                            />
                        )}
                    </div>
                )}
            </>
        );
    };

    const renderIcon = (icon?: ReactNode, className?: string) => {
        if (isValidElement<SVGElement>(icon)) {
            return cloneElement(icon, {
                className: clsx(styles.icon, className),
                ...(!props.reorderCard ? {} : listeners),
            });
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(props.reorderCard ? {} : listeners)}
        >
            {type === "primary" ? renderPrimaryTab(tab) : renderSecondaryTab(tab)}
        </div>
    );
});
