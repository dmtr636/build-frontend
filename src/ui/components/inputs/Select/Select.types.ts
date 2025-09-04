import { ReactNode } from "react";

export interface SelectOption<T> {
    name: string;
    value: T;
    icon?: ReactNode;
    listItemIcon?: ReactNode;
    renderOption?: () => ReactNode;
}

export type SelectSize = "large" | "medium";
