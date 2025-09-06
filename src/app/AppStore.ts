import { LayoutStore } from "src/features/layout/LayoutStore.ts";
import { AccountStore } from "src/features/users/stores/AccountStore.ts";
import { UserStore } from "src/features/users/stores/UserStore.ts";

export const layoutStore = new LayoutStore();
export const accountStore = new AccountStore();
export const userStore = new UserStore();
export const appStore = {
    layoutStore,
    accountStore,
    userStore,
};
