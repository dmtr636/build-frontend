import { ReactNode } from "react";

export interface ITableColumn<T> {
    name: ReactNode;
    field: string;
    width: number;
    render: (data: T) => ReactNode;
    index?: boolean;
    sort?: boolean;
}

export type ITableSize = "large" | "compact";

export interface ITableSettings {
    compactMode: boolean;
    quickView: boolean;
    openPageInNewTab: boolean;
    columns: string[];
    columnWidths?: Record<string, number>;
}
