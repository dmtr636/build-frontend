import { ReactNode } from "react";

export interface AutocompleteOption<T = string> {
    name: string;
    value: T;
    icon?: ReactNode;
}

export type AutocompleteSize = "large" | "medium";
