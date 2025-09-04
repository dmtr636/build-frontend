import { makeAutoObservable } from "mobx";
import { getWindowDimensions } from "src/shared/utils/useWindowDimensions.ts";

export class SidebarStore {
    collapsed =
        getWindowDimensions().width < 768
            ? true
            : localStorage.getItem("sidebarCollapsed") === "true";

    constructor() {
        makeAutoObservable(this);
    }
}

export const sidebarStore = new SidebarStore();
