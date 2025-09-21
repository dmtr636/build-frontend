import { observer } from "mobx-react-lite";
import {
    ITableColumn,
    ITableSettings,
    ITableSize,
} from "src/ui/components/segments/Table/Table.types.ts";
import { clsx } from "clsx";
import styles from "./TableDataRow.module.scss";
import { TableDataCell } from "src/ui/components/segments/Table/TableDataCell/TableDataCell.tsx";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

interface IProps<T> {
    data: T;
    columns: ITableColumn<T>[];
    size: ITableSize;
    onRowSelect?: (data: T) => void;
    onRowClick?: (data: T) => void;
    rowLink?: (data: T) => string;
    tableSettings: ITableSettings;
    scrolledX: boolean;
    selected?: boolean;
    last?: boolean;
    dynamicRowHeight?: boolean;
}

export const TableDataRow = observer(<T,>(props: IProps<T>) => {
    const ref = useRef<HTMLElement>();
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (props.selected) {
            ref.current?.focus();
        }
    }, [props.selected]);

    const renderContent = () =>
        props.columns.map((column, index) => (
            <TableDataCell
                data={props.data}
                column={column}
                key={index}
                size={props.size}
                scrolledX={props.scrolledX}
                flexGrow={index === props.columns.length - 1 ? 1 : 0}
                selected={props.selected}
                tableSettings={props.tableSettings}
                dynamicRowHeight={props.dynamicRowHeight}
                hovered={hovered}
            />
        ));

    if (props.rowLink && !props.tableSettings.quickView) {
        return (
            <Link
                ref={ref as any}
                to={props.rowLink(props.data)}
                className={clsx(
                    styles.row,
                    styles[props.size],
                    props.last && styles.last,
                    props.dynamicRowHeight && styles.dynamicRowHeight,
                )}
                target={props.tableSettings.openPageInNewTab ? "_blank" : undefined}
            >
                {renderContent()}
            </Link>
        );
    }

    if (props.onRowSelect) {
        return (
            <button
                ref={ref as any}
                className={clsx(
                    styles.row,
                    styles[props.size],
                    props.last && styles.last,
                    props.dynamicRowHeight && styles.dynamicRowHeight,
                )}
                onClick={() => props.onRowSelect?.(props.data)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {renderContent()}
            </button>
        );
    }

    return (
        <div
            className={clsx(
                styles.row,
                styles[props.size],
                props.last && styles.last,
                props.dynamicRowHeight && styles.dynamicRowHeight,
                props.onRowClick && styles.clickable,
            )}
            onClick={() => props.onRowClick?.(props.data)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {renderContent()}
        </div>
    );
});
