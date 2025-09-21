import { observer } from "mobx-react-lite";
import {
    ITableColumn,
    ITableSettings,
    ITableSize,
} from "src/ui/components/segments/Table/Table.types.ts";
import { clsx } from "clsx";
import styles from "./TableDataCell.module.scss";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

interface IProps<T> {
    data: T;
    column: ITableColumn<T>;
    size: ITableSize;
    scrolledX: boolean;
    flexGrow: number;
    selected?: boolean;
    tableSettings: ITableSettings;
    dynamicRowHeight?: boolean;
    hovered?: boolean;
}

export const TableDataCell = observer(<T,>(props: IProps<T>) => {
    const renderedData = props.column.render(props.data, props.hovered);
    const width = props.tableSettings.columnWidths?.[props.column.field] ?? props.column.width;

    return (
        <div
            className={clsx(
                styles.cell,
                props.selected && styles.selected,
                props.column.index && styles.index,
                props.scrolledX && styles.scrolledX,
                props.dynamicRowHeight && styles.dynamicRowHeight,
            )}
            style={{ width, flexGrow: props.flexGrow }}
        >
            {typeof renderedData === "string" ? (
                props.column.wrap ? (
                    <Typo variant={props.size === "large" ? "bodyXL" : "bodyL"}>
                        {renderedData}
                    </Typo>
                ) : (
                    <TooltipTypo
                        variant={props.size === "large" ? "bodyXL" : "bodyL"}
                        fullWidth={false}
                    >
                        {renderedData}
                    </TooltipTypo>
                )
            ) : (
                renderedData
            )}
        </div>
    );
});
