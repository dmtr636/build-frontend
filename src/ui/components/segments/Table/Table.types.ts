import { ReactNode } from "react";

export interface ITableColumn<T> {
    name: ReactNode;
    field: string;
    width: number;
    render: (data: T, hovered?: boolean) => ReactNode;
    index?: boolean;
    sort?: boolean;
    resizable?: boolean;
    wrap?: boolean;
}

export type ITableSize = "large" | "compact";

export interface ITableSettings {
    compactMode: boolean;
    quickView: boolean;
    openPageInNewTab: boolean;
    columns: string[];
    columnWidths?: Record<string, number>;
}
