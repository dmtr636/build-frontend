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

            counter?: number;
        }[];
        buttonBack?: boolean;
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

            counter?: number;
        }[];
        buttonBack?: boolean;
        onClickBack?: () => void;
        hide?: boolean;
    }) {
        this.headerProps = headerProps;
    }
}
