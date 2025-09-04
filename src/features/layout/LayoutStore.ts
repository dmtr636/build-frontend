import { makeAutoObservable } from "mobx";

export class LayoutStore {
    isMobile = window.innerWidth < 768;
    tabBarHeight = 0;

    constructor() {
        makeAutoObservable(this);
    }
}
