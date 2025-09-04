import { makeAutoObservable } from "mobx";

export class LoaderStore {
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    start() {
        this.loading = true;
    }

    finish() {
        this.loading = false;
    }
}
