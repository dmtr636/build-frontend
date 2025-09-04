import { LayoutStore } from "src/features/layout/LayoutStore.ts";

export const layoutStore = new LayoutStore();

export const appStore = {
    layoutStore,
};
