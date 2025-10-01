import { makeAutoObservable } from "mobx";

export class LayoutStore {
    isMobile = window.innerWidth < 768;
    tabBarHeight = 0;
    scrolled = false;
    overflowed = false;
    scrollTop = 0;
    overflowHidden = false;
    headerProps: {
        title: string;
        actions?: {
            icon: React.ReactNode;
            onClick?: () => void;
            /* type?: "primary" | "secondary";*/
            counter?: number;
        }[];
        buttonBack?: boolean;
        /* badge?: { text: string; type?: "warning" | "negative" | "positive" | "info" };*/
    } = { title: "Объекты" };

    constructor() {
        makeAutoObservable(this);
    }

    setHeaderProps(headerProps: {
        title: string;
        showNotification?: boolean;
        actions?: {
            icon: React.ReactNode;
            onClick?: () => void;
            /* type?: "primary" | "secondary";*/
            counter?: number;
        }[];
        buttonBack?: boolean;
        hide?: boolean;
        /* badge?: { text: string; type?: "warning" | "negative" | "positive" | "info" };*/
    }) {
        this.headerProps = headerProps;
    }
}
