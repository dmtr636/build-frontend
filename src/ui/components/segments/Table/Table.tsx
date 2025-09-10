import { ITableColumn, ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import styles from "./Table.module.scss";
import { clsx } from "clsx";
import { observer } from "mobx-react-lite";
import { TableDataRow } from "src/ui/components/segments/Table/TableDataRow/TableDataRow.tsx";
import { TableHeaderRow } from "src/ui/components/segments/Table/TableHeaderRow/TableHeaderRow.tsx";
import { useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

interface ITableProps<T> {
    data: T[];
    columns: ITableColumn<T>[];
    tableSettings: ITableSettings;
    onChangeTableSettings: (settings: ITableSettings) => void;
    onRowSelect?: (data: T, index: number) => void;
    rowLink?: (data: T) => string;
    activeSortField?: string;
    setActiveSortField?: (activeSort: string) => void;
    activeSortDirection?: string;
    setActiveSortDirection?: (activeSort: string) => void;
    selectedIndex?: number | null;
}

export const Table = observer(<T extends object>(props: ITableProps<T>) => {
    const [scrolledX, setScrolledX] = useState(false);
    const [scrolledY, setScrolledY] = useState(false);
    const tableHeaderWrapperRef = useRef<HTMLDivElement>(null);

    const columns = props.columns.filter((c) => props.tableSettings.columns.includes(c.field));

    return (
        <div className={styles.tableWrapper}>
            <div
                className={styles.tableHeaderWrapper}
                ref={tableHeaderWrapperRef}
                onScroll={(event) => {
                    event.preventDefault();
                }}
            >
                <TableHeaderRow
                    columns={columns}
                    scrolledX={scrolledX}
                    scrolledY={scrolledY}
                    activeSortField={props.activeSortField}
                    setActiveSortField={props.setActiveSortField}
                    activeSortDirection={props.activeSortDirection}
                    setActiveSortDirection={props.setActiveSortDirection}
                    tableSettings={props.tableSettings}
                    onChangeTableSettings={props.onChangeTableSettings}
                />
            </div>
            {!props.data.length && (
                <Typo
                    variant={"bodyL"}
                    style={{
                        padding: "10px 24px",
                        borderLeft: "1px solid var(--objects-stroke-neutral-tertiary, #E8EAED)",
                        borderRight: "1px solid var(--objects-stroke-neutral-tertiary, #E8EAED)",
                        borderBottom: "1px solid var(--objects-stroke-neutral-tertiary, #E8EAED)",
                        borderRadius: "0 0 12px 12px",
                    }}
                >
                    Здесь пока пусто
                </Typo>
            )}
            {!!props.data.length && (
                <Virtuoso
                    className={clsx(styles.table)}
                    totalCount={props.data.length}
                    useWindowScroll
                    itemContent={(index) => (
                        <TableDataRow
                            data={props.data[index]}
                            columns={columns}
                            size={props.tableSettings.compactMode ? "compact" : "large"}
                            onRowSelect={
                                props.onRowSelect
                                    ? (data) => props.onRowSelect?.(data, index)
                                    : undefined
                            }
                            rowLink={props.rowLink}
                            tableSettings={props.tableSettings}
                            scrolledX={scrolledX}
                            selected={props.selectedIndex === index}
                            key={"id" in props.data[index] ? `${props.data[index]["id"]}` : index}
                            last={index === props.data.length - 1}
                        />
                    )}
                    onScroll={(event) => {
                        if (event.target instanceof HTMLDivElement) {
                            if (tableHeaderWrapperRef.current) {
                                tableHeaderWrapperRef.current.scrollLeft = event.target.scrollLeft;
                            }
                            setScrolledX(!!event.target.scrollLeft);
                            setScrolledY(!!event.target.scrollTop);
                        }
                    }}
                    increaseViewportBy={200}
                />
            )}
        </div>
    );
});
