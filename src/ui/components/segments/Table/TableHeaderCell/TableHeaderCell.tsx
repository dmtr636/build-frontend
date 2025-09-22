import { observer } from "mobx-react-lite";
import { ITableColumn, ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { clsx } from "clsx";
import styles from "./TableHeaderCell.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { IconSorting } from "src/ui/assets/icons";
import { useCallback, useEffect, useState } from "react";
import { throttle } from "src/shared/utils/throttle.ts";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";

interface IProps<T> {
    column: ITableColumn<T>;
    scrolledX: boolean;
    flexGrow: number;
    activeSortField?: string;
    setActiveSortField?: (activeSortField: string) => void;
    activeSortDirection?: string;
    setActiveSortDirection?: (activeSort: string) => void;
    tableSettings: ITableSettings;
    onChangeTableSettings: (settings: ITableSettings) => void;
    headerRowHasBorderRadius?: boolean;
}

export const TableHeaderCell = observer(<T,>(props: IProps<T>) => {
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(props.column.width);
    const width = props.tableSettings.columnWidths?.[props.column.field] ?? props.column.width;
    const isActive = props.activeSortField === props.column.field;

    const handleMouseDown = (event: React.MouseEvent) => {
        setIsResizing(true);
        setStartX(event.clientX);
        setStartWidth(props.tableSettings.columnWidths?.[props.column.field] ?? props.column.width);
    };

    const handleMouseMove = useCallback(
        throttle((event: MouseEvent) => {
            if (isResizing) {
                const deltaX = event.clientX - startX;
                const newWidth = Math.max(props.column.sort ? 110 : 80, startWidth + deltaX);

                if (!props.tableSettings.columnWidths) {
                    props.tableSettings.columnWidths = {};
                }
                props.tableSettings.columnWidths[props.column.field] = newWidth;
                props.onChangeTableSettings(props.tableSettings);
            }
        }, 20),
        [startX, isResizing],
    );

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    const renderContent = () => {
        return (
            <>
                <TooltipTypo variant={"actionL"}>{props.column.name}</TooltipTypo>
                {props.column.sort && (
                    <IconSorting
                        className={clsx(
                            styles.iconSorting,
                            props.activeSortDirection === "asc" &&
                                isActive &&
                                styles.activeSortingAsc,
                            props.activeSortDirection === "desc" &&
                                isActive &&
                                styles.activeSortingDesc,
                        )}
                    />
                )}
            </>
        );
    };

    if (props.column.sort) {
        return (
            <button
                className={clsx(
                    styles.cell,
                    styles.clickable,
                    isActive && styles.active,
                    props.column.index && styles.index,
                    props.scrolledX && styles.scrolledX,
                    props.headerRowHasBorderRadius && styles.headerRowHasBorderRadius,
                )}
                style={{
                    width,
                    flexGrow: props.flexGrow,
                    position: props.column.index ? "sticky" : "relative",
                }}
                onClick={() => {
                    if (isActive) {
                        props.setActiveSortDirection?.(
                            props.activeSortDirection === "asc" ? "desc" : "asc",
                        );
                    } else {
                        props.setActiveSortField?.(props.column.field);
                    }
                }}
            >
                {renderContent()}
                <div
                    onMouseDown={handleMouseDown}
                    className={styles.dragHandleContainer}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        pointerEvents: (props.column.resizable ?? true) ? undefined : "none",
                    }}
                >
                    <div className={styles.dragHandle} />
                </div>
            </button>
        );
    }

    return (
        <div
            className={clsx(
                styles.cell,
                props.column.index && styles.index,
                props.scrolledX && styles.scrolledX,
                props.headerRowHasBorderRadius && styles.headerRowHasBorderRadius,
            )}
            style={{
                width,
                flexGrow: props.flexGrow,
                position: props.column.index ? "sticky" : "relative",
            }}
        >
            {renderContent()}
            <div
                onMouseDown={handleMouseDown}
                className={styles.dragHandleContainer}
                onClick={(e) => e.stopPropagation()}
                style={{
                    pointerEvents: (props.column.resizable ?? true) ? undefined : "none",
                }}
            >
                <div className={styles.dragHandle} />
            </div>
        </div>
    );
});
