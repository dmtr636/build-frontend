import { observer } from "mobx-react-lite";
import { ITableColumn, ITableSettings } from "src/ui/components/segments/Table/Table.types.ts";
import { clsx } from "clsx";
import styles from "./TableHeaderRow.module.scss";
import { TableHeaderCell } from "src/ui/components/segments/Table/TableHeaderCell/TableHeaderCell.tsx";

interface IProps<T> {
    columns: ITableColumn<T>[];
    scrolledX: boolean;
    scrolledY: boolean;
    activeSortField?: string;
    setActiveSortField?: (activeSort: string) => void;
    activeSortDirection?: string;
    setActiveSortDirection?: (activeSort: string) => void;
    tableSettings: ITableSettings;
    onChangeTableSettings: (settings: ITableSettings) => void;
}

export const TableHeaderRow = observer(<T,>(props: IProps<T>) => {
    const renderContent = () =>
        props.columns.map((column, index) => (
            <TableHeaderCell
                activeSortField={props.activeSortField}
                setActiveSortField={props.setActiveSortField}
                activeSortDirection={props.activeSortDirection}
                setActiveSortDirection={props.setActiveSortDirection}
                column={column}
                key={index}
                scrolledX={props.scrolledX}
                flexGrow={index === props.columns.length - 1 ? 1 : 0}
                tableSettings={props.tableSettings}
                onChangeTableSettings={props.onChangeTableSettings}
            />
        ));

    return (
        <div className={clsx(styles.row, props.scrolledY && styles.scrolledY)}>
            {renderContent()}
        </div>
    );
});
