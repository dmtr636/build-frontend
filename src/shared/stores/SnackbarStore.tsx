import { makeAutoObservable } from "mobx";
import { v4 } from "uuid";
import { ReactNode } from "react";
import { IconSuccess } from "src/ui/assets/icons";

export interface SnackbarDataAdditionalOptions {
    actionButtonLabel?: string;
    onActionButtonClick?: () => void;
    showCloseButton?: boolean;
    icon?: ReactNode;
    delayMs?: number;
}

export interface SnackbarData extends SnackbarDataAdditionalOptions {
    id: string;
    message: string;
    mode: "positive" | "negative" | "neutral";
    removing?: boolean;
}

export class SnackbarStore {
    snackbars: SnackbarData[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    get count() {
        return this.snackbars.length;
    }

    shift() {
        return this.snackbars.shift();
    }

    showPositiveSnackbar(message: string, options?: SnackbarDataAdditionalOptions) {
        this.snackbars.push({ id: v4(), message, mode: "positive", ...options });
    }

    showNegativeSnackbar(message: string, options?: SnackbarDataAdditionalOptions) {
        this.snackbars.push({ id: v4(), message, mode: "negative", ...options });
    }

    showNeutralSnackbar(message: string, options?: SnackbarDataAdditionalOptions) {
        this.snackbars.push({ id: v4(), message, mode: "neutral", ...options });
    }

    showNeutralPositiveSnackbar(message: string, options?: SnackbarDataAdditionalOptions) {
        this.snackbars.push({
            id: v4(),
            message,
            mode: "neutral",
            icon: <IconSuccess />,
            ...options,
        });
    }

    remove(id: string) {
        this.snackbars = this.snackbars.filter((snackbar) => snackbar.id !== id);
    }
}

export const snackbarStore = new SnackbarStore();
