import { ReactNode } from "react";

export interface DropdownListOption<T = string> {
    name: ReactNode;
    value?: T;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    iconAfter?: ReactNode;
    listItemIcon?: ReactNode;
    mode?: "accent" | "neutral" | "negative" | "brand";
    children?: DropdownListOption<T>[];
    subMenuKey?: string;
    renderOption?: () => ReactNode;
}

export interface MultipleDropdownListOption<T> extends DropdownListOption<T> {
    value: T;
}

export type DropdownListOptions<T = string> = DropdownListOption<T>[] | DropdownListOption<T>[][];

export type MultipleDropdownListOptions<T> =
    | MultipleDropdownListOption<T>[]
    | MultipleDropdownListOption<T>[][];

export type DropdownListMode = "accent" | "neutral" | "brand";
export type DropdownListSize = "large" | "medium";
