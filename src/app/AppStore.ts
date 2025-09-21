import { LayoutStore } from "src/features/layout/LayoutStore.ts";
import { AccountStore } from "src/features/users/stores/AccountStore.ts";
import { UserStore } from "src/features/users/stores/UserStore.ts";
import { EventsStore } from "src/features/events/EventsStore.ts";
import { OrganizationsStore } from "src/features/organizations/OrganizationsStore.ts";
import { WebsocketStore } from "src/features/websocket/stores/WebsocketStore.ts";
import { RegistryStore } from "src/features/registry/RegistryStore.ts";

export const layoutStore = new LayoutStore();
export const accountStore = new AccountStore();
export const userStore = new UserStore();
export const eventsStore = new EventsStore();
export const organizationsStore = new OrganizationsStore();
export const websocketStore = new WebsocketStore();
export const registryStore = new RegistryStore();

export const appStore = {
    layoutStore,
    accountStore,
    userStore,
    eventsStore,
    organizationsStore,
    websocketStore,
    registryStore,
};
